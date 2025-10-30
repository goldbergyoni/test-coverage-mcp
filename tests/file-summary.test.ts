import { describe, it, expect } from 'vitest';
import { createMCPClient } from './helpers/mcp-client.js';
import { createLcovFile } from './helpers/lcov-builder.js';

describe('coverage_file_summary tool', () => {
  it('when all lines in file are covered, then returns 100%', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 5, coveredLines: [1, 2, 3, 4, 5] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_file_summary', {
      lcovPath,
      filePath: 'src/main.ts'
    });

    expect(result).toMatchObject({
      path: 'src/main.ts',
      coverageInfo: { linesCoveragePercentage: 100 }
    });
  });

  it('when only 2 out of 4 lines are covered, then returns 50%', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/utils.ts', lines: 4, coveredLines: [2, 4] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_file_summary', {
      lcovPath,
      filePath: 'src/utils.ts'
    });

    expect(result).toMatchObject({
      path: 'src/utils.ts',
      coverageInfo: { linesCoveragePercentage: 50 }
    });
  });

  it('when no lines are covered, then returns 0%', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/empty.ts', lines: 10, coveredLines: [] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_file_summary', {
      lcovPath,
      filePath: 'src/empty.ts'
    });

    expect(result).toMatchObject({
      path: 'src/empty.ts',
      coverageInfo: { linesCoveragePercentage: 0 }
    });
  });

  it('when querying specific file among multiple files, then returns only that file coverage', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 4, coveredLines: [1, 2, 3, 4] },
      { path: 'src/utils.ts', lines: 10, coveredLines: [1, 2, 3, 4, 5] },
      { path: 'src/helpers.ts', lines: 2, coveredLines: [] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_file_summary', {
      lcovPath,
      filePath: 'src/utils.ts'
    });

    expect(result).toMatchObject({
      path: 'src/utils.ts',
      coverageInfo: { linesCoveragePercentage: 50 }
    });
  });

  it('when file not found in lcov, then returns 0% coverage', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 5, coveredLines: [1, 2, 3, 4, 5] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_file_summary', {
      lcovPath,
      filePath: 'src/notfound.ts'
    });

    expect(result).toMatchObject({
      path: 'src/notfound.ts',
      coverageInfo: { linesCoveragePercentage: 0 }
    });
  });

  it('when lcov path does not exist, then returns error', async () => {
    const nonExistentLcovPath = '/tmp/this-file-definitely-does-not-exist.lcov';
    const client = await createMCPClient();

    const error = await client.callToolExpectingError('coverage_file_summary', {
      lcovPath: nonExistentLcovPath,
      filePath: 'src/any.ts'
    });

    expect(error).toMatchObject({
      isError: true,
      code: 'LCOV_FILE_NOT_FOUND',
      message: expect.any(String)
    });
  });
});
