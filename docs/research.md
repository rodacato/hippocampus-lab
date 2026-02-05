# Research: Cognitive Memory for LLMs

> For detailed definitions of terms, see [glossary.md](glossary.md)

## Human Memory Foundations

To optimize AI, we first need to understand how the brain manages limited resources:

### Memory Types

| Type | Function | LLM Equivalent |
|------|----------|----------------|
| **Sensory** | Immediate stimulus filter | Input buffer before processing |
| **Working (Short-term)** | Current information manipulation. Capacity: $7 \pm 2$ units | Active context window |
| **Long-term Semantic** | Facts and general knowledge | Knowledge base, embeddings |
| **Long-term Episodic** | Memories of specific events | Conversation history |
| **Long-term Procedural** | Skills and workflows | Fine-tuning, system prompts |

## Huginn & Muninn Architecture

System from the paper _Huginn & Muninn: A Reconstructive Memory Architecture for Odin_.

### Reconstructive Memory

Unlike databases that retrieve literal text, reconstructive memory **re-synthesizes** information. Memories are not fixed snapshots, but reconstructions based on current relevance.

### ACT-R Model (Adaptive Control of Thought-Rational)

Memory Activation Formula:

$$A_i = B_i + \sum_j W_j S_{ji}$$

Where:
- $A_i$ = Activation of memory element i
- $B_i$ = Base level (recent use + frequency)
- $W_j$ = Weight of activation source j
- $S_{ji}$ = Association strength between j and i

**Implication:** If data isn't used, its "energy" decays -> **selective forgetting**.

### The Duality of the Ravens

| Component | Role | Function |
|-----------|------|----------|
| **Huginn** (Thought) | Attention | Decides which memory fragments to "surface" to context |
| **Muninn** (Memory) | Storage | Consolidates experiences during idle periods |

## Memory Phenomena Critical to Our Experiments

These cognitive phenomena directly affect how we design experiments and interpret results.

### Serial Position Effect

The U-shaped recall curve: we remember beginnings (primacy) and endings (recency) better than middles.

```
Recall accuracy
     |  ****                              ****
     |      ***                        ***
     |         **                    **
     |           **    ********    **
     |             ****        ****
     +-----------------------------------------> Position
        Early        Middle          Recent
```

**LLM manifestation:** "Lost in the Middle" phenomenon. Liu et al. (2023) showed LLMs exhibit the same pattern—information in the middle of long prompts is processed worse.

**Experimental implication:** When testing recall, we must sample from all positions and report position-specific accuracy, not just overall accuracy.

### Von Restorff Effect (Distinctiveness)

Distinctive items are remembered better regardless of position. A user's name stands out more than a technical detail.

**Experimental implication:** We must control for **saliency** when testing position effects. If we find "early information is remembered better," is it really position, or is it that users tend to share salient info (name, role) early?

**Solution:** Design datasets where same-saliency information appears at different positions.

### Interference

Memories compete. Adding more context can actually hurt performance by creating interference.

| Type | Description | LLM Example |
|------|-------------|-------------|
| Proactive | Old memories block new | Old project details interfere with current project |
| Retroactive | New memories block old | Recent conversation makes model forget earlier facts |

**This validates the Harvard finding:** Add-all hurts because irrelevant history interferes with relevant retrieval.

### Forgetting as Feature

Human forgetting is adaptive—it maintains signal-to-noise ratio. We forget:
- Routine, repeated information (habituation)
- Information not accessed recently (decay)
- Information superseded by updates

**Design principle:** A good memory system should forget strategically, not remember everything.

---

## Impact on LLM Inference

### 1. Signal-to-Noise Ratio (SNR)

Noise in a prompt (irrelevant history) forces the **Self-Attention** mechanism to distribute weights over tokens that add no value.

**With reconstructive memory:** Attention focuses on pure "signal" -> Fewer errors, greater coherence.

### 2. "Lost in the Middle" Phenomenon

LLMs lose precision on information located in the middle of long prompts.

**Mitigation:** Context Ranking hierarchizes information, placing vital data in high-priority positions for attention heads.

### 3. Identity Stability (Grounding)

Without long-term storage, user identity and preferences are volatile.

**Solution:** Stable episodic memory as context anchor -> Persistent tone, style, and domain knowledge across sessions.

### 4. Latency Efficiency

