/**
 * Objective evaluation metrics (no LLM bias)
 */

import type { ObjectiveScores, RecallQuestion } from '../types.js';

/**
 * Check if the response contains the expected answer (case-insensitive)
 */
export function exactMatch(response: string, expected: string): boolean {
  return response.toLowerCase().includes(expected.toLowerCase());
}

/**
 * Calculate entity recall: what percentage of expected entities appear in the response
 *
 * Note: We only measure recall because precision would require entity extraction
 * from the model's response, adding complexity. See FAQ in PLAN.md for alternatives.
 */
export function entityRecall(response: string, expectedEntities: string[]): number {
  if (expectedEntities.length === 0) return 1;

  const responseLower = response.toLowerCase();
  const found = expectedEntities.filter(entity =>
    responseLower.includes(entity.toLowerCase())
  );

  return found.length / expectedEntities.length;
}

/**
 * Evaluate a response against a question's expected answer and entities
 */
export function evaluateObjective(
  response: string,
  question: RecallQuestion
): ObjectiveScores {
  return {
    exactMatch: exactMatch(response, question.expectedAnswer),
    entityRecall: entityRecall(response, question.expectedEntities),
  };
}
