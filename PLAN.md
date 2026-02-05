# Plan: hippocampus-lab Experiment Implementation

## Overview

Build infrastructure to experiment with LLM memory techniques, understand cognitive mechanisms, and establish baselines for future memory systems.

**Goal:** Not just benchmarking—building intuition about what works and why.

---

## Architecture

```
hippocampus-lab/
├── package.json
├── tsconfig.json
├── src/
│   ├── types.ts                    # All TypeScript interfaces
│   ├── datasets/
│   │   ├── loader.ts               # Load/validate JSON datasets
│   │   └── samples/                # Test conversations (n≥30)
│   │       ├── identity-01.json
│   │       ├── identity-02.json
│   │       └── ...
│   ├── techniques/
│   │   ├── base.ts                 # Abstract technique class
│   │   ├── baseline-full.ts        # Full context (upper bound)
│   │   ├── baseline-none.ts        # No context (lower bound)
│   │   ├── baseline-random.ts      # Random subset (control)
│   │   ├── baseline-recency.ts     # Last N only (control)
│   │   ├── summarization.ts        # Incremental summarization
│   │   ├── selective.ts            # Relevance-based selection
│   │   └── actr.ts                 # ACT-R activation model
│   ├── cli/
│   │   └── executor.ts             # Execute CLI commands
│   ├── evaluation/
│   │   ├── objective.ts            # Exact match, Entity F1
│   │   ├── subjective.ts           # LLM-as-judge (calibrated)
│   │   └── aggregator.ts           # Statistics & reporting
│   └── runner.ts                   # Experiment orchestrator
├── results/
│   ├── raw/                        # Raw execution results
│   ├── scored/                     # Evaluated results
│   └── reports/                    # Final analysis
└── PLAN.md
```

---

## Key Design Decisions

### 1. Multiple Baselines

A single baseline isn't enough to interpret results:

| Baseline | Purpose | What it tells us |
|----------|---------|------------------|
| **Full context** | Upper bound | Maximum information available |
| **Random subset** | Control | "Does any context help?" |
| **Recency-only** | Control | "Is only recent info needed?" |
| **No context** | Lower bound | Model's prior knowledge only |

If a technique beats "random" but not "recency," that's meaningful.

### 2. Objective + Subjective Metrics

**Objective (no LLM bias):**
```typescript
interface ObjectiveScores {
  exactMatch: boolean;           // Response contains expected answer
  entityRecall: number;          // What % of expected entities were mentioned
  tokenCount: number;            // Input tokens used
  latencyMs: number;             // Response time
}
```

**Subjective (LLM-as-judge, calibrated with ~20% human evaluation):**
```typescript
interface SubjectiveScores {
  coherence: number;             // 1-5: Fits conversation history
  fluency: number;               // 1-5: Well-formed response
  humanAgreement?: number;       // Calibration score
}
```

### 3. Saliency-Controlled Datasets

To test position effects (Lost in the Middle), we must control for saliency:

```typescript
interface TurnMetadata {
  containsKeyInfo: boolean;
  keyInfoType: 'identity' | 'preference' | 'fact' | 'instruction';
  salienceLevel: 'high' | 'medium' | 'low';    // NEW
  semanticCategory: string;                     // NEW: for fair comparison
}
```

**Dataset design principle:** Same-salience information distributed across positions.

### 4. Statistical Rigor

- **Sample size:** n ≥ 30 conversations per condition
- **Confidence intervals:** Report 95% CI on all metrics
- **Multiple comparisons:** Bonferroni correction when comparing techniques
- **Effect sizes:** Report Cohen's d, not just p-values

### 5. Three-Phase Execution

Separation allows re-evaluation and human calibration:

```
Phase 1: Execute    →  results/raw/{timestamp}.jsonl
Phase 2: Evaluate   →  results/scored/{timestamp}.jsonl
Phase 3: Aggregate  →  results/reports/{timestamp}.md
```

### 6. Configuration Decisions

These decisions were made to keep the experiment simple and model-independent:

