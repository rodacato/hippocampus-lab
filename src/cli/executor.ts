/**
 * CLI executor for running LLM commands
 */

import { spawn } from 'node:child_process';
import type { ExecutorConfig, CLIType } from '../types.js';

export interface ExecutionResponse {
  response: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
}

export class CLIExecutionError extends Error {
  constructor(
    message: string,
    public exitCode: number | null,
    public stderr: string
  ) {
    super(message);
    this.name = 'CLIExecutionError';
  }
}

const DEFAULT_CONFIG: Required<Omit<ExecutorConfig, 'cli'>> = {
  temperature: 0,
  maxRetries: 3,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  dryRun: false,
};

/**
 * Get the CLI command and arguments for a given CLI type
 */
function getCLICommand(cli: CLIType): { command: string; args: string[] } {
  switch (cli) {
    case 'claude':
      return { command: 'claude', args: ['-p'] };
    case 'gemini':
      return { command: 'gemini', args: ['-p'] };
    case 'codex':
      return { command: 'codex', args: ['-p'] };
    default:
      throw new Error(`Unsupported CLI: ${cli}`);
  }
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a command with the given prompt
 */
async function executeCommand(
  cli: CLIType,
  prompt: string,
  timeoutMs: number
): Promise<{ stdout: string; stderr: string }> {
  const { command, args } = getCLICommand(cli);

  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args, prompt], {
      timeout: timeoutMs,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(new CLIExecutionError(error.message, null, stderr));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new CLIExecutionError(`CLI exited with code ${code}`, code, stderr));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Generate a mock response for dry-run mode
 */
function generateMockResponse(prompt: string): ExecutionResponse {
  // Extract the question from the prompt (last "User:" line)
  const lines = prompt.split('\n');
  const userLines = lines.filter(l => l.startsWith('User:'));
  const lastQuestion = userLines[userLines.length - 1]?.replace('User:', '').trim() || '';

  return {
    response: `[DRY RUN] Mock response to: "${lastQuestion.slice(0, 50)}..."`,
    inputTokens: Math.ceil(prompt.length / 4),
    outputTokens: 20,
    latencyMs: Math.random() * 100 + 50,
  };
}

export class CLIExecutor {
  private config: Required<ExecutorConfig>;

  constructor(config: ExecutorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a prompt and return the response
   */
  async execute(prompt: string): Promise<ExecutionResponse> {
    if (this.config.dryRun) {
      return generateMockResponse(prompt);
    }

    return this.executeWithRetry(prompt, 0);
  }

  /**
   * Execute with exponential backoff retry
   */
  private async executeWithRetry(prompt: string, attempt: number): Promise<ExecutionResponse> {
    const startTime = Date.now();

    try {
      const { stdout } = await executeCommand(
        this.config.cli,
        prompt,
        this.config.timeoutMs
      );

      const latencyMs = Date.now() - startTime;

      return {
        response: stdout.trim(),
        latencyMs,
        // Note: Token counts would need to be parsed from CLI output if available
      };
    } catch (error) {
      if (attempt < this.config.maxRetries - 1) {
        const delay = this.config.retryDelayMs * Math.pow(2, attempt);
        console.warn(
          `Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
          error instanceof Error ? error.message : error
        );
        await sleep(delay);
        return this.executeWithRetry(prompt, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Get the CLI type being used
   */
  get cli(): CLIType {
    return this.config.cli;
  }

  /**
   * Check if running in dry-run mode
   */
  get isDryRun(): boolean {
    return this.config.dryRun;
  }
}
