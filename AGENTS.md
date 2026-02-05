# AGENTS.md

> Context and instructions for AI coding agents working on this project.

## Identity

**Read [IDENTITY.md](IDENTITY.md) first.** It defines the persona you should adopt:
- Cognitive Systems Architect (researcher-engineer hybrid)
- Brutally honest, explains simply, proposes ideas with bases
- Pragmatic over academic, simple over clever

---

## Project Overview

**hippocampus-lab** is a research laboratory for experimenting with LLM memory techniques. The goal is understanding how to give LLMs better memory by learning from cognitive science.

**Current phase:** Infrastructure and baseline experiments

**End goal:** Build a memory MCP for a personal assistant with improved context management

---

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Bun (preferred) or Node.js
- **LLM CLIs:** `claude`, `gemini`, `codex` (one-shot execution)
- **No frameworks:** Keep dependencies minimal

---

## Project Structure

```
hippocampus-lab/
├── CLAUDE.md          # Points to AGENTS.md
├── AGENTS.md          # This file (agent context)
├── IDENTITY.md        # Agent persona definition
├── PLAN.md            # Current implementation plan
├── README.md          # Human-focused overview
├── docs/
│   ├── glossary.md    # Cognitive science definitions
│   ├── research.md    # Theoretical foundations
│   ├── experiments.md # Experiment designs
│   └── references.md  # Papers and links
├── src/               # (to be created)
│   ├── types.ts
│   ├── datasets/
│   ├── techniques/
│   ├── evaluation/
│   └── runner.ts
└── results/           # Experiment outputs
```

---

## Setup

```bash
# Install dependencies
bun install

# Run experiments (once implemented)
bun run experiment:baseline
bun run experiment:baseline --dry-run  # Without API calls
```

---

## Code Style

- **TypeScript:** Strict mode, explicit types for public APIs
- **Naming:** camelCase for variables/functions, PascalCase for types/classes
- **Files:** kebab-case (e.g., `sliding-window.ts`)
- **No classes unless necessary:** Prefer functions and plain objects
- **Comments:** Only when the "why" isn't obvious from code

---

## Key Documents to Read

| Document | When to Read |
|----------|--------------|
| [IDENTITY.md](IDENTITY.md) | Always (defines your persona) |
| [PLAN.md](PLAN.md) | Before implementing anything |
| [docs/glossary.md](docs/glossary.md) | When cognitive science terms appear |
| [docs/research.md](docs/research.md) | For theoretical context |
| [docs/experiments.md](docs/experiments.md) | For experiment methodology |

---

## Testing

```bash
# Dry run (no API calls, mock responses)
bun run experiment:baseline --dry-run

# Validate datasets
bun run validate:datasets
```

---

## Conventions

### Commits

- Descriptive messages, no co-author line unless requested
- Format: `<type>: <description>` (e.g., `feat: add baseline technique`)

### Documentation

- Update glossary when introducing new cognitive science terms
- Keep PLAN.md status checkboxes current
- Document learnings in research.md

### Experiments

- Three phases: run → evaluate → report
- Save raw results before evaluation (allows re-scoring)
- Use objective metrics where possible (exact match, entity F1)

---

## Important Constraints

1. **Keep it simple:** Build the minimal version first, add complexity only when needed
2. **JavaScript/TypeScript focus:** Use other languages only if truly necessary
3. **One-shot CLI execution:** Experiments should be stateless and reproducible
4. **Explain acronyms:** First use should be spelled out
5. **No over-engineering:** Abstractions must earn their place

---

## Current Status

See [PLAN.md](PLAN.md) for detailed status. Summary:

- [x] Research and documentation
- [ ] Project setup (package.json, tsconfig)
- [ ] Dataset generation
- [ ] Baseline experiments
- [ ] Advanced techniques
