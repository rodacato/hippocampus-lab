# hippocampus-lab

> Experimental memory architectures for LLMs - understanding how brains remember to build better AI memory

## Vision

This project is **foundational research** toward building a cognitive memory system for LLMs. The goal is not just benchmarking—it's understanding:

1. **How human memory works** - mechanisms, not just metaphors
2. **How to replicate it** - translating cognitive science into working code
3. **How to give LLMs better memory** - beyond naive "add everything to context"

### Long-term Roadmap

```
hippocampus-lab (this project)     →  Understand mechanisms, test techniques
         ↓
   Memory Module / MCP             →  Production-ready memory system
         ↓
   Personal Assistant              →  AI with true persistent memory
```

This repository is the **laboratory**—where we experiment, fail, learn, and build intuition.

## The Problem

LLMs have a memory problem:

- **Expensive context** - tokens = money, and context windows aren't free
- **"Lost in the Middle"** - precision degrades for information in the middle of long prompts
- **Effective context < declared** - 1M token window ≠ 1M tokens of useful reasoning (~30-60%)
- **No persistence** - every session starts from zero

## The Hypothesis

Inspired by human memory and recent research (Harvard, MIT CSAIL), we believe:

> **Selective, structured memory beats naive "add everything" approaches.**

The brain doesn't remember everything—it forgets strategically. We want to understand *why* and *how*.

## What We're Testing

| Technique | Inspiration | Expected Impact |
|-----------|-------------|-----------------|
| Baseline (full context) | Control | Reference point |
| Baseline (random subset) | Control | "Any context helps?" |
| Baseline (recency-only) | Control | "Only recent matters?" |
| Summarization | MemGPT | 70-90% token reduction |
| Context Pruning | SNR theory | 10-15% noise reduction |
| Selective Memory | Harvard study | +10% accuracy |
| Sliding Window | Recency bias | Balance old/new |
| ACT-R Activation | Cognitive psychology | Decay + relevance |
| Compression | KVzip | 3-4x reduction |

## Key Concepts

See [docs/glossary.md](docs/glossary.md) for detailed definitions. Quick reference:

| Concept | What it means |
|---------|---------------|
| **ACT-R** | Cognitive architecture modeling memory activation and decay |
| **Primacy/Recency** | We remember beginnings and endings better than middles |
| **Von Restorff Effect** | Distinctive information is remembered better |
| **Spreading Activation** | Activating one memory activates related ones |
| **Reconstructive Memory** | Memories are rebuilt, not retrieved verbatim |

## Project Structure

```
hippocampus-lab/
├── docs/
│   ├── research.md       # Theoretical foundations
│   ├── experiments.md    # Experiment designs
│   ├── glossary.md       # Cognitive science concepts
│   └── references.md     # Papers & resources
│
├── src/
│   ├── types.ts          # TypeScript interfaces
│   ├── datasets/         # Test conversations
│   ├── techniques/       # Memory implementations
│   ├── evaluation/       # Metrics & scoring
│   └── runner.ts         # Experiment orchestrator
│
├── results/              # Experiment outputs
├── PLAN.md               # Implementation plan
└── README.md
```

## Quick Start

```bash
git clone https://github.com/rodacato/hippocampus-lab.git
cd hippocampus-lab
bun install

# Run baseline experiment
bun run experiment:baseline

# Dry run (no API calls)
bun run experiment:baseline --dry-run
```

## CLI Tools

Experiments use LLM CLIs for one-shot inference:

| Tool | Usage |
|------|-------|
| Claude Code | `claude -p "prompt"` |
| Gemini CLI | `gemini -p "prompt"` |
| Codex | `codex -q "prompt"` |

## Metrics

### Objective (no LLM bias)

| Metric | Description |
|--------|-------------|
| Exact Match | Response contains expected answer verbatim |
| Entity F1 | Precision/recall on key entities mentioned |
| Token Usage | Input/output tokens consumed |
| Latency | Time to first token, total time |

### Subjective (LLM-as-judge, calibrated with humans)

| Metric | Description |
|--------|-------------|
| Coherence | Does response fit conversation history? |
| Fluency | Is the response well-formed? |

## Documentation

- **[Glossary](docs/glossary.md)** - Key concepts from cognitive science
- **[Research](docs/research.md)** - Theoretical foundations
- **[Experiments](docs/experiments.md)** - Detailed methodology
- **[References](docs/references.md)** - Papers & implementations
- **[Plan](PLAN.md)** - Current implementation status

## Philosophy

> "The art of memory is the art of attention." — Samuel Johnson

We're not trying to make LLMs remember *everything*. We're trying to make them remember *what matters*—like humans do. Sometimes forgetting is a feature, not a bug.

## Roadmap

- [x] Research phase - theoretical foundations
- [x] Experiment design
- [ ] Infrastructure setup
- [ ] Multiple baselines (full, random, recency)
- [ ] Dataset generation (n≥30 per condition)
- [ ] Baseline experiments
- [ ] Technique experiments
- [ ] Analysis & insights
- [ ] → Next project: Memory MCP

## License

MIT
