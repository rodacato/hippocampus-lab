import { describe, it, expect } from 'vitest';
import { aggregateByTechnique, generateReport, formatReportMarkdown } from '../evaluation/aggregator.js';
import type { EvaluatedResult } from '../types.js';

const createMockResult = (
  technique: string,
  exactMatch: boolean,
  entityRecall: number,
  coherence: number,
  fluency: number
): EvaluatedResult => ({
  experimentId: 'test',
  timestamp: '2024-01-01T00:00:00Z',
  technique,
  cli: 'claude',
  conversationId: 'conv-1',
  questionIndex: 0,
  prompt: 'test prompt',
  response: 'test response',
  inputTokens: 100,
  outputTokens: 20,
  latencyMs: 500,
  objective: { exactMatch, entityRecall },
  subjective: { coherence, fluency },
});

describe('aggregateByTechnique', () => {
  it('groups results by technique', () => {
    const results = [
      createMockResult('baseline-full', true, 1.0, 5, 5),
      createMockResult('baseline-full', false, 0.5, 4, 4),
      createMockResult('baseline-none', false, 0.0, 3, 3),
    ];

    const reports = aggregateByTechnique(results);

    expect(reports).toHaveLength(2);
    expect(reports.find(r => r.technique === 'baseline-full')?.n).toBe(2);
    expect(reports.find(r => r.technique === 'baseline-none')?.n).toBe(1);
  });

  it('calculates correct metrics', () => {
    const results = [
      createMockResult('baseline-full', true, 1.0, 5, 4),
      createMockResult('baseline-full', true, 0.8, 4, 5),
      createMockResult('baseline-full', false, 0.6, 3, 3),
    ];

    const reports = aggregateByTechnique(results);
    const fullReport = reports.find(r => r.technique === 'baseline-full')!;

    expect(fullReport.metrics.exactMatchRate).toBeCloseTo(2 / 3);
    expect(fullReport.metrics.avgEntityRecall).toBeCloseTo((1.0 + 0.8 + 0.6) / 3);
    expect(fullReport.metrics.avgCoherence).toBeCloseTo((5 + 4 + 3) / 3);
    expect(fullReport.metrics.avgFluency).toBeCloseTo((4 + 5 + 3) / 3);
    expect(fullReport.metrics.avgTokens).toBe(100);
    expect(fullReport.metrics.avgLatencyMs).toBe(500);
  });

  it('calculates confidence intervals', () => {
    const results = [
      createMockResult('baseline-full', true, 1.0, 5, 5),
      createMockResult('baseline-full', true, 0.9, 5, 5),
      createMockResult('baseline-full', true, 0.8, 5, 5),
    ];

    const reports = aggregateByTechnique(results);
    const ci = reports[0].metrics.ci95;

    // CI should be defined
    expect(ci.exactMatchRate.lower).toBeDefined();
    expect(ci.exactMatchRate.upper).toBeDefined();
    expect(ci.entityRecall.lower).toBeDefined();
    expect(ci.entityRecall.upper).toBeDefined();

    // Upper should be >= lower
    expect(ci.exactMatchRate.upper).toBeGreaterThanOrEqual(ci.exactMatchRate.lower);
    expect(ci.entityRecall.upper).toBeGreaterThanOrEqual(ci.entityRecall.lower);
  });

  it('handles empty results', () => {
    const reports = aggregateByTechnique([]);
    expect(reports).toHaveLength(0);
  });
});

describe('generateReport', () => {
  it('creates report with metadata', () => {
    const results = [createMockResult('baseline-full', true, 1.0, 5, 5)];
    const report = generateReport(results, 'exp-123', 'claude', 'opus-4.5');

    expect(report.experimentId).toBe('exp-123');
    expect(report.cli).toBe('claude');
    expect(report.model).toBe('opus-4.5');
    expect(report.timestamp).toBeDefined();
    expect(report.techniques).toHaveLength(1);
  });
});

describe('formatReportMarkdown', () => {
  it('generates valid markdown', () => {
    const results = [
      createMockResult('baseline-full', true, 1.0, 5, 5),
      createMockResult('baseline-none', false, 0.5, 3, 3),
    ];
    const report = generateReport(results, 'exp-123', 'claude');
    const markdown = formatReportMarkdown(report);

    expect(markdown).toContain('# Experiment Report');
    expect(markdown).toContain('baseline-full');
    expect(markdown).toContain('baseline-none');
    expect(markdown).toContain('| Technique |');
    expect(markdown).toContain('Confidence Intervals');
  });
});
