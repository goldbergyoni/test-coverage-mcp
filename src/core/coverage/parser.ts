import { createReadStream } from 'fs';
// @ts-expect-error - lcov-parser uses export= which conflicts with NodeNext module resolution
import lcovParser from '@friedemannsommer/lcov-parser';
import { LcovSection } from './types.js';
import { createError } from '../errors.js';

export const parseLcovFile = async (filePath: string): Promise<LcovSection[]> => {
  try {
    const stream = createReadStream(filePath);
    const parsed = await lcovParser({ from: stream });
    return parsed as LcovSection[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw createError('LCOV_FILE_NOT_FOUND', `LCOV file not found: ${filePath}`);
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw createError('LCOV_PARSE_ERROR', `Failed to parse LCOV file: ${filePath}. Error: ${errorMessage}`, error);
  }
};
