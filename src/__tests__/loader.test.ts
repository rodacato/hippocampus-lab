import { describe, it, expect } from 'vitest';
import { validateDataset, DatasetValidationError } from '../datasets/loader.js';

describe('validateDataset', () => {
  const validDataset = {
    id: 'test-01',
    turns: [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
    ],
    recallQuestions: [
      {
        question: 'What was said?',
        expectedAnswer: 'Hello',
        expectedEntities: ['Hello'],
        infoLocation: 'early',
        salienceLevel: 'high',
      },
    ],
  };

  it('accepts valid dataset', () => {
    expect(() => validateDataset(validDataset)).not.toThrow();
  });

  it('rejects non-object', () => {
    expect(() => validateDataset(null)).toThrow(DatasetValidationError);
    expect(() => validateDataset('string')).toThrow(DatasetValidationError);
    expect(() => validateDataset(123)).toThrow(DatasetValidationError);
  });

  it('rejects missing id', () => {
    const data = { ...validDataset, id: undefined };
    expect(() => validateDataset(data)).toThrow('non-empty string "id"');
  });

  it('rejects empty id', () => {
    const data = { ...validDataset, id: '' };
    expect(() => validateDataset(data)).toThrow('non-empty string "id"');
  });

  it('rejects missing turns', () => {
    const data = { ...validDataset, turns: undefined };
    expect(() => validateDataset(data)).toThrow('array "turns"');
  });

  it('rejects invalid turn role', () => {
    const data = {
      ...validDataset,
      turns: [{ role: 'invalid', content: 'test' }],
    };
    expect(() => validateDataset(data)).toThrow('"user" or "assistant"');
  });

  it('rejects missing turn content', () => {
    const data = {
      ...validDataset,
      turns: [{ role: 'user' }],
    };
    expect(() => validateDataset(data)).toThrow('content must be a string');
  });

  it('validates turn metadata when present', () => {
    const dataWithMetadata = {
      ...validDataset,
      turns: [
        {
          role: 'user',
          content: 'Hello',
          metadata: {
            containsKeyInfo: true,
            keyInfoType: 'identity',
            salienceLevel: 'high',
          },
        },
      ],
    };
    expect(() => validateDataset(dataWithMetadata)).not.toThrow();
  });

  it('rejects invalid metadata keyInfoType', () => {
    const data = {
      ...validDataset,
      turns: [
        {
          role: 'user',
          content: 'Hello',
          metadata: {
            containsKeyInfo: true,
            keyInfoType: 'invalid',
          },
        },
      ],
    };
    expect(() => validateDataset(data)).toThrow('keyInfoType must be one of');
  });

  it('rejects invalid recallQuestion infoLocation', () => {
    const data = {
      ...validDataset,
      recallQuestions: [
        {
          ...validDataset.recallQuestions[0],
          infoLocation: 'invalid',
        },
      ],
    };
    expect(() => validateDataset(data)).toThrow('infoLocation must be one of');
  });

  it('rejects non-string expectedEntities', () => {
    const data = {
      ...validDataset,
      recallQuestions: [
        {
          ...validDataset.recallQuestions[0],
          expectedEntities: [123],
        },
      ],
    };
    expect(() => validateDataset(data)).toThrow('expectedEntities must contain only strings');
  });
});
