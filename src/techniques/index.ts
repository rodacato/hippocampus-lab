/**
 * Export all techniques
 */

export { BaseTechnique } from './base.js';
export { FullContextBaseline } from './baseline-full.js';
export { NoContextBaseline } from './baseline-none.js';
export { RandomSubsetBaseline } from './baseline-random.js';
export { RecencyBaseline } from './baseline-recency.js';

export { TECHNIQUE_CONFIG, calculateK, formatTurns, randomSample } from './config.js';

import type { Technique } from '../types.js';
import { FullContextBaseline } from './baseline-full.js';
import { NoContextBaseline } from './baseline-none.js';
import { RandomSubsetBaseline } from './baseline-random.js';
import { RecencyBaseline } from './baseline-recency.js';

/**
 * Registry of all available techniques
 */
export const TECHNIQUES: Record<string, Technique> = {
  'baseline-full': new FullContextBaseline(),
  'baseline-none': new NoContextBaseline(),
  'baseline-random': new RandomSubsetBaseline(),
  'baseline-recency': new RecencyBaseline(),
};

/**
 * Get techniques by name
 */
export function getTechniques(names: string[]): Technique[] {
  return names.map(name => {
    const technique = TECHNIQUES[name];
    if (!technique) {
      throw new Error(`Unknown technique: ${name}. Available: ${Object.keys(TECHNIQUES).join(', ')}`);
    }
    return technique;
  });
}
