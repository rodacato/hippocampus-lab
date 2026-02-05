/**
 * Type definitions for hippocampus-lab experiments
 */

// === Dataset Types ===

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  metadata?: TurnMetadata;
}

export interface TurnMetadata {
  containsKeyInfo: boolean;
  keyInfoType?: 'identity' | 'preference' | 'fact' | 'instruction';
  salienceLevel?: 'high' | 'medium' | 'low';
  semanticCategory?: string;
}

export interface RecallQuestion {
  question: string;
  expectedAnswer: string;
  expectedEntities: string[];
  infoLocation: 'early' | 'middle' | 'recent';
  salienceLevel: 'high' | 'medium' | 'low';
}

export interface TestConversation {
  id: string;
  turns: ConversationTurn[];
  recallQuestions: RecallQuestion[];
}

// === Execution Types ===

export type CLIType = 'claude' | 'gemini' | 'codex';

export interface ExecutionResult {
  experimentId: string;
  timestamp: string;
  technique: string;
  cli: CLIType;
  model?: string;
  conversationId: string;
  questionIndex: number;
  prompt: string;
  response: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs: number;
}

// === Evaluation Types ===

export interface ObjectiveScores {
  exactMatch: boolean;
  entityRecall: number;
}

export interface SubjectiveScores {
  coherence: number;
  fluency: number;
  reasoning?: string;
}

export interface EvaluatedResult extends ExecutionResult {
  objective: ObjectiveScores;
  subjective: SubjectiveScores;
}

// === Aggregation Types ===

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface TechniqueMetrics {
  avgTokens: number;
  avgLatencyMs: number;
  exactMatchRate: number;
  avgEntityRecall: number;
  avgCoherence: number;
  avgFluency: number;
  ci95: {
    exactMatchRate: ConfidenceInterval;
    entityRecall: ConfidenceInterval;
  };
}

export interface TechniqueReport {
  technique: string;
  n: number;
  metrics: TechniqueMetrics;
}

export interface ExperimentReport {
  experimentId: string;
  timestamp: string;
  cli: CLIType;
  model?: string;
  techniques: TechniqueReport[];
}

// === Configuration Types ===

export interface TechniqueConfig {
  maxTurns: number;
  contextRatio: number;
  systemPrompt: string;
}

export interface ExecutorConfig {
  cli: CLIType;
  temperature?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  dryRun?: boolean;
}

export interface RunConfig {
  techniques: string[];
  datasets: string[];
  cli: CLIType;
  outputDir: string;
  dryRun?: boolean;
}

// === Technique Interface ===

export interface Technique {
  name: string;
  buildPrompt(conversation: TestConversation, question: RecallQuestion): string;
}
