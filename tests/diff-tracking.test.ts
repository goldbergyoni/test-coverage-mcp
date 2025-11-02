import { describe, test, expect, beforeEach } from 'vitest';
import { rm } from 'fs/promises';
import { createMCPClient } from './helpers/mcp-client.js';
import { createLcovFile, createDefaultLcovFile, generateNonExistentPath } from './helpers/lcov-builder.js';

beforeEach(async () => {
  await rm('./recording', { force: true, recursive: true });
});

describe('Coverage diff tracking - start recording', () => {
  describe('When recording successfully', () => {
    test('when recording baseline for the first time, then returns success message', async () => {
      // Arrange
      const lcovPath = await createDefaultLcovFile();
      const client = await createMCPClient();

      // Act
      const result = await client.callTool('start_recording', { lcovPath });

      // Assert
      expect(result).toBe('Recording started');
    });

    test('when recording baseline again, then replaces previous recording', async () => {
      // Arrange
      const firstLcovPath = await createLcovFile([
        { lines: 3, coveredLines: [1, 2] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: firstLcovPath });
      const secondLcovPath = await createLcovFile([
        { lines: 3, coveredLines: [1, 2, 3] }
      ]);

      // Act
      const result = await client.callTool('start_recording', { lcovPath: secondLcovPath });

      // Assert
      expect(result).toBe('Recording started');
    });
  });

  describe('When recording fails', () => {
    test('when lcov file does not exist, then returns LCOV_FILE_NOT_FOUND error', async () => {
      // Arrange
      const nonExistentPath = generateNonExistentPath();
      const client = await createMCPClient();

      // Act
      const error = await client.callToolExpectingError('start_recording', { lcovPath: nonExistentPath });

      // Assert
      expect(error).toMatchObject({
        isError: true,
        code: 'LCOV_FILE_NOT_FOUND',
        message: expect.any(String)
      });
    });
  });
});

describe('Coverage diff tracking - get diff since start', () => {
  describe('When coverage improves', () => {
    test('when line coverage improves from 50% to 100%, then returns positive linesPercentageImpact', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 4, coveredLines: [1, 2], branches: 2, coveredBranches: [1] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 4, coveredLines: [1, 2, 3, 4], branches: 2, coveredBranches: [1] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: 50,
        branchesPercentageImpact: 0
      });
    });

    test('when branch coverage improves from 50% to 100%, then returns positive branchesPercentageImpact', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2, 3, 4] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: 0,
        branchesPercentageImpact: 50
      });
    });

    test('when both line and branch coverage improve, then returns positive impact for both', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 4, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 4, coveredLines: [1, 2, 3, 4], branches: 4, coveredBranches: [1, 2, 3, 4] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: 50,
        branchesPercentageImpact: 50
      });
    });
  });

  describe('When coverage decreases', () => {
    test('when line coverage decreases from 75% to 50%, then returns negative linesPercentageImpact', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 4, coveredLines: [1, 2, 3], branches: 4, coveredBranches: [1, 2, 3, 4] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 4, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2, 3, 4] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: -25,
        branchesPercentageImpact: 0
      });
    });

    test('when branch coverage decreases from 100% to 25%, then returns negative branchesPercentageImpact', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2, 3, 4] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2], branches: 4, coveredBranches: [1] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: 0,
        branchesPercentageImpact: -75
      });
    });
  });

  describe('When coverage stays the same', () => {
    test('when coverage remains unchanged, then returns zero impact for both metrics', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2], branches: 4, coveredBranches: [1, 2] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: 0,
        branchesPercentageImpact: 0
      });
    });
  });

  describe('When handling special branch cases', () => {
    test('when baseline has no branches, then returns branchesPercentageImpact of 0', async () => {
      // Arrange
      const baselineLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2] }
      ]);
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const currentLcov = await createLcovFile([
        { lines: 3, coveredLines: [1, 2] }
      ]);

      // Act
      const result = await client.callTool('get_diff_since_start', { lcovPath: currentLcov });

      // Assert
      expect(result).toMatchObject({
        linesPercentageImpact: 0,
        branchesPercentageImpact: 0
      });
    });
  });

  describe('When diff calculation fails', () => {
    test('when no recording exists, then returns NO_RECORDING_FOUND error', async () => {
      // Arrange
      const lcovPath = await createDefaultLcovFile();
      const client = await createMCPClient();

      // Act
      const error = await client.callToolExpectingError('get_diff_since_start', { lcovPath });

      // Assert
      expect(error).toMatchObject({
        isError: true,
        code: 'NO_RECORDING_FOUND',
        message: expect.any(String)
      });
    });

    test('when current lcov file does not exist, then returns LCOV_FILE_NOT_FOUND error', async () => {
      // Arrange
      const baselineLcov = await createDefaultLcovFile();
      const client = await createMCPClient();
      await client.callTool('start_recording', { lcovPath: baselineLcov });
      const nonExistentPath = generateNonExistentPath();

      // Act
      const error = await client.callToolExpectingError('get_diff_since_start', { lcovPath: nonExistentPath });

      // Assert
      expect(error).toMatchObject({
        isError: true,
        code: 'LCOV_FILE_NOT_FOUND',
        message: expect.any(String)
      });
    });
  });
});
