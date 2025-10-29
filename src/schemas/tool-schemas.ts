/**
 * MCP Tool Schemas for Coverage Analyzer
 *
 * This file contains Zod schemas for all MCP tool inputs and outputs.
 * These schemas provide runtime validation and TypeScript type inference.
 */

import { z } from 'zod';

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Schema for coverage_summary tool input
 */
export const CoverageSummaryInputSchema = z.object({
  lcovPath: z
    .string()
    .optional()
    .describe('Path to the LCOV coverage file. Can be absolute or relative. Defaults to ./coverage/lcov.info')
});

/**
 * Schema for coverage_file_summary tool input
 */
export const CoverageFileSummaryInputSchema = z.object({
  lcovPath: z
    .string()
    .optional()
    .describe('Path to the LCOV coverage file. Can be absolute or relative. Defaults to ./coverage/lcov.info'),
  filePath: z
    .string()
    .describe('File path to get coverage for')
});

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Basic coverage info structure
 */
const CoverageInfoSchema = z.object({
  linesCoveragePercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('Line coverage percentage (0-100)'),
  branchesCoveragePercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('Branch coverage percentage (0-100). Returns 0 if no branch data.')
});

/**
 * File coverage info structure
 */
const FileCoverageInfoSchema = z.object({
  path: z.string().describe('File path'),
  coverageInfo: CoverageInfoSchema
});

/**
 * Schema for coverage_summary tool output (overall coverage only)
 */
export const CoverageSummaryOutputSchema = CoverageInfoSchema;

/**
 * Schema for coverage_file_summary tool output (single file coverage)
 */
export const CoverageFileSummaryOutputSchema = FileCoverageInfoSchema;

/**
 * Schema for start_recording tool input
 */
export const StartRecordingInputSchema = z.object({
  lcovPath: z
    .string()
    .describe('Absolute or relative path to the LCOV coverage file to record as baseline (e.g., \'coverage/lcov.info\' or \'./coverage.lcov\')')
});

/**
 * Schema for start_recording tool output
 */
export const StartRecordingOutputSchema = z
  .string()
  .describe('Success message confirming recording started');

/**
 * Schema for get_diff_since_start tool input
 */
export const GetDiffSinceStartInputSchema = z.object({
  lcovPath: z
    .string()
    .describe('Absolute or relative path to the current LCOV coverage file to compare against baseline (e.g., \'coverage/lcov.info\')')
});

/**
 * Schema for get_diff_since_start tool output
 */
export const GetDiffSinceStartOutputSchema = z.object({
  linesPercentageImpact: z
    .number()
    .describe('Change in line coverage percentage (current minus baseline). Positive = improvement, negative = regression.'),
  branchesPercentageImpact: z
    .number()
    .describe('Change in branch coverage percentage (current minus baseline). Positive = improvement, negative = regression.')
});

// ============================================================================
// Type Exports (using Zod inference)
// ============================================================================

export type CoverageSummaryInput = z.infer<typeof CoverageSummaryInputSchema>;
export type CoverageFileSummaryInput = z.infer<typeof CoverageFileSummaryInputSchema>;

export type CoverageInfo = z.infer<typeof CoverageInfoSchema>;
export type FileCoverageInfo = z.infer<typeof FileCoverageInfoSchema>;
export type CoverageSummaryOutput = z.infer<typeof CoverageSummaryOutputSchema>;
export type CoverageFileSummaryOutput = z.infer<typeof CoverageFileSummaryOutputSchema>;

export type StartRecordingInput = z.infer<typeof StartRecordingInputSchema>;
export type StartRecordingOutput = z.infer<typeof StartRecordingOutputSchema>;
export type GetDiffSinceStartInput = z.infer<typeof GetDiffSinceStartInputSchema>;
export type GetDiffSinceStartOutput = z.infer<typeof GetDiffSinceStartOutputSchema>;

// ============================================================================
// Tool Registration Helpers
// ============================================================================

/**
 * Tool configuration for MCP server registration
 */
export const TOOL_CONFIGS = {
  coverage_summary: {
    title: 'Get Overall Coverage Summary',
    description: 'Analyzes an LCOV coverage file and returns overall project line coverage percentage. Use this before making code changes to establish a baseline or after changes to verify impact.',
    inputSchema: CoverageSummaryInputSchema
  },
  coverage_file_summary: {
    title: 'Get File Coverage Summary',
    description: 'Analyzes an LCOV coverage file and returns line coverage percentage for a specific file. Use this to check coverage for individual files.',
    inputSchema: CoverageFileSummaryInputSchema
  },
} as const;