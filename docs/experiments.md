# Experiments: Cognitive Memory for LLMs

## Objective

Evaluate each memory technique **in isolation** against a baseline, measuring:

- Token usage
- Response accuracy
- Latency
- Coherence in long contexts

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js / Bun
- **LLM Inference:** One-shot CLIs (Claude Code, Gemini CLI, Codex)
- **Evaluation:** LLM-as-judge via CLI

---

## CLI Tools for Inference

Experiments execute prompts via one-shot CLIs:

```bash
# Claude Code
claude -p "prompt with context and question" < dataset.json

# Gemini CLI
gemini -p "prompt with context and question" < dataset.json

# Codex
codex -q "prompt with context and question" < dataset.json
```

**Advantages of one-shot approach:**

- Stateless between calls (clean measurement)
- Easy to parallelize
- Reproducible
- Direct token metrics from CLI

---

## Repository Structure

```
hippocampus-lab/
├── src/
│   ├── techniques/
│   │   ├── baseline.ts        # No optimization
│   │   ├── summarization.ts   # Incremental summarization
│   │   ├── pruning.ts         # Context pruning
│   │   ├── selective.ts       # Selective memory (Harvard)
│   │   ├── sliding-window.ts  # Sliding window + summary
│   │   └── compression.ts     # KVzip-inspired
│   │
│   ├── evaluation/
│   │   ├── metrics.ts         # Metrics calculation
│   │   ├── scorer.ts          # LLM-as-judge for coherence
│   │   └── reporter.ts        # Report generation
│   │
│   ├── datasets/
│   │   ├── generator.ts       # Conversation generator
│   │   └── samples/           # Pre-generated datasets
│   │
│   └── runner.ts              # Experiment orchestrator
│
├── results/                   # Results in JSON/CSV
├── package.json
├── tsconfig.json
└── README.md
```

---

## Planned Experiments

### Experiment 0: Baseline

**Description:** Full context without any optimization. All history messages go to prompt.

**Configuration:**

```typescript
interface BaselineConfig {
  maxMessages: number;      // Message limit (e.g., 50, 100, 200)
  includeSystemPrompt: true;
}
```

**Metrics to capture:**

- Input tokens
- Output tokens
- Latency (TTFT + total)
- Recall accuracy for early information

---

### Experiment 1: Incremental Summarization

**Hypothesis:** Summarizing old messages reduces tokens 70-90% while maintaining key information.

**Implementation:**

```typescript
interface SummarizationConfig {
  keepRecentMessages: number;     // Recent messages without summarization (e.g., 10)
  summarizeEveryN: number;        // Summarize every N messages (e.g., 20)
  summaryMaxTokens: number;       // Summary limit (e.g., 500)
}
```

**Flow:**

1. Keep last N messages verbatim
2. Everything before: summarize with LLM via one-shot CLI
3. Prompt = system + summary + recent messages

**Compare vs Baseline:**

- How many tokens saved?
- Does it lose critical information?

---

### Experiment 2: Context Pruning

**Hypothesis:** Removing irrelevant tokens (greetings, fillers) improves SNR 10-15%.

**Implementation:**

```typescript
interface PruningConfig {
  removeGreetings: boolean;       // "Hello", "Thanks", etc.
  removeFillers: boolean;         // "um", "eh", "well"
  removeStopwords: boolean;       // Very common words
  minMessageLength: number;       // Discard very short messages
  customPatterns: RegExp[];       // Custom patterns
}
```

**Flow:**

1. Filter messages by patterns
2. Clean content of each message
3. Send "clean" context

---

### Experiment 3: Selective Memory (Harvard)

**Hypothesis:** Filtering by relevance to current query improves ~10% (Harvard study).

**Implementation:**

```typescript
interface SelectiveConfig {
  scoringMethod: 'embedding' | 'keyword' | 'llm';
  topK: number;                   // How many messages to retrieve
  recencyWeight: number;          // Recent message weight (0-1)
  relevanceThreshold: number;     // Minimum relevance threshold
}
```

**Flow:**

1. Receive user query
2. Calculate relevance of each history message
3. Select top-K most relevant
4. Prompt = system + selected messages + query

**Scoring methods:**

- **Embedding:** Cosine similarity with query
- **Keyword:** TF-IDF or keyword matching
- **LLM:** Ask LLM to rank relevance (via one-shot CLI)

---

### Experiment 4: Sliding Window + Summary

**Hypothesis:** Combining sliding window with past summary offers best balance.

**Implementation:**

```typescript
interface SlidingWindowConfig {
  windowSize: number;             // Messages in active window
  summaryUpdateFrequency: number; // Update summary every N messages
  summaryPosition: 'start' | 'end';
}
```

