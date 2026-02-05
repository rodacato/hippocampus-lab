/**
 * Full context baseline (upper bound)
 * Includes all conversation turns in the prompt.
 */

import type { TestConversation, RecallQuestion } from '../types.js';
import { BaseTechnique } from './base.js';
import { formatTurns } from './config.js';

export class FullContextBaseline extends BaseTechnique {
  name = 'baseline-full';

  buildPrompt(conversation: TestConversation, question: RecallQuestion): string {
    const history = formatTurns(conversation.turns);
    return this.formatPrompt(history, question.question);
  }
}
