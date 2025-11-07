import { resolve } from 'path';
import { access } from 'fs/promises';
import { createError } from '../errors.js';

const DEFAULT_LCOV_PATH = './coverage/lcov.info';

export const resolveLcovPath = async (providedPath?: string): Promise<string> => {
  const pathToResolve = providedPath ?? DEFAULT_LCOV_PATH;
  const absolutePath = resolve(pathToResolve);

  try {
    await access(absolutePath);
    return absolutePath;
  } catch {
    throw createError(
      'LCOV_FILE_NOT_FOUND',
      `LCOV file not found at: ${absolutePath}${providedPath ? '' : ' (default path)'}`
    );
  }
};
