/**
 * Experiment runner - orchestrates the three-phase pipeline
 *
 * Phase 1: Execute experiments → results/raw/{timestamp}.jsonl
 * Phase 2: Evaluate results → results/scored/{timestamp}.jsonl
 * Phase 3: Aggregate report → results/reports/{timestamp}.md
 */

import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

import type {
  ExecutionResult,
  EvaluatedResult,
  RunConfig,
  CLIType,
  TestConversation,
  RecallQuestion,
} from './types.js';
import { loadAllDatasets } from './datasets/loader.js';
import { getTechniques } from './techniques/index.js';
import { CLIExecutor } from './cli/executor.js';
import { evaluateObjective } from './evaluation/objective.js';
import { judgeResponse, mockSubjectiveScores } from './evaluation/subjective.js';
import { generateReport, formatReportMarkdown } from './evaluation/aggregator.js';
import { formatTurns } from './techniques/config.js';

/**
 * Generate a timestamp-based experiment ID
 */
function generateExperimentId(): string {
  const now = new Date();
  return now.toISOString().split('T')[0] + '-' + now.getTime().toString(36);
}

/**
 * Ensure directory exists
 */
async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/**
 * Append a JSON line to a file
 */
async function appendJsonLine(path: string, data: unknown): Promise<void> {
  await appendFile(path, JSON.stringify(data) + '\n');
}

/**
 * Read JSON lines from a file
 */
async function* readJsonLines<T>(path: string): AsyncGenerator<T> {
  const fileStream = createReadStream(path);
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (line.trim()) {
      yield JSON.parse(line) as T;
    }
  }
}

/**
 * Read all JSON lines from a file into an array
 */
async function readAllJsonLines<T>(path: string): Promise<T[]> {
  const results: T[] = [];
  for await (const item of readJsonLines<T>(path)) {
    results.push(item);
  }
  return results;
}

// === Phase 1: Execute Experiments ===

interface RunOptions {
  techniques: string[];
  datasetsDir: string;
  cli: CLIType;
  outputDir: string;
  dryRun: boolean;
}

async function runExperiments(options: RunOptions): Promise<string> {
  const experimentId = generateExperimentId();
  const outputPath = join(options.outputDir, 'raw', `${experimentId}.jsonl`);

  await ensureDir(dirname(outputPath));

  console.log(`Starting experiment: ${experimentId}`);
  console.log(`  Techniques: ${options.techniques.join(', ')}`);
  console.log(`  CLI: ${options.cli}${options.dryRun ? ' (dry run)' : ''}`);
  console.log(`  Output: ${outputPath}`);

  const datasets = await loadAllDatasets(options.datasetsDir);
  console.log(`  Datasets: ${datasets.length}`);

  if (datasets.length === 0) {
    console.warn('No datasets found. Create some in', options.datasetsDir);
    return outputPath;
  }

  const techniques = getTechniques(options.techniques);
  const executor = new CLIExecutor({
    cli: options.cli,
    dryRun: options.dryRun,
  });

  let count = 0;
  const total = datasets.length * datasets[0].recallQuestions.length * techniques.length;

  for (const dataset of datasets) {
    for (let qIdx = 0; qIdx < dataset.recallQuestions.length; qIdx++) {
      const question = dataset.recallQuestions[qIdx];

      for (const technique of techniques) {
        const prompt = technique.buildPrompt(dataset, question);
        const startTime = Date.now();

        try {
          const response = await executor.execute(prompt);

          const result: ExecutionResult = {
            experimentId,
            timestamp: new Date().toISOString(),
            technique: technique.name,
            cli: options.cli,
            conversationId: dataset.id,
            questionIndex: qIdx,
            prompt,
            response: response.response,
            inputTokens: response.inputTokens,
            outputTokens: response.outputTokens,
            latencyMs: response.latencyMs,
          };

          await appendJsonLine(outputPath, result);
          count++;

          if (count % 10 === 0 || count === total) {
            console.log(`  Progress: ${count}/${total}`);
          }
        } catch (error) {
          console.error(`Error running ${technique.name} on ${dataset.id} q${qIdx}:`, error);
        }
      }
    }
  }

  console.log(`Completed ${count} executions`);
  return outputPath;
}

// === Phase 2: Evaluate Results ===

interface EvalOptions {
  inputPath: string;
  outputDir: string;
  datasetsDir: string;
  cli: CLIType;
  dryRun: boolean;
}

