/**
 * Dataset loading and validation utilities
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import type { TestConversation, ConversationTurn, RecallQuestion } from '../types.js';

export class DatasetValidationError extends Error {
  constructor(message: string, public path?: string) {
    super(message);
    this.name = 'DatasetValidationError';
  }
}

/**
 * Validate that data conforms to TestConversation schema
 */
export function validateDataset(data: unknown, path?: string): asserts data is TestConversation {
  if (typeof data !== 'object' || data === null) {
    throw new DatasetValidationError('Dataset must be an object', path);
  }

  const obj = data as Record<string, unknown>;

  // Validate id
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    throw new DatasetValidationError('Dataset must have a non-empty string "id"', path);
  }

  // Validate turns
  if (!Array.isArray(obj.turns)) {
    throw new DatasetValidationError('Dataset must have an array "turns"', path);
  }

  for (let i = 0; i < obj.turns.length; i++) {
    validateTurn(obj.turns[i], `turns[${i}]`, path);
  }

  // Validate recallQuestions
  if (!Array.isArray(obj.recallQuestions)) {
    throw new DatasetValidationError('Dataset must have an array "recallQuestions"', path);
  }

  for (let i = 0; i < obj.recallQuestions.length; i++) {
    validateRecallQuestion(obj.recallQuestions[i], `recallQuestions[${i}]`, path);
  }
}

function validateTurn(turn: unknown, field: string, path?: string): asserts turn is ConversationTurn {
  if (typeof turn !== 'object' || turn === null) {
    throw new DatasetValidationError(`${field} must be an object`, path);
  }

  const obj = turn as Record<string, unknown>;

  if (obj.role !== 'user' && obj.role !== 'assistant') {
    throw new DatasetValidationError(`${field}.role must be "user" or "assistant"`, path);
  }

  if (typeof obj.content !== 'string') {
    throw new DatasetValidationError(`${field}.content must be a string`, path);
  }

  // metadata is optional, but validate if present
  if (obj.metadata !== undefined) {
    if (typeof obj.metadata !== 'object' || obj.metadata === null) {
      throw new DatasetValidationError(`${field}.metadata must be an object`, path);
    }

    const meta = obj.metadata as Record<string, unknown>;

    if (typeof meta.containsKeyInfo !== 'boolean') {
      throw new DatasetValidationError(`${field}.metadata.containsKeyInfo must be a boolean`, path);
    }

    if (meta.keyInfoType !== undefined) {
      const validTypes = ['identity', 'preference', 'fact', 'instruction'];
      if (!validTypes.includes(meta.keyInfoType as string)) {
        throw new DatasetValidationError(
          `${field}.metadata.keyInfoType must be one of: ${validTypes.join(', ')}`,
          path
        );
      }
    }

    if (meta.salienceLevel !== undefined) {
      const validLevels = ['high', 'medium', 'low'];
      if (!validLevels.includes(meta.salienceLevel as string)) {
        throw new DatasetValidationError(
          `${field}.metadata.salienceLevel must be one of: ${validLevels.join(', ')}`,
          path
        );
      }
    }
  }
}

function validateRecallQuestion(
  question: unknown,
  field: string,
  path?: string
): asserts question is RecallQuestion {
  if (typeof question !== 'object' || question === null) {
    throw new DatasetValidationError(`${field} must be an object`, path);
  }

  const obj = question as Record<string, unknown>;

  if (typeof obj.question !== 'string') {
    throw new DatasetValidationError(`${field}.question must be a string`, path);
  }

  if (typeof obj.expectedAnswer !== 'string') {
    throw new DatasetValidationError(`${field}.expectedAnswer must be a string`, path);
  }

  if (!Array.isArray(obj.expectedEntities)) {
    throw new DatasetValidationError(`${field}.expectedEntities must be an array`, path);
  }

  for (const entity of obj.expectedEntities) {
    if (typeof entity !== 'string') {
      throw new DatasetValidationError(`${field}.expectedEntities must contain only strings`, path);
    }
  }

  const validLocations = ['early', 'middle', 'recent'];
  if (!validLocations.includes(obj.infoLocation as string)) {
    throw new DatasetValidationError(
      `${field}.infoLocation must be one of: ${validLocations.join(', ')}`,
      path
    );
  }

  const validLevels = ['high', 'medium', 'low'];
  if (!validLevels.includes(obj.salienceLevel as string)) {
    throw new DatasetValidationError(
      `${field}.salienceLevel must be one of: ${validLevels.join(', ')}`,
      path
    );
  }
}

/**
 * Load a single dataset from a JSON file
 */
export async function loadDataset(path: string): Promise<TestConversation> {
  const content = await readFile(path, 'utf-8');
  const data = JSON.parse(content);
  validateDataset(data, path);
  return data;
}

/**
 * Load all datasets from a directory
 */
export async function loadAllDatasets(dir: string): Promise<TestConversation[]> {
  const files = await readdir(dir);
  const jsonFiles = files.filter(f => extname(f) === '.json');

  const datasets: TestConversation[] = [];
  for (const file of jsonFiles) {
    const dataset = await loadDataset(join(dir, file));
    datasets.push(dataset);
  }

  return datasets;
}

/**
 * CLI entry point for validation
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--validate')) {
    const dir = args[args.indexOf('--validate') + 1] || join(import.meta.dirname, 'samples');

    try {
      const datasets = await loadAllDatasets(dir);
      console.log(`Validated ${datasets.length} datasets successfully`);
      for (const ds of datasets) {
        console.log(`  - ${ds.id}: ${ds.turns.length} turns, ${ds.recallQuestions.length} questions`);
      }
    } catch (error) {
      if (error instanceof DatasetValidationError) {
        console.error(`Validation error${error.path ? ` in ${error.path}` : ''}: ${error.message}`);
        process.exit(1);
      }
      throw error;
    }
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