| Decision | Value | Rationale |
|----------|-------|-----------|
| **Context selection (k)** | `min(50%, maxTurns)` with `maxTurns=20` | Balances relative comparison with cost control |
| **Entity evaluation** | Recall-only (predefined list) | Avoids need for entity extraction; precision requires knowing what model "predicted" |
| **Model selection** | CLI default | Model-independent baselines; document which model was used |
| **System prompt** | Fixed minimal | Ensures model understands the task without introducing variability |
| **Dataset generation** | LLM-generated + manual validation | Natural conversations with controlled structure |

**System prompt (fixed for all experiments):**

```text
You are a helpful assistant. Answer based on the conversation history provided.
```

---

## Implementation Steps

### Step 1: Project Setup

```bash
bun init
```

**package.json:**
```json
{
  "name": "hippocampus-lab",
  "scripts": {
    "experiment:run": "bun run src/runner.ts run",
    "experiment:eval": "bun run src/runner.ts evaluate",
    "experiment:report": "bun run src/runner.ts report"
  }
}
```

### Step 2: Type Definitions (`src/types.ts`)

```typescript
// === Dataset Types ===
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    containsKeyInfo: boolean;
    keyInfoType?: 'identity' | 'preference' | 'fact' | 'instruction';
    salienceLevel?: 'high' | 'medium' | 'low';
    semanticCategory?: string;
  };
}

export interface RecallQuestion {
  question: string;
  expectedAnswer: string;
  expectedEntities: string[];      // For entity F1
  infoLocation: 'early' | 'middle' | 'recent';
  salienceLevel: 'high' | 'medium' | 'low';
}

export interface TestConversation {
  id: string;
  turns: ConversationTurn[];
  recallQuestions: RecallQuestion[];
}

// === Execution Types ===
export interface ExecutionResult {
  experimentId: string;
  timestamp: string;
  technique: string;
  cli: 'claude' | 'gemini' | 'codex';
  conversationId: string;
  questionIndex: number;
  prompt: string;
  response: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
}

// === Evaluation Types ===
export interface EvaluatedResult extends ExecutionResult {
  objective: {
    exactMatch: boolean;
    entityRecall: number;        // Simplified: only recall (see FAQ)
  };
  subjective: {
    coherence: number;
    fluency: number;
  };
}

// === Aggregation Types ===
export interface TechniqueReport {
  technique: string;
  n: number;
  metrics: {
    avgTokens: number;
    avgLatencyMs: number;
    exactMatchRate: number;
    avgEntityRecall: number;
    avgCoherence: number;
    ci95: {  // 95% confidence intervals
      exactMatchRate: [number, number];
      entityRecall: [number, number];
    };
  };
}
```

### Step 3: Sample Datasets

**Minimum:** 30 conversations with controlled design.

**Design matrix:**
- 10 identity-heavy conversations
- 10 technical discussions
- 10 multi-topic conversations

Each with:
- 5 recall questions (2 early, 2 middle, 1 recent)
- Controlled saliency levels
- Ground truth entities for F1 calculation

### Step 4: Dataset Loader

```typescript
// src/datasets/loader.ts
export function loadDataset(path: string): TestConversation
export function loadAllDatasets(dir: string): TestConversation[]
export function validateDataset(data: unknown): asserts data is TestConversation
```

### Step 5: CLI Executor

```typescript
// src/cli/executor.ts
export interface ExecutorConfig {
  cli: 'claude' | 'gemini' | 'codex';
  temperature?: number;        // Default: 0 for reproducibility
  maxRetries?: number;         // Default: 3
  retryDelayMs?: number;       // Default: 1000 (exponential backoff)
  timeoutMs?: number;          // Default: 30000
}

export class CLIExecutor {
  constructor(private config: ExecutorConfig) {}

  async execute(prompt: string): Promise<{
    response: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs: number;
  }>

  // Internal: retry with exponential backoff
  private async executeWithRetry(
    prompt: string,
    attempt: number
  ): Promise<ExecutionResult>
}
```

**Implementation notes:**

- Use `Bun.spawn` for subprocess execution
- Support `--dry-run` mode for testing (returns mock responses)
- Implement exponential backoff: `delay = retryDelayMs * 2^attempt`
- Handle common errors: rate limits (429), timeouts, malformed output
- Log all retries for debugging
- Set `temperature=0` by default for reproducibility

