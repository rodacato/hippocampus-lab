/**
 * Random subset baseline (control)
 * Includes a random sample of conversation turns.
 */

import type { TestConversation, RecallQuestion } from '../types.js';
import { BaseTechnique } from './base.js';
import { calculateK, formatTurns, randomSample } from './config.js';

export class RandomSubsetBaseline extends BaseTechnique {
  name = 'baseline-random';

  buildPrompt(conversation: TestConversation, question: RecallQuestion): string {
    const k = calculateK(conversation.turns.length);
    const selected = randomSample(conversation.turns, k);
    const history = formatTurns(selected);
    return this.formatPrompt(history, question.question);
  }
}
