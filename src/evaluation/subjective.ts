/**
 * Subjective evaluation using LLM-as-judge
 */

import type { SubjectiveScores } from '../types.js';
import { CLIExecutor } from '../cli/executor.js';

const JUDGE_PROMPT_TEMPLATE = `You are evaluating an AI assistant's response for quality.

## Conversation History
{conversationContext}

## Question Asked
"{question}"

## Response to Evaluate
"{response}"

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

Respond ONLY with JSON: {"coherence": N, "fluency": N, "reasoning": "brief explanation"}`;

export interface JudgeResponse {
  coherence: number;
  fluency: number;
  reasoning: string;
}

/**
 * Parse the judge's response, handling potential JSON extraction
 */
function parseJudgeResponse(response: string): JudgeResponse {
  // Try to find JSON in the response
  const jsonMatch = response.match(/\{[\s\S]*?"coherence"[\s\S]*?"fluency"[\s\S]*?\}/);

  if (!jsonMatch) {
    throw new Error(`Could not find JSON in judge response: ${response.slice(0, 200)}`);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the response
    if (typeof parsed.coherence !== 'number' || parsed.coherence < 1 || parsed.coherence > 5) {
      throw new Error(`Invalid coherence score: ${parsed.coherence}`);
    }
    if (typeof parsed.fluency !== 'number' || parsed.fluency < 1 || parsed.fluency > 5) {
      throw new Error(`Invalid fluency score: ${parsed.fluency}`);
    }

    return {
      coherence: parsed.coherence,
      fluency: parsed.fluency,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    };
  } catch (error) {
    throw new Error(`Failed to parse judge response: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Evaluate a response using LLM-as-judge
 */
export async function judgeResponse(
  executor: CLIExecutor,
  conversationContext: string,
  question: string,
  response: string
): Promise<SubjectiveScores> {
  const prompt = JUDGE_PROMPT_TEMPLATE
    .replace('{conversationContext}', conversationContext)
    .replace('{question}', question)
    .replace('{response}', response);

  const result = await executor.execute(prompt);
  const parsed = parseJudgeResponse(result.response);

  return {
    coherence: parsed.coherence,
    fluency: parsed.fluency,
    reasoning: parsed.reasoning,
  };
}

/**
 * Generate mock subjective scores for dry-run mode
 */
export function mockSubjectiveScores(): SubjectiveScores {
  return {
    coherence: Math.floor(Math.random() * 3) + 3, // 3-5
    fluency: Math.floor(Math.random() * 3) + 3,   // 3-5
    reasoning: '[DRY RUN] Mock evaluation',
  };
}