### Step 6: Baseline Techniques

**Configuration:**
```typescript
// src/techniques/config.ts
export const TECHNIQUE_CONFIG = {
  maxTurns: 20,                    // Cap for subset techniques
  contextRatio: 0.5,               // 50% of conversation
  systemPrompt: 'You are a helpful assistant. Answer based on the conversation history provided.',
};

// Calculate k for a conversation
export function calculateK(totalTurns: number): number {
  return Math.min(
    Math.floor(totalTurns * TECHNIQUE_CONFIG.contextRatio),
    TECHNIQUE_CONFIG.maxTurns
  );
}
```

**Full context (upper bound):**
```typescript
buildPrompt(conversation, question): string {
  const history = conversation.turns
    .map(t => `${t.role}: ${t.content}`)
    .join('\n\n');
  return `${SYSTEM_PROMPT}\n\n${history}\n\nUser: ${question.question}`;
}
```

**No context (lower bound):**
```typescript
buildPrompt(conversation, question): string {
  return `${SYSTEM_PROMPT}\n\nUser: ${question.question}`;
}
```

**Random subset (control):**
```typescript
buildPrompt(conversation, question): string {
  const k = calculateK(conversation.turns.length);
  const selected = randomSample(conversation.turns, k);
  const history = selected.map(t => `${t.role}: ${t.content}`).join('\n\n');
  return `${SYSTEM_PROMPT}\n\n${history}\n\nUser: ${question.question}`;
}
```

**Recency-only (control):**
```typescript
buildPrompt(conversation, question): string {
  const k = calculateK(conversation.turns.length);
  const recent = conversation.turns.slice(-k);
  const history = recent.map(t => `${t.role}: ${t.content}`).join('\n\n');
  return `${SYSTEM_PROMPT}\n\n${history}\n\nUser: ${question.question}`;
}
```

### Step 7: Objective Evaluation

```typescript
// src/evaluation/objective.ts

export function exactMatch(response: string, expected: string): boolean {
  return response.toLowerCase().includes(expected.toLowerCase());
}

// Simplified: only recall using predefined entity list (see FAQ for alternatives)
export function entityRecall(
  response: string,
  expectedEntities: string[]
): number {
  if (expectedEntities.length === 0) return 1;

  const found = expectedEntities.filter(entity =>
    response.toLowerCase().includes(entity.toLowerCase())
  );

  return found.length / expectedEntities.length;
}
```

### Step 8: Subjective Evaluation (LLM-as-judge)

```typescript
// src/evaluation/subjective.ts

const JUDGE_PROMPT = `
You are evaluating an AI assistant's response for quality.

## Conversation History
${conversationContext}

## Question Asked
"${question}"

## Response to Evaluate
"${response}"

## Scoring Criteria (1-5 scale)

**Coherence:** Does the response fit naturally with the conversation?
- 5: Perfectly consistent with all prior context
- 3: Minor inconsistencies or missed references
- 1: Contradicts or ignores conversation history

**Fluency:** Is the response well-formed and clear?
- 5: Clear, well-structured, appropriate length
- 3: Understandable but awkward or verbose
- 1: Confusing, incomplete, or poorly written

IMPORTANT: Do NOT evaluate factual correctness. Only evaluate coherence and fluency.

Respond ONLY with JSON: {"coherence": N, "fluency": N, "reasoning": "brief explanation"}
`;

export async function judgeResponse(
  executor: CLIExecutor,
  conversationContext: string,  // Full conversation for context
  question: string,
  response: string
): Promise<{ coherence: number; fluency: number; reasoning: string }>
```

### Step 9: Runner with Phases

