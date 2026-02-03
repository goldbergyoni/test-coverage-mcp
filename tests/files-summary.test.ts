import { describe, it, expect } from 'vitest';
import { createMCPClient } from './helpers/mcp-client.js';
import { createLcovFile } from './helpers/lcov-builder.js';

describe('coverage_files_summary tool', () => {
  it('when multiple files are requested, then returns coverage for each file', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 10, coveredLines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
      { path: 'src/utils.ts', lines: 4, coveredLines: [1, 2] },
      { path: 'src/helpers.ts', lines: 5, coveredLines: [1] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_files_summary', {
      lcovPath,
      filePaths: ['src/main.ts', 'src/utils.ts']
    });

    expect(result).toEqual([
      { path: 'src/main.ts', linesCoveragePercentage: 100, branchesCoveragePercentage: 0 },
      { path: 'src/utils.ts', linesCoveragePercentage: 50, branchesCoveragePercentage: 0 }
    ]);
  });

  it('when empty file list is provided, then returns empty array', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 5, coveredLines: [1, 2, 3, 4, 5] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_files_summary', {
      lcovPath,
      filePaths: []
    });

    expect(result).toEqual([]);
  });

  it('when some files not found in LCOV, then returns 0% for those files', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 4, coveredLines: [1, 2, 3, 4] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_files_summary', {
      lcovPath,
      filePaths: ['src/main.ts', 'src/notfound.ts']
    });

    expect(result).toEqual([
      { path: 'src/main.ts', linesCoveragePercentage: 100, branchesCoveragePercentage: 0 },
      { path: 'src/notfound.ts', linesCoveragePercentage: 0, branchesCoveragePercentage: 0 }
    ]);
  });

  it('when files have branch coverage, then returns both line and branch percentages', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/logic.ts', lines: 4, coveredLines: [1, 2, 3], branches: 4, coveredBranches: [1, 2] },
      { path: 'src/utils.ts', lines: 2, coveredLines: [1, 2], branches: 2, coveredBranches: [1] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_files_summary', {
      lcovPath,
      filePaths: ['src/logic.ts', 'src/utils.ts']
    });

    expect(result).toEqual([
      { path: 'src/logic.ts', linesCoveragePercentage: 75, branchesCoveragePercentage: 50 },
      { path: 'src/utils.ts', linesCoveragePercentage: 100, branchesCoveragePercentage: 50 }
    ]);
  });

  it('when lcov path does not exist, then returns error', async () => {
    const nonExistentLcovPath = '/tmp/this-file-definitely-does-not-exist.lcov';
    const client = await createMCPClient();

    const error = await client.callToolExpectingError('coverage_files_summary', {
      lcovPath: nonExistentLcovPath,
      filePaths: ['src/any.ts']
    });

    expect(error).toMatchObject({
      isError: true,
      code: 'LCOV_FILE_NOT_FOUND',
      message: expect.any(String)
    });
  });

  it('when file has zero instrumented lines, then returns 0% coverage', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/empty.ts', lines: 0, coveredLines: [] },
      { path: 'src/main.ts', lines: 4, coveredLines: [1, 2, 3, 4] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_files_summary', {
      lcovPath,
      filePaths: ['src/empty.ts', 'src/main.ts']
    });

    expect(result).toEqual([
      { path: 'src/empty.ts', linesCoveragePercentage: 0, branchesCoveragePercentage: 0 },
      { path: 'src/main.ts', linesCoveragePercentage: 100, branchesCoveragePercentage: 0 }
    ]);
  });

  it('when requesting single file, then returns array with one element', async () => {
    const lcovPath = await createLcovFile([
      { path: 'src/single.ts', lines: 2, coveredLines: [1] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_files_summary', {
      lcovPath,
      filePaths: ['src/single.ts']
    });

    expect(result).toEqual([
      { path: 'src/single.ts', linesCoveragePercentage: 50, branchesCoveragePercentage: 0 }
    ]);
  });
});
