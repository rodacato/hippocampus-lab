/**
 * Configuration for memory techniques
 */

import type { TechniqueConfig } from '../types.js';

export const TECHNIQUE_CONFIG: TechniqueConfig = {
  maxTurns: 20,
  contextRatio: 0.5,
  systemPrompt: 'You are a helpful assistant. Answer based on the conversation history provided.',
};

/**
 * Calculate the number of turns to include for subset techniques.
 * Uses min(50% of conversation, maxTurns) to balance coverage with cost control.
 */
export function calculateK(totalTurns: number): number {
  return Math.min(
    Math.floor(totalTurns * TECHNIQUE_CONFIG.contextRatio),
    TECHNIQUE_CONFIG.maxTurns
  );
}

/**
 * Format conversation turns into a prompt string
 */
export function formatTurns(turns: Array<{ role: string; content: string }>): string {
  return turns
    .map(t => `${t.role}: ${t.content}`)
    .join('\n\n');
}

/**
 * Randomly sample k items from an array (Fisher-Yates shuffle)
 */
export function randomSample<T>(array: T[], k: number): T[] {
  if (k >= array.length) return [...array];

  const result = [...array];
  for (let i = result.length - 1; i > result.length - k - 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(-k);
}
