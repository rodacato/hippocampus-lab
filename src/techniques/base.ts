/**
 * Base class for memory techniques
 */

import type { Technique, TestConversation, RecallQuestion } from '../types.js';
import { TECHNIQUE_CONFIG, formatTurns } from './config.js';

export abstract class BaseTechnique implements Technique {
  abstract name: string;

  protected get systemPrompt(): string {
    return TECHNIQUE_CONFIG.systemPrompt;
  }

  abstract buildPrompt(conversation: TestConversation, question: RecallQuestion): string;

  /**
   * Wrap the conversation history and question with system prompt
   */
  protected formatPrompt(history: string, question: string): string {
    if (history.length === 0) {
      return `${this.systemPrompt}\n\nUser: ${question}`;
    }
    return `${this.systemPrompt}\n\n${history}\n\nUser: ${question}`;
  }
}
