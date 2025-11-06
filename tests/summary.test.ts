import { describe, it, expect } from 'vitest';
import { createMCPClient } from './helpers/mcp-client.js';
import { createLcovFile } from './helpers/lcov-builder.js';

describe('coverage_summary tool', () => {
  it('when all lines in 2 files are covered, then returns 100%', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 2, coveredLines: [1, 2] },
      { path: 'src/utils.ts', lines: 2, coveredLines: [1, 2] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(100);
  });

  it('when only lines 2 and 4 are covered out of 4, then returns 50%', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 4, coveredLines: [2, 4] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(50);
  });

  it('when no lines are covered, then returns 0%', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { lines: 10, coveredLines: [] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(0);
  });

  it('when lcov file has no files, then returns 0%', async () => {
    // Arrange
    const lcovPath = await createLcovFile([]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(0);
  });

  it('when file has no lines, then returns 0%', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { lines: 0, coveredLines: [] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(0);
  });

  it('when file has both line and branch coverage, then returns both metrics', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { lines: 4, coveredLines: [1, 2, 3, 4], branches: 4, coveredBranches: [1, 2, 3] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(100);
    expect(result.branchesCoveragePercentage).toBe(75);
  });

  it('when file has no branch data, then returns 0 for branchesCoveragePercentage', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { lines: 4, coveredLines: [1, 2] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(50);
    expect(result.branchesCoveragePercentage).toBe(0);
  });

  it('when multiple files with branches, then returns aggregate branch coverage', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { lines: 2, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2] },
      { lines: 2, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2, 3, 4] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(100);
    expect(result.branchesCoveragePercentage).toBe(75);
  });

  it('when lcov path does not exist, then returns error', async () => {
    // Arrange
    const nonExistentLcovPath = '/tmp/this-file-definitely-does-not-exist.lcov';
    const client = await createMCPClient();

    // Act
    const error = await client.callToolExpectingError('coverage_summary', {
      lcovPath: nonExistentLcovPath
    });

    // Assert
    expect(error).toMatchObject({
      isError: true,
      code: 'LCOV_FILE_NOT_FOUND',
      message: expect.any(String)
    });
  });
});
