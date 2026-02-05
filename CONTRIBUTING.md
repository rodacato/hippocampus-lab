# Contributing to hippocampus-lab

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd hippocampus-lab
npm install          # Also configures git hooks automatically
```

## Development Workflow

### Running Experiments

```bash
# Full pipeline (dry run, no API calls)
npm run experiment:run -- --dry-run

# Run specific techniques
npm run experiment:run -- --techniques baseline-full,baseline-none

# Evaluate results
npm run experiment:eval -- --input results/raw/<file>.jsonl

# Generate report
npm run experiment:report -- --input results/scored/<file>.jsonl
```

### Running Tests

```bash
npm test              # Run all tests once
npm run test:watch    # Watch mode (re-runs on file changes)
npm run typecheck     # TypeScript type checking only
```

### Validating Datasets

```bash
npm run validate:datasets
```

## Testing

We use [Vitest](https://vitest.dev/) for unit testing. It was chosen for zero-config TypeScript + ESM support.

### Where to Put Tests

Tests live in `src/__tests__/` and follow the naming convention `<module>.test.ts`.

```
src/__tests__/
├── config.test.ts       # Technique configuration and helpers
├── loader.test.ts       # Dataset loading and validation
├── objective.test.ts    # Exact match, entity recall
├── aggregator.test.ts   # Statistics and report generation
└── techniques.test.ts   # Baseline technique behavior
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../path/to/module.js';

describe('myFunction', () => {
  it('does what it should', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### When to Add Tests

- New utility functions or evaluation metrics: always
- New techniques: test `buildPrompt` with a known conversation
- Bug fixes: add a test that reproduces the bug before fixing

## Commits

This project uses git hooks to enforce conventions. They run automatically on every commit.

### Commit Message Format

```
<type>: <description>
```

Or with optional scope:

```
<type>(<scope>): <description>
```

**Rules:**

- Description should start with lowercase
- First line should be under 72 characters (hard limit: 100)
- No `Co-Authored-By` lines

### Valid Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `refactor` | Code restructuring without behavior change |
| `chore` | Maintenance (dependencies, config, hooks) |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvement |
| `build` | Build system or tooling |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverting a previous commit |

### Examples

```bash
# Good
git commit -m "feat: add summarization technique"
git commit -m "fix(loader): handle empty dataset files"
git commit -m "test: add tests for entity recall edge cases"
git commit -m "chore: update dependencies"

# Bad - will be rejected
git commit -m "updated stuff"           # No type
git commit -m "FEAT: Add feature"       # Type must be lowercase
git commit -m "feat add something"      # Missing colon
```

## Git Hooks

Hooks are stored in `.githooks/` and configured automatically via `npm install` (the `prepare` script).

### pre-commit

Runs **before** each commit (only when TypeScript files are staged):

1. `npm run typecheck` - Ensures no type errors
2. `npm test` - Runs all unit tests

If either fails, the commit is blocked.

### commit-msg

Runs **after** writing the commit message:

1. Validates the `<type>: <description>` format
2. Rejects `Co-Authored-By` lines
3. Warns if description starts with uppercase
4. Rejects messages over 100 characters

### Troubleshooting Hooks

If hooks are not running:

```bash
# Verify hooks path is configured
git config core.hooksPath
# Should output: .githooks

# Reconfigure manually if needed
git config core.hooksPath .githooks

# Verify hooks are executable
ls -la .githooks/
```

If hooks block your commit, read the error message - it will tell you exactly what to fix.

## Code Style

- **TypeScript:** Strict mode, explicit types for public APIs
- **Naming:** camelCase for functions/variables, PascalCase for types/classes
- **Files:** kebab-case (e.g., `baseline-full.ts`, `sliding-window.ts`)
- **Prefer functions over classes** unless inheritance is needed
- **Comments:** Only when the "why" isn't obvious from code
- **Imports:** Use `.js` extension in import paths (required for ESM)

## Project Architecture

```
src/
├── types.ts               # All shared type definitions
├── datasets/
│   ├── loader.ts          # Load and validate JSON datasets
│   └── samples/           # Test conversation files (.json)
├── techniques/
│   ├── config.ts          # Shared config (maxTurns, systemPrompt)
│   ├── base.ts            # Abstract base class
│   ├── baseline-*.ts      # Baseline techniques
│   └── index.ts           # Technique registry
├── cli/
│   └── executor.ts        # CLI subprocess execution
├── evaluation/
│   ├── objective.ts       # Exact match, entity recall
│   ├── subjective.ts      # LLM-as-judge evaluation
│   └── aggregator.ts      # Statistics and markdown reports
└── runner.ts              # Three-phase experiment orchestrator
```

### Adding a New Technique

1. Create `src/techniques/<name>.ts` extending `BaseTechnique`
2. Implement `buildPrompt(conversation, question): string`
3. Register it in `src/techniques/index.ts`
4. Add tests in `src/__tests__/techniques.test.ts`

```typescript
// src/techniques/my-technique.ts
import type { TestConversation, RecallQuestion } from '../types.js';
import { BaseTechnique } from './base.js';

export class MyTechnique extends BaseTechnique {
  name = 'my-technique';

  buildPrompt(conversation: TestConversation, question: RecallQuestion): string {
    // Your context selection logic here
    const history = /* ... */;
    return this.formatPrompt(history, question.question);
  }
}
```

### Adding a New Dataset

Create a JSON file in `src/datasets/samples/` following this schema:

```json
{
  "id": "unique-id",
  "turns": [
    {
      "role": "user",
      "content": "...",
      "metadata": {
        "containsKeyInfo": true,
        "keyInfoType": "identity",
        "salienceLevel": "high"
      }
    },
    { "role": "assistant", "content": "..." }
  ],
  "recallQuestions": [
    {
      "question": "...",
      "expectedAnswer": "...",
      "expectedEntities": ["entity1", "entity2"],
      "infoLocation": "early",
      "salienceLevel": "high"
    }
  ]
}
```

Validate with `npm run validate:datasets`.
