# hippocampus-lab

> Experimental memory architectures for LLMs - because context windows forget too easily

## The Problem

LLMs have a memory problem:

- Context windows are expensive (tokens = money)
- "Lost in the Middle" - precision degrades in long contexts
- Effective context is ~30-60% of advertised window
- No persistent memory across sessions

## The Hypothesis

Inspired by human memory and recent research (Harvard, MIT CSAIL), we believe **selective, structured memory** beats naive "add everything" approaches.

## What We're Testing

| Technique        | Expected Impact         | Based On      |
| ---------------- | ----------------------- | ------------- |
| Baseline         | Reference point         | -             |
| Summarization    | 70-90% token reduction  | MemGPT        |
| Context Pruning  | 10-15% SNR improvement  | -             |
| Selective Memory | +10% accuracy           | Harvard study |
| Sliding Window   | Balance recency/history | -             |
| Compression      | 3-4x reduction          | KVzip         |

## Project Structure

```
hippocampus-lab/
├── docs/                      # Research & documentation
│   ├── research.md            # Theoretical foundations
│   ├── experiments.md         # Experiment designs
│   └── references.md          # Papers & resources
│
├── src/
│   ├── techniques/            # Memory implementations
│   │   ├── baseline.ts
│   │   ├── summarization.ts
│   │   ├── pruning.ts
│   │   ├── selective.ts
│   │   ├── sliding-window.ts
│   │   └── compression.ts
│   │
│   ├── evaluation/            # Metrics & scoring
│   │   ├── metrics.ts
│   │   ├── scorer.ts          # LLM-as-judge
│   │   └── reporter.ts
│   │
│   ├── datasets/              # Test data
│   │   ├── generator.ts
│   │   └── samples/
│   │
│   └── runner.ts              # Experiment orchestrator
│
├── results/                   # Experiment outputs
├── package.json
├── tsconfig.json
└── README.md
```

## CLI Tools

Experiments use LLM CLIs for one-shot inference:

| Tool        | Usage                          |
| ----------- | ------------------------------ |
| Claude Code | `claude -p "prompt" < input`   |
| Gemini CLI  | `gemini -p "prompt" < input`   |
| Codex       | `codex -q "prompt" < input`    |

## Quick Start

```bash
# Clone
git clone https://github.com/rodacato/hippocampus-lab.git
cd hippocampus-lab

# Install
bun install  # or npm install

# Setup API keys
cp .env.example .env
# Add your ANTHROPIC_API_KEY and OPENAI_API_KEY

# Run baseline experiment
bun run experiment:baseline

# Run all experiments
bun run experiment:all
```

## Metrics

| Metric          | What it measures            |
| --------------- | --------------------------- |
| Token Savings   | % reduction vs baseline     |
| TTFT            | Time to first token         |
| Recall Accuracy | Can it remember early info? |
| Coherence (1-5) | LLM-as-judge score          |

## Documentation

- **[Research](docs/research.md)** - Theoretical foundations, ACT-R model, memory types
- **[Experiments](docs/experiments.md)** - Detailed experiment designs and methodology
- **[References](docs/references.md)** - Papers, implementations, and resources

## Roadmap

- [x] Research phase - theoretical foundations
- [x] Experiment design
- [ ] Repository setup
- [ ] Dataset generation
- [ ] Baseline implementation
- [ ] Technique implementations
- [ ] Analysis & conclusions

## License

MIT
