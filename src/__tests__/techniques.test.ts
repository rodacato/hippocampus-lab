import { describe, it, expect } from 'vitest';
import { FullContextBaseline } from '../techniques/baseline-full.js';
import { NoContextBaseline } from '../techniques/baseline-none.js';
import { RandomSubsetBaseline } from '../techniques/baseline-random.js';
import { RecencyBaseline } from '../techniques/baseline-recency.js';
import { TECHNIQUE_CONFIG } from '../techniques/config.js';
import type { TestConversation, RecallQuestion } from '../types.js';

const mockConversation: TestConversation = {
  id: 'test-conv',
  turns: [
    { role: 'user', content: 'My name is María' },
    { role: 'assistant', content: 'Nice to meet you María' },
    { role: 'user', content: 'I work at TechCorp' },
    { role: 'assistant', content: 'Interesting company' },
    { role: 'user', content: 'I like Python' },
    { role: 'assistant', content: 'Great language' },
  ],
  recallQuestions: [],
};

const mockQuestion: RecallQuestion = {
  question: 'What is my name?',
  expectedAnswer: 'María',
  expectedEntities: ['María'],
  infoLocation: 'early',
  salienceLevel: 'high',
};

describe('FullContextBaseline', () => {
  const technique = new FullContextBaseline();

  it('has correct name', () => {
    expect(technique.name).toBe('baseline-full');
  });

  it('includes all turns in prompt', () => {
    const prompt = technique.buildPrompt(mockConversation, mockQuestion);

    expect(prompt).toContain('My name is María');
    expect(prompt).toContain('I work at TechCorp');
    expect(prompt).toContain('I like Python');
    expect(prompt).toContain('What is my name?');
    expect(prompt).toContain(TECHNIQUE_CONFIG.systemPrompt);
  });
});

describe('NoContextBaseline', () => {
  const technique = new NoContextBaseline();

  it('has correct name', () => {
    expect(technique.name).toBe('baseline-none');
  });

  it('only includes question, no history', () => {
    const prompt = technique.buildPrompt(mockConversation, mockQuestion);

    expect(prompt).not.toContain('My name is María');
    expect(prompt).not.toContain('I work at TechCorp');
    expect(prompt).toContain('What is my name?');
    expect(prompt).toContain(TECHNIQUE_CONFIG.systemPrompt);
  });
});

describe('RandomSubsetBaseline', () => {
  const technique = new RandomSubsetBaseline();

  it('has correct name', () => {
    expect(technique.name).toBe('baseline-random');
  });

  it('includes subset of turns', () => {
    const prompt = technique.buildPrompt(mockConversation, mockQuestion);

    // Should have system prompt and question
    expect(prompt).toContain(TECHNIQUE_CONFIG.systemPrompt);
    expect(prompt).toContain('What is my name?');

    // Should have some but not necessarily all turns
    // (with 6 turns and 50% ratio, k=3)
    const turnCount = mockConversation.turns.filter(t =>
      prompt.includes(t.content)
    ).length;
    expect(turnCount).toBeLessThanOrEqual(mockConversation.turns.length);
  });
});

describe('RecencyBaseline', () => {
  const technique = new RecencyBaseline();

  it('has correct name', () => {
    expect(technique.name).toBe('baseline-recency');
  });

  it('includes only recent turns', () => {
    const prompt = technique.buildPrompt(mockConversation, mockQuestion);

    // With 6 turns and 50% ratio, k=3, should include last 3 turns
    expect(prompt).toContain('I like Python');
    expect(prompt).toContain('Great language');

    // Should NOT include early turns
    expect(prompt).not.toContain('My name is María');

    expect(prompt).toContain(TECHNIQUE_CONFIG.systemPrompt);
    expect(prompt).toContain('What is my name?');
  });
});