**Flow:**

1. Maintain window of last N messages
2. When exiting window: add to cumulative summary
3. Prompt = system + rolling_summary + window

---

### Experiment 5: Compression (KVzip-inspired)

**Hypothesis:** Compressing history representation reduces memory without losing accuracy.

**Implementation:**

```typescript
interface CompressionConfig {
  compressionRatio: number;       // Target ratio (e.g., 0.25 = 4x)
  method: 'extractive' | 'abstractive';
  preserveEntities: boolean;      // Keep names, dates, etc.
}
```

**Flow:**

1. Identify key information (entities, facts)
2. Compress narrative while keeping facts
3. Reconstruct compressed context

---

## Test Dataset

### Dataset Requirements

1. **Long conversations:** 50-200 turns
2. **Distributed information:** Important data at different points
3. **Recall questions:** "What did I tell you about X at the beginning?"
4. **Topic variety:** To test context switching

### Structure

```typescript
interface TestConversation {
  id: string;
  turns: Array<{
    role: 'user' | 'assistant';
    content: string;
    metadata?: {
      containsKeyInfo: boolean;
      keyInfoType?: 'identity' | 'preference' | 'fact' | 'instruction';
    };
  }>;
  recallQuestions: Array<{
    question: string;
    expectedAnswer: string;
    infoLocation: 'early' | 'middle' | 'recent';
  }>;
}
```

### Conversation Types

1. **Identity-heavy:** User shares preferences, name, personal context
2. **Technical discussion:** Debugging, architecture, code
3. **Multi-topic:** Changes topic multiple times
4. **Instruction-following:** User gives specific instructions early

---

## Metrics

### Quantitative

| Metric | Description | How to measure |
|--------|-------------|----------------|
| **Input Tokens** | Tokens sent to model | CLI output / SDK metadata |
| **Output Tokens** | Generated tokens | CLI output / SDK metadata |
| **Token Savings** | % reduction vs baseline | (baseline - technique) / baseline |
| **TTFT** | Time to First Token | Timestamp diff |
| **Total Latency** | Total response time | Timestamp diff |
| **Recall Accuracy** | % of recall questions correct | LLM-as-judge or exact match |

### Qualitative (LLM-as-Judge)

| Metric | Description | Scale |
|--------|-------------|-------|
| **Coherence** | Is the response coherent with history? | 1-5 |
| **Relevance** | Does it answer what was asked? | 1-5 |
| **Completeness** | Does it include all necessary information? | 1-5 |

### Evaluator Prompt (via CLI)

```bash
claude -p "You are evaluating an AI assistant's response quality.

## Context
The conversation had ${turnCount} turns.
The user asked: \"${recallQuestion}\"
Expected answer should include: \"${expectedInfo}\"

## Response to evaluate
\"${assistantResponse}\"

## Scoring (1-5 for each)
- Coherence: Does the response make sense given the conversation?
- Relevance: Does it answer what was asked?
- Completeness: Does it include all necessary information?
- Accuracy: Is the recalled information correct?

Respond in JSON: { coherence: N, relevance: N, completeness: N, accuracy: N, notes: \"...\" }"
```

---

## Execution Plan

### Phase 2a: Setup

- [ ] Setup TypeScript + configured CLIs
- [ ] Implement runner with multi-CLI support
- [ ] Create folder structure

### Phase 2b: Dataset

- [ ] Implement conversation generator
- [ ] Generate 10 test conversations
- [ ] Create recall questions for each
- [ ] Manually validate dataset

### Phase 2c: Baseline + Metrics

- [ ] Implement baseline experiment
- [ ] Implement metrics system
- [ ] Implement LLM-as-judge
- [ ] Run baseline and document results

### Phase 2d: Techniques

- [ ] Experiment 1: Summarization
- [ ] Experiment 2: Pruning
- [ ] Experiment 3: Selective Memory
- [ ] Experiment 4: Sliding Window
- [ ] Experiment 5: Compression

### Phase 2e: Analysis

- [ ] Compare results from all techniques
- [ ] Identify best combination
- [ ] Document findings

---

## Results

> Will be filled as experiments are completed.

### Comparison Table

| Technique | Tokens (avg) | Savings | Latency | Recall Acc | Coherence |
|-----------|--------------|---------|---------|------------|-----------|
| Baseline | - | 0% | - | - | - |
| Summarization | - | - | - | - | - |
| Pruning | - | - | - | - | - |
| Selective | - | - | - | - | - |
| Sliding Window | - | - | - | - | - |
| Compression | - | - | - | - | - |

### Key Findings

(To be documented)

### Best Combination

(To be determined)

---

## Links

- **Theoretical research:** [research.md](research.md)
- **References:** [references.md](references.md)
