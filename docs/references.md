# References: Cognitive Memory for LLMs

## Foundational Papers

### Bio-inspired Memory Architecture

- [x] **Huginn & Muninn: A Reconstructive Memory Architecture for Odin**
  - Main project paper (already digested in original notes)
  - Concepts: Reconstructive memory, attention/consolidation duality

- [ ] **ACT-R: A Theory of Higher Level Cognition** - Anderson et al.
  - Base cognitive model
  - Memory activation formula

### Memory in LLMs - Key Papers

- [x] **MemGPT: Towards LLMs as Operating Systems** - Packer et al.
  - arXiv:2310.08560
  - [Paper](https://arxiv.org/abs/2310.08560) | [Docs](https://docs.letta.com/concepts/memgpt/)
  - Architecture: Core Memory / Recall Memory / Archival Memory
  - Self-editing memory via tool use

- [x] **Recursive Language Models** - Zhang, Kraska, Khattab (MIT CSAIL)
  - arXiv:2512.24601
  - [Paper](https://arxiv.org/abs/2512.24601) | [GitHub](https://github.com/ysz/recursive-llm) | [Blog](https://alexzhang13.github.io/blog/2025/rlm/)
  - Context stored in variables, recursive functions
  - 2-3k tokens vs 95k+ traditional

- [x] **How Memory Management Impacts LLM Agents** - Xiong et al. (Harvard)
  - arXiv:2505.16067 (May 2025)
  - [Harvard D3](https://d3.harvard.edu/smarter-memories-stronger-agents-how-selective-recall-boosts-llm-performance/)
  - Selective memory > add-all (~10% improvement)

- [x] **ContextAgent: Context-Aware Proactive LLM Agents** - Yang, Xu et al.
  - arXiv:2505.14668 (NeurIPS 2025)
  - [Paper](https://arxiv.org/abs/2505.14668) | [GitHub](https://github.com/openaiotlab/ContextAgent)
  - Proactive agents with sensory perceptions

### Context Compression and Optimization

- [ ] **KVzip** - Seoul National University
  - [TechXplore](https://techxplore.com/news/2025-11-ai-tech-compress-llm-chatbot.html)
  - 3-4x conversation memory compression
  - Supports 170k tokens

- [ ] **Active Context Compression** - Focus Agent
  - arXiv:2601.07190
  - [Paper](https://arxiv.org/pdf/2601.07190)
  - 22.7% token savings via intra-trajectory compression

- [ ] **TidalDecode** - ICLR 2025
  - 2 selection layers sufficient for high performance

- [ ] **Lost in the Middle: How Language Models Use Long Contexts** - Liu et al.
  - Analysis of precision loss phenomenon in long contexts

### Surveys

- [ ] **A Survey on Memory Mechanisms in the Era of LLMs**
  - arXiv:2504.15965
  - [Paper](https://arxiv.org/pdf/2504.15965)

### RAG and Retrieval

- [ ] **Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks** - Lewis et al.
  - RAG fundamentals

## Articles and Blogs

- [Advancing Long-Context LLM Performance in 2025](https://www.flow-ai.com/blog/advancing-long-context-llm-performance-in-2025) - Flow AI
- [How Does LLM Memory Work?](https://www.datacamp.com/blog/how-does-llm-memory-work) - DataCamp
- [Context Engineering for Production AI Agents](https://medium.com/@kuldeep.paul08/context-engineering-optimizing-llm-memory-for-production-ai-agents-6a7c9165a431) - Medium
- [Prompt Compression Techniques](https://medium.com/@kuldeep.paul08/prompt-compression-techniques-reducing-context-window-costs-while-improving-llm-performance-afec1e8f1003) - Medium
- [LLM Chat History Summarization Guide](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025) - Mem0
- [Recursive Language Models: Infinite Context](https://medium.com/@pietrobolcato/recursive-language-models-infinite-context-that-works-174da45412ab) - Medium

## Reference Implementations

| Project | Description | Link |
|---------|-------------|------|
| **Letta (MemGPT)** | Official MemGPT implementation | [docs.letta.com](https://docs.letta.com/) |
| **recursive-llm** | RLM implementation | [GitHub](https://github.com/ysz/recursive-llm) |
| **ContextAgent** | Proactive agents NeurIPS'25 | [GitHub](https://github.com/openaiotlab/ContextAgent) |
| **LangChain Memory** | ConversationSummaryMemory, etc. | [Docs](https://python.langchain.com/docs/modules/memory/) |
| **LlamaIndex** | Memory modules | [Docs](https://docs.llamaindex.ai/) |
| **Mem0** | Formerly EmbedChain Memory | [mem0.ai](https://mem0.ai/) |

## Glossary

| Term | Definition |
|------|------------|
| **Token** | Minimum processing unit of an LLM |
| **Context Window** | Maximum token limit a model can "see" |
| **Effective Context** | Window portion where model maintains precision (~30-60%) |
| **Decay** | Gradual loss of memory importance over time/disuse |
| **Consolidation** | Conversion of volatile memories into stable structures |
| **Memory Idempotence** | Avoiding redundant information duplication |
| **Self-Attention** | Mechanism allowing model to weight token relevance |
| **Grounding** | Context anchoring to maintain coherence |
| **REPL** | Read-Eval-Print Loop, interactive execution environment |
| **KV Cache** | Key-Value cache for storing attention states |
| **Intra-trajectory Compression** | Compression during task execution |
| **Potemkin Understanding** | Facade of competence without practical application |

## Key People/Groups

- **Zidi Xiong** - PhD Harvard, memory management in LLM agents
- **Himabindu Lakkaraju** - Harvard Business School, Trustworthy AI Lab
- **Alex L. Zhang** - MIT CSAIL, RLM lead author
- **Tim Kraska** - MIT, RLM co-author
- **Omar Khattab** - MIT/Stanford, RLM co-author, DSPy creator
- **Charles Packer** - MemGPT/Letta lead author
