/**
 * No context baseline (lower bound)
 * Only the question, no conversation history.
 */

import type { TestConversation, RecallQuestion } from '../types.js';
import { BaseTechnique } from './base.js';

export class NoContextBaseline extends BaseTechnique {
  name = 'baseline-none';

  buildPrompt(_conversation: TestConversation, question: RecallQuestion): string {
    return this.formatPrompt('', question.question);
  }
}