async function evaluateResults(options: EvalOptions): Promise<string> {
  const experimentId = options.inputPath.split('/').pop()?.replace('.jsonl', '') || 'unknown';
  const outputPath = join(options.outputDir, 'scored', `${experimentId}.jsonl`);

  await ensureDir(dirname(outputPath));

  console.log(`Evaluating: ${options.inputPath}`);
  console.log(`  Output: ${outputPath}`);

  // Load datasets to get expected answers
  const datasets = await loadAllDatasets(options.datasetsDir);
  const datasetMap = new Map(datasets.map(d => [d.id, d]));

  const executor = new CLIExecutor({
    cli: options.cli,
    dryRun: options.dryRun,
  });

  let count = 0;

  for await (const result of readJsonLines<ExecutionResult>(options.inputPath)) {
    const dataset = datasetMap.get(result.conversationId);
    if (!dataset) {
      console.warn(`Dataset not found: ${result.conversationId}`);
      continue;
    }

    const question = dataset.recallQuestions[result.questionIndex];
    if (!question) {
      console.warn(`Question not found: ${result.conversationId}[${result.questionIndex}]`);
      continue;
    }

    // Objective evaluation (no LLM needed)
    const objective = evaluateObjective(result.response, question);

    // Subjective evaluation (LLM-as-judge)
    let subjective;
    if (options.dryRun) {
      subjective = mockSubjectiveScores();
    } else {
      const conversationContext = formatTurns(dataset.turns);
      subjective = await judgeResponse(executor, conversationContext, question.question, result.response);
    }

    const evaluated: EvaluatedResult = {
      ...result,
      objective,
      subjective,
    };

    await appendJsonLine(outputPath, evaluated);
    count++;

    if (count % 10 === 0) {
      console.log(`  Evaluated: ${count}`);
    }
  }

  console.log(`Completed ${count} evaluations`);
  return outputPath;
}

// === Phase 3: Generate Report ===

interface ReportOptions {
  inputPath: string;
  outputDir: string;
  cli: CLIType;
}

async function generateReportFile(options: ReportOptions): Promise<string> {
  const experimentId = options.inputPath.split('/').pop()?.replace('.jsonl', '') || 'unknown';
  const outputPath = join(options.outputDir, 'reports', `${experimentId}.md`);

  await ensureDir(dirname(outputPath));

  console.log(`Generating report: ${options.inputPath}`);
  console.log(`  Output: ${outputPath}`);

  const results = await readAllJsonLines<EvaluatedResult>(options.inputPath);
  const report = generateReport(results, experimentId, options.cli);
  const markdown = formatReportMarkdown(report);

  await writeFile(outputPath, markdown);

  console.log(`Report generated with ${report.techniques.length} techniques`);
  return outputPath;
}

// === CLI Entry Point ===

function printUsage(): void {
  console.log(`
hippocampus-lab Experiment Runner

Usage:
  npx tsx src/runner.ts run [options]     Run experiments (Phase 1)
  npx tsx src/runner.ts evaluate [options] Evaluate results (Phase 2)
  npx tsx src/runner.ts report [options]   Generate report (Phase 3)

Options:
  --techniques <list>   Comma-separated technique names (default: all baselines)
  --datasets <dir>      Path to datasets directory (default: src/datasets/samples)
  --cli <name>          CLI to use: claude, gemini, codex (default: claude)
  --input <path>        Input file for evaluate/report phases
  --output <dir>        Output directory (default: results)
  --dry-run             Run without making actual API calls

Examples:
  npx tsx src/runner.ts run --dry-run
  npx tsx src/runner.ts run --techniques baseline-full,baseline-none
  npx tsx src/runner.ts evaluate --input results/raw/2024-01-15-abc.jsonl
  npx tsx src/runner.ts report --input results/scored/2024-01-15-abc.jsonl
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  // Parse options
  const getArg = (name: string, defaultValue: string): string => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
  };

  const hasFlag = (name: string): boolean => args.includes(`--${name}`);

  const cli = getArg('cli', 'claude') as CLIType;
  const outputDir = getArg('output', 'results');
  const datasetsDir = getArg('datasets', join(import.meta.dirname, 'datasets', 'samples'));
  const dryRun = hasFlag('dry-run');
  const techniques = getArg('techniques', 'baseline-full,baseline-none,baseline-random,baseline-recency').split(',');
  const inputPath = getArg('input', '');

  switch (command) {
    case 'run': {
      await runExperiments({
        techniques,
        datasetsDir,
        cli,
        outputDir,
        dryRun,
      });
      break;
    }

    case 'evaluate': {
      if (!inputPath) {
        console.error('Error: --input is required for evaluate command');
        process.exit(1);
      }
      await evaluateResults({
        inputPath,
        outputDir,
        datasetsDir,
        cli,
        dryRun,
      });
      break;
    }

    case 'report': {
      if (!inputPath) {
        console.error('Error: --input is required for report command');
        process.exit(1);
      }
      await generateReportFile({
        inputPath,
        outputDir,
        cli,
      });
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