- Fewer Tokens = Fewer Attention Passes -> Faster first word
- Synthesized insights enable easier second-order deductions

## Token Optimization Techniques

| Technique | Description | Reduction |
|-----------|-------------|-----------|
| **Incremental Summarization** | Summarize last N messages, discard originals | 70% - 90% |
| **Context Pruning** | Remove irrelevant tokens (greetings, stop words) | 10% - 15% |
| **Semantic RAG** | Retrieve fragments by vector proximity | Variable |
| **Adaptive Gating** | System decides if interaction is worth saving | High |

## MCP Module Proposal (Living Memory)

Three logical layers:

### Layer 1: The Gater (Ingestion)

- Analyzes user input
- Detects identity/preference data -> "High Priority"
- Filters transient noise

### Layer 2: The Ranker (Activation)

- Calculates ACT-R score for each element
- Keeps only objects with resonance to current topic in prompt
- Implements temporal decay

### Layer 3: The Weaver (Consolidation)

- Background process
- Merges related memories
- Generates "Learning Insights"

## Comparison: With vs Without Cognitive Memory

| Factor | Without Memory | With Huginn & Muninn |
|--------|----------------|----------------------|
| Attention | Diluted in noise | Focused on key data |
| Precision | Degrades in long contexts | Remains stable |
| Connectivity | Forgets previous facts | Connects past sessions |
| Cost | High token usage | Efficient and selective usage |

---

## Additional Research (2025-2026)

### Harvard: Selective Memory vs Add-All

Study by Zidi Xiong et al. (_How Memory Management Impacts LLM Agents_, arXiv:2505.16067, May 2025)

**Key finding:** Indiscriminately adding all history ("add-all") to context **damages performance**. Using strict evaluation criteria and selective filtering provides **~10% improvement**.

Implications:
- Validates selective memory hypothesis
- Gater must be aggressive in filtering
- Quality > Quantity in context

