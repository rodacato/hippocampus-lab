# Glossary: Cognitive Science for LLM Memory

This glossary defines key concepts from cognitive psychology, neuroscience, and memory research that inform our experiments. Understanding these mechanisms is essential for building effective LLM memory systems.

---

## Memory Systems

### Working Memory

**Definition:** The cognitive system that temporarily holds and manipulates information for complex tasks. Limited capacity (~7±2 items, per Miller's Law).

**LLM Equivalent:** The active context window. What the model can "see" right now.

**Key insight:** Working memory isn't just storage—it's active processing. Simply having information in context doesn't mean the model is using it effectively.

---

### Long-term Memory

**Definition:** Relatively permanent storage of information. Subdivided into:

| Type | Content | LLM Equivalent |
|------|---------|----------------|
| **Semantic** | Facts, concepts, meanings | Pre-trained knowledge, embeddings |
| **Episodic** | Personal experiences, events | Conversation history |
| **Procedural** | Skills, how-to knowledge | Fine-tuning, system prompts |

**Key insight:** Humans don't retrieve memories verbatim—they reconstruct them. This is why "summarization" might be more brain-like than "full context."

---

### Sensory Memory

**Definition:** Ultra-short-term buffer (~250ms for visual, ~3-4s for auditory) that filters incoming stimuli before conscious processing.

**LLM Equivalent:** Input tokenization and initial processing layers. Most input never makes it to "attention."

**Key insight:** The brain's first job is to throw away most of what it perceives. Aggressive filtering is natural.

---

## Memory Phenomena

### Primacy Effect

**Definition:** Items presented first in a list are remembered better than middle items.

**Cause:** Early items get more rehearsal time and transfer to long-term memory.

**LLM implication:** Information at the start of a prompt may be encoded more strongly in early attention layers. System prompts benefit from this position.

---

### Recency Effect

**Definition:** Items presented last are remembered better than middle items.

**Cause:** Recent items are still in working memory at recall time.

**LLM implication:** Recent conversation turns are still "fresh" in context. A sliding window naturally preserves this advantage.

---

### Serial Position Curve

**Definition:** The U-shaped curve showing primacy + recency effects together, with a "dip" in the middle.

```
Recall
  |  *                           *
  |   *                         *
  |    *                       *
  |     *       *   *   *     *
  |      *  *             *  *
  +-------------------------------- Position
     Early    Middle      Recent
```

**LLM implication:** This is the "Lost in the Middle" phenomenon. Information in the middle of long prompts is processed worse.

---

### Von Restorff Effect (Isolation Effect)

**Definition:** Distinctive or emotionally salient items are remembered better, regardless of position.

**Example:** In a list of words, a word printed in red is remembered better than black words.

**LLM implication:** Not all information is equal. User's name, strong preferences, or unusual facts may be more "memorable" than routine exchanges—even if buried in the middle.

**Experimental control:** When testing position effects, we must control for salience. Compare apples to apples.

---

### Interference

**Definition:** When memories compete with each other, causing forgetting.

| Type | Description | Example |
|------|-------------|---------|
| **Proactive** | Old memories interfere with new | Old phone number blocks new one |
| **Retroactive** | New memories interfere with old | New password makes you forget old |

**LLM implication:** Adding more context isn't always better. Irrelevant history can interfere with relevant information. This validates the Harvard finding that selective > add-all.

---

## Memory Processes

### Encoding

**Definition:** The process of transforming information into a storable format.

**Key factors:**
- **Depth of processing:** Semantic encoding (meaning) > phonetic > visual
- **Elaboration:** Connecting new info to existing knowledge improves encoding
- **Attention:** Unattended information is poorly encoded

**LLM implication:** How we format information in prompts affects how well it's "encoded" in the model's processing. Structured formats may encode better than raw text.

---

### Consolidation

**Definition:** The process of stabilizing memories over time, often during sleep or rest.

**LLM equivalent:** The "Weaver" layer in our architecture—merging and synthesizing memories during idle time.

**Key insight:** Memory isn't one-shot. It benefits from re-processing and integration.

---

### Retrieval

**Definition:** The process of accessing stored information.

**Types:**
- **Recall:** Generating information from memory (harder)
- **Recognition:** Identifying previously seen information (easier)

**LLM implication:** Recall questions ("What did I tell you about X?") are harder than recognition questions ("Did I mention X or Y?"). Our experiments use recall, the harder test.

---

### Forgetting

**Definition:** Loss of ability to retrieve information. Not always failure—often adaptive.

**Causes:**
- **Decay:** Memories weaken over time without use
- **Interference:** Competing memories block retrieval
- **Retrieval failure:** Memory exists but can't be accessed

**Key insight:** Forgetting is a feature, not a bug. Strategic forgetting improves signal-to-noise ratio.

---

## Cognitive Architectures

### ACT-R (Adaptive Control of Thought-Rational)

**Definition:** A cognitive architecture developed by John Anderson at CMU, modeling how humans retrieve and use memories.

**Core formula for memory activation:**

$$A_i = B_i + \sum_j W_j S_{ji}$$

Where:
- $A_i$ = Total activation of memory chunk i
- $B_i$ = Base-level activation (recency + frequency)
- $W_j$ = Attentional weight of source j
- $S_{ji}$ = Associative strength between j and i

**Base-level learning equation:**

$$B_i = \ln\left(\sum_{j=1}^{n} t_j^{-d}\right)$$

Where:
- $t_j$ = Time since the j-th use of the memory
- $d$ = Decay parameter (typically ~0.5)
- $n$ = Number of times the memory has been accessed

**Key insight:** Memories that are used frequently AND recently have highest activation. This is computable and implementable.

---

### Spreading Activation

**Definition:** When one memory is activated, activation spreads to related memories through associative links.

**Example:** Thinking about "doctor" activates "nurse," "hospital," "stethoscope."

**LLM implication:** When the user asks about topic X, we should retrieve not just memories containing X, but memories *associated* with X. Embeddings capture some of this, but explicit association tracking could help.

---

### Reconstructive Memory

**Definition:** Memories are not stored like files and retrieved verbatim. They are reconstructed each time from fragments + schemas + current context.

**Implications:**
1. Memory is inherently lossy and interpretive
2. Summarization may be more "natural" than verbatim storage
3. The same memory can be reconstructed differently in different contexts

**LLM implication:** Instead of storing full conversation history, store *fragments* and *schemas* that can be reconstructed. This is the Huginn & Muninn approach.

---

## Attention & Processing

### Selective Attention

**Definition:** The ability to focus on relevant information while filtering irrelevant input.

**Cocktail party effect:** You can focus on one conversation in a noisy room, but you'll still notice if someone says your name.

**LLM implication:** The Gater layer should implement selective attention—most input gets filtered, but high-priority items (user identity, strong preferences) always get through.

---

### Self-Attention (Transformer)

**Definition:** The mechanism in transformers where each token attends to all other tokens, computing relevance weights.

**Connection to human attention:** Loosely analogous to selective attention, but operates in parallel across all tokens rather than sequentially.

**Key insight:** Self-attention has quadratic cost. Reducing context size dramatically reduces computation.

---

### Cognitive Load

**Definition:** The total amount of mental effort being used in working memory.

**Types:**
- **Intrinsic:** Complexity inherent to the task
- **Extraneous:** Complexity from poor presentation
- **Germane:** Effort spent on learning/encoding

**LLM implication:** Noisy, unstructured context increases "extraneous load." Clean, relevant context lets the model focus on the actual task.

---

## Evaluation Concepts

### Saliency

**Definition:** How much an item stands out from its surroundings.

**Why it matters for experiments:** When testing memory for items at different positions, we must control for saliency. A memorable fact will be remembered regardless of position.

**How we control for it:**
```typescript
interface TurnMetadata {
  salienceLevel: 'high' | 'medium' | 'low';
  semanticCategory: string;  // to compare like with like
}
```

---

### Ground Truth

**Definition:** The objectively correct answer against which we measure performance.

**Problem with LLM-as-judge:** If we ask an LLM to judge another LLM, we don't have true ground truth—we have one model's opinion.

**Solution:** Use objective metrics where possible (exact match, entity F1), and calibrate subjective metrics with human evaluation.

---

### Statistical Power

**Definition:** The probability of detecting an effect if it exists. Low power = likely to miss real effects.

**For our experiments:**
- Need sufficient sample size (n ≥ 30 per condition)
- Report confidence intervals
- Use Bonferroni correction for multiple comparisons

---

## LLM-Specific Concepts

### Lost in the Middle

**Definition:** Phenomenon where LLMs perform worse on information located in the middle of long contexts, matching the serial position curve from human memory.

**Paper:** Liu et al., "Lost in the Middle: How Language Models Use Long Contexts"

**Mitigation strategies:**
- Place important info at start or end
- Use hierarchical summarization
- Implement explicit position-based retrieval

---

### Effective Context Window

**Definition:** The portion of the declared context window where the model maintains high-precision reasoning. Typically 30-60% of maximum.

**Example:** A model with 100k context may only reason well over ~40k tokens.

**Implication:** Don't optimize for maximum context—optimize for *effective* context.

---

### Context Engineering

**Definition:** The practice of carefully designing what goes into a prompt and how it's structured to maximize model performance.

**Our techniques are all forms of context engineering:**
- Summarization = compression
- Pruning = noise removal
- Selective memory = relevance filtering
- Sliding window = recency prioritization

---

## References

Key papers for deeper reading:

1. **Miller (1956)** - "The Magical Number Seven, Plus or Minus Two" - Working memory capacity
2. **Anderson & Lebiere (1998)** - "The Atomic Components of Thought" - ACT-R architecture
3. **Bartlett (1932)** - "Remembering" - Reconstructive memory
4. **Liu et al. (2023)** - "Lost in the Middle" - LLM position effects
5. **Xiong et al. (2025)** - "How Memory Management Impacts LLM Agents" - Selective > add-all

---

*This glossary will be updated as we learn more through experimentation.*
