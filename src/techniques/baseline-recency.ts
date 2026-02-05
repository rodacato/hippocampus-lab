/**
 * Recency-only baseline (control)
 * Includes only the most recent conversation turns.
 */

import type { TestConversation, RecallQuestion } from '../types.js';
import { BaseTechnique } from './base.js';
import { calculateK, formatTurns } from './config.js';

export class RecencyBaseline extends BaseTechnique {
  name = 'baseline-recency';

  buildPrompt(conversation: TestConversation, question: RecallQuestion): string {
    const k = calculateK(conversation.turns.length);
    const recent = conversation.turns.slice(-k);
    const history = formatTurns(recent);
    return this.formatPrompt(history, question.question);
  }
}
