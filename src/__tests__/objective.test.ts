import { describe, it, expect } from 'vitest';
import { exactMatch, entityRecall, evaluateObjective } from '../evaluation/objective.js';

describe('exactMatch', () => {
  it('returns true when response contains expected answer', () => {
    expect(exactMatch('The answer is María García', 'María García')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(exactMatch('The answer is MARÍA GARCÍA', 'maría garcía')).toBe(true);
    expect(exactMatch('the answer is maría garcía', 'MARÍA GARCÍA')).toBe(true);
  });

  it('returns false when answer is not present', () => {
    expect(exactMatch('The answer is Juan', 'María')).toBe(false);
  });

  it('handles partial matches', () => {
    expect(exactMatch('María is here', 'María García')).toBe(false);
    expect(exactMatch('María García works here', 'María')).toBe(true);
  });

  it('handles empty strings', () => {
    expect(exactMatch('', 'test')).toBe(false);
    expect(exactMatch('test', '')).toBe(true); // empty string is always "contained"
  });
});

describe('entityRecall', () => {
  it('returns 1 when all entities are found', () => {
    const response = 'María García works at TechCorp in Barcelona';
    const entities = ['María', 'TechCorp', 'Barcelona'];
    expect(entityRecall(response, entities)).toBe(1);
  });

  it('returns correct ratio for partial matches', () => {
    const response = 'María works in Barcelona';
    const entities = ['María', 'TechCorp', 'Barcelona'];
    expect(entityRecall(response, entities)).toBeCloseTo(2 / 3);
  });

  it('returns 0 when no entities are found', () => {
    const response = 'Nothing relevant here';
    const entities = ['María', 'TechCorp'];
    expect(entityRecall(response, entities)).toBe(0);
  });

  it('returns 1 for empty expected entities', () => {
    expect(entityRecall('Any response', [])).toBe(1);
  });

  it('is case insensitive', () => {
    const response = 'MARÍA works at TECHCORP';
    const entities = ['maría', 'techcorp'];
    expect(entityRecall(response, entities)).toBe(1);
  });
});

describe('evaluateObjective', () => {
  it('combines exactMatch and entityRecall', () => {
    const question = {
      question: 'Who works where?',
      expectedAnswer: 'María García',
      expectedEntities: ['María', 'García', 'TechCorp'],
      infoLocation: 'early' as const,
      salienceLevel: 'high' as const,
    };

    const response = 'María García works at TechCorp';
    const result = evaluateObjective(response, question);

    expect(result.exactMatch).toBe(true);
    expect(result.entityRecall).toBe(1);
  });

  it('handles partial success', () => {
    const question = {
      question: 'Who works where?',
      expectedAnswer: 'María García',
      expectedEntities: ['María', 'García', 'TechCorp'],
      infoLocation: 'early' as const,
      salienceLevel: 'high' as const,
    };

    const response = 'María works somewhere';
    const result = evaluateObjective(response, question);

    expect(result.exactMatch).toBe(false);
    expect(result.entityRecall).toBeCloseTo(1 / 3);
  });
});
