import { describe, it, expect } from 'vitest';
import { calculateK, formatTurns, randomSample, TECHNIQUE_CONFIG } from '../techniques/config.js';

describe('calculateK', () => {
  it('returns 50% of turns when under maxTurns', () => {
    expect(calculateK(10)).toBe(5);
    expect(calculateK(20)).toBe(10);
  });

  it('caps at maxTurns for large conversations', () => {
    expect(calculateK(100)).toBe(TECHNIQUE_CONFIG.maxTurns);
    expect(calculateK(50)).toBe(TECHNIQUE_CONFIG.maxTurns);
  });

  it('handles small conversations', () => {
    expect(calculateK(2)).toBe(1);
    expect(calculateK(1)).toBe(0);
    expect(calculateK(0)).toBe(0);
  });
});

describe('formatTurns', () => {
  it('formats turns with role and content', () => {
    const turns = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];
    expect(formatTurns(turns)).toBe('user: Hello\n\nassistant: Hi there');
  });

  it('handles empty array', () => {
    expect(formatTurns([])).toBe('');
  });

  it('handles single turn', () => {
    const turns = [{ role: 'user', content: 'Test' }];
    expect(formatTurns(turns)).toBe('user: Test');
  });
});

describe('randomSample', () => {
  it('returns k items from array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const sample = randomSample(arr, 3);
    expect(sample).toHaveLength(3);
    sample.forEach(item => {
      expect(arr).toContain(item);
    });
  });

  it('returns full array when k >= length', () => {
    const arr = [1, 2, 3];
    expect(randomSample(arr, 5)).toHaveLength(3);
    expect(randomSample(arr, 3)).toHaveLength(3);
  });

  it('returns empty array for empty input', () => {
    expect(randomSample([], 5)).toHaveLength(0);
  });

  it('does not modify original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    randomSample(arr, 3);
    expect(arr).toEqual(original);
  });
});