Source: [Harvard D3 Institute](https://d3.harvard.edu/smarter-memories-stronger-agents-how-selective-recall-boosts-llm-performance/)

### Recursive Language Models (RLM)

Paper by Alex L. Zhang, Tim Kraska, Omar Khattab (MIT CSAIL, arXiv:2512.24601)

**Paradigm:** Treats long prompts as part of an external environment. The LLM can programmatically examine, decompose, and recursively call itself on prompt fragments.

**Architecture:**
- Prompt stored in external variable (e.g., string in Python REPL)
- Model generates executable program based on task description
- Interacts with memory via standard I/O (slicing, string manipulation)
- Recursive primitive for sub-queries

**Benefits:**
- ~2-3k tokens per query vs 95k+ in direct approach
- Handles inputs 100x larger than native attention window
- Supports entire codebases, multi-year files, complete books

Source: [arXiv](https://arxiv.org/abs/2512.24601) | [GitHub](https://github.com/ysz/recursive-llm)

### MemGPT: LLMs as Operating Systems

Paper by Charles Packer et al. (arXiv:2310.08560)

**Concept:** Inspired by operating systems, treats context window as a limited memory resource with tier hierarchy.

**Memory Architecture:**

| Tier | Function | OS Analogy |
|------|----------|------------|
| **Core Memory** | Essential facts, always accessible | RAM |
| **Recall Memory** | Searchable database, semantic reconstruction | Cache |
| **Archival Memory** | Long-term storage, movable to core/recall | Disk |

**Mechanisms:**
- Self-editing memory via tool use
- Interrupts for flow control
- Functions to move data between main context and external

Source: [arXiv](https://arxiv.org/abs/2310.08560) | [Letta Docs](https://docs.letta.com/concepts/memgpt/)

### ContextAgent: Proactive Agents

Paper presented at NeurIPS 2025 (arXiv:2505.14668)

**Innovation:** First proactive context-aware agent incorporating extensive sensory contexts.

**Operation:**
- Extracts multi-dimensional contexts from sensory perceptions (video, audio from wearables)
- Uses sensory contexts + persona contexts from historical data
- Predicts need for proactive services
- Automatically calls tools when assistance is needed

**Results:** 8.5% better accuracy in proactive predictions, 6.0% better in tool calling vs baselines.

Source: [arXiv](https://arxiv.org/abs/2505.14668) | [GitHub](https://github.com/openaiotlab/ContextAgent)

### Context Compression Techniques (2025)

#### KVzip (Seoul National University)

- Compresses conversation memory 3-4x
- Eliminates redundant information while maintaining accuracy
- Supports up to 170k tokens
- Allows memory reuse between queries without recompression

Source: [TechXplore](https://techxplore.com/news/2025-11-ai-tech-compress-llm-chatbot.html)

#### Active Context Compression (Focus Agent)

- Intra-trajectory compression: agents prune their own history during task
- Preserves learnings in structured knowledge block
- **22.7% net token savings**
- Each compression costs hundreds of tokens but saves thousands

Source: [arXiv](https://arxiv.org/pdf/2601.07190)

#### TidalDecode (ICLR 2025)

- Only 2 token selection layers needed (start + middle)
- Sufficient for high generative performance
- Minimizes compute and memory overhead

### Observed Phenomena in LLMs

#### "Potemkin Understanding" (Harvard/MIT)

LLMs exhibit a facade of competence: they can define concepts but fail to apply them in practical tasks with heavy context.

**Implication:** Memory must not only store but structure knowledge in applicable ways.

#### Effective vs Declared Context

Models with 1M+ token windows rarely maintain high-precision reasoning beyond 30-60% of their declared window.

**Implication:** Optimize for effective context, not maximum.

---

## Synthesis: Emerging Patterns

| Pattern | Evidence | Application to Our Module |
|---------|----------|---------------------------|
| **Selective > Add-All** | Harvard +10% | Aggressive Gater |
| **Recursion > Flat Context** | RLM 100x scale | Weaver with sub-queries |
| **Memory Hierarchy** | MemGPT | Core/Recall/Archival tiers |
| **Active Compression** | Focus 22.7% savings | Continuous consolidation |
| **Effective Context < Declared** | 30-60% useful | Don't trust max window |

---

## Methodological Considerations

### Why Multiple Baselines Matter

A single "full context" baseline is insufficient. We need:

| Baseline | What it answers |
|----------|-----------------|
| Full context | Upper bound: maximum info available |
| Random subset | Does *any* context help, or does it need to be relevant? |
| Recency-only | Is only recent info needed? |
| No context | Lower bound: model's prior knowledge |

If a technique beats "random" but not "recency," we've learned something important about what matters.

### Objective vs Subjective Metrics

**Problem:** Using LLM-as-judge to evaluate LLM responses creates circular bias.

**Solution:** Separate metrics into:

1. **Objective (no LLM):** Exact match, entity F1, token count
2. **Subjective (LLM + human calibration):** Coherence, fluency

Calibrate subjective metrics with ~20% human evaluation to ensure the judge is aligned.

### Statistical Rigor

For publishable results:
- n ≥ 30 per condition (not 10)
- Report 95% confidence intervals
- Use Bonferroni correction for multiple comparisons
- Report effect sizes (Cohen's d), not just p-values

### Controlling Confounders

When testing position effects (Lost in the Middle):
1. Control for **saliency** - same-importance info at different positions
2. Control for **semantic category** - compare like with like
3. Control for **context length** - the effect depends on total length

---

## Open Questions (Phase 1)

- [x] Is selective memory better than add-all? -> **Yes, +10% (Harvard)**
- [ ] How to calculate $B_i$ (base level) in practice?
- [ ] What decay thresholds are optimal?
- [ ] How to measure "current relevance" programmatically?
- [ ] Which model to use for summarization without losing critical info?
- [ ] How to prevent Weaver from generating hallucinated "insights"?
- [ ] Is RLM compatible with MCP architecture?
- [ ] How to integrate KVzip or similar for compression?

## Papers and References

### Reviewed

- [x] Harvard: How Memory Management Impacts LLM Agents (arXiv:2505.16067)
- [x] RLM: Recursive Language Models (arXiv:2512.24601)
- [x] MemGPT: Towards LLMs as Operating Systems (arXiv:2310.08560)
- [x] ContextAgent (arXiv:2505.14668, NeurIPS 2025)

### To Review

- [ ] _Huginn & Muninn: A Reconstructive Memory Architecture for Odin_ (main paper)
- [ ] ACT-R: A Theory of Higher Level Cognition
- [ ] Lost in the Middle: How Language Models Use Long Contexts
- [ ] A Survey on Memory Mechanisms in the Era of LLMs (arXiv:2504.15965)
- [ ] KVzip original paper
- [ ] Active Context Compression / Focus Agent paper