```typescript
// src/runner.ts

// Phase 1: Execute experiments
async function runExperiments(config: RunConfig): Promise<void> {
  for (const dataset of datasets) {
    for (const question of dataset.recallQuestions) {
      for (const technique of techniques) {
        const prompt = technique.buildPrompt(dataset, question);
        const result = await executor.execute(prompt);
        await appendToFile(`results/raw/${timestamp}.jsonl`, {
          technique: technique.name,
          conversationId: dataset.id,
          questionIndex,
          prompt,
          ...result
        });
      }
    }
  }
}

// Phase 2: Evaluate results
async function evaluateResults(rawFile: string): Promise<void> {
  for await (const result of readJsonLines(rawFile)) {
    const objective = evaluateObjective(result);
    const subjective = await evaluateSubjective(result);
    await appendToFile(`results/scored/${timestamp}.jsonl`, {
      ...result,
      objective,
      subjective
    });
  }
}

// Phase 3: Generate report
async function generateReport(scoredFile: string): Promise<void> {
  const results = await readAllJsonLines(scoredFile);
  const byTechnique = groupBy(results, r => r.technique);
  const report = calculateStatistics(byTechnique);
  await writeReport(`results/reports/${timestamp}.md`, report);
}
```

---

## CLI Commands

```bash
# Full pipeline
bun run experiment:run --techniques baseline-full,baseline-random,selective
bun run experiment:eval --input results/raw/2024-01-15.jsonl
bun run experiment:report --input results/scored/2024-01-15.jsonl

# Quick iteration
bun run experiment:run --dry-run --techniques baseline-full

# Single technique test
bun run experiment:run --techniques baseline-full --datasets identity-01.json
```

---

## Verification Checklist

1. [ ] `bun install` succeeds
2. [ ] `bun run experiment:run --dry-run` works without API calls
3. [ ] Sample dataset validates correctly
4. [ ] Objective metrics calculate correctly (test with known inputs)
5. [ ] Three-phase pipeline produces expected output files
6. [ ] Report includes confidence intervals

---

## Status

### Phase 1: Infrastructure
- [ ] Project setup (package.json, tsconfig)
- [ ] Type definitions
- [ ] CLI executor
- [ ] Dataset loader

### Phase 2: Baselines

- [ ] Full context baseline (upper bound)
- [ ] No context baseline (lower bound)
- [ ] Random subset baseline (control)
- [ ] Recency-only baseline (control)

### Phase 3: Evaluation

- [ ] Objective metrics (exact match, entity recall)
- [ ] Subjective metrics (LLM-as-judge)
- [ ] Statistics & reporting

### Phase 4: Datasets
- [ ] Design dataset schema with saliency control
- [ ] Generate 30+ test conversations
- [ ] Validate and review

### Phase 5: Experiments
- [ ] Run baseline experiments
- [ ] Analyze results
- [ ] Document insights

---

## Future Techniques (after baselines)

Once baselines are established:

1. **Summarization** - Compress old context
2. **Selective (Harvard)** - Relevance-based filtering
3. **ACT-R Activation** - Decay + frequency + spreading activation
4. **Sliding Window + Summary** - Hybrid approach
5. **Compression** - KVzip-inspired entity extraction

---

## FAQ: Design Alternatives

### Why only entity recall, not precision/F1?

**Current approach:** We use a predefined list of expected entities per question and check if they appear in the response.

**The problem with precision:** To calculate precision, we need to know what entities the model "predicted" (mentioned in its response). This requires entity extraction, which adds complexity:

| Alternative | How it works | Trade-offs |
| ----------- | ------------ | ---------- |
| **Regex extraction** | Match capitalized words, numbers, emails | Fast but noisy (false positives like "The", "I") |
| **LLM extraction** | Ask another LLM to extract entities | Accurate but expensive (+1 API call per response) |
| **Predefined list (current)** | Only check expected entities | Simple, deterministic, but only measures recall |

**When to switch:** If we observe that models are "hallucinating" entities (mentioning things not in the conversation), precision becomes important. For now, recall answers our main question: "Did the model remember the information?"

### Why not use a larger context window?

We cap subset techniques at `maxTurns=20` to:

1. Keep experiments model-independent (works with any context window)
2. Control API costs
3. Force techniques to be selective (the interesting part)

If results show `maxTurns=20` is too restrictive, we can increase it. The hybrid formula `min(50%, maxTurns)` makes this easy to adjust.

### Why a fixed system prompt?

Without a system prompt, models may not understand they should use the conversation history. With a variable prompt, we introduce confounding factors.

A fixed minimal prompt ("You are a helpful assistant. Answer based on the conversation history provided.") ensures:

- Model understands the task
- No variability between techniques
- Results are comparable
