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
    .describe('Line coverage percentage (0-100)')
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
 * Schema for start_coverage_record tool output
 */
export const StartRecordingOutputSchema = z.object({
  recordingId: z
    .string()
    .uuid()
    .describe('Unique identifier for this recording session'),
  timestamp: z
    .number()
    .describe('Unix timestamp in milliseconds when recording was started'),
  baselineCoverage: CoverageInfoSchema.describe('Overall coverage at recording start')
});

/**
 * File change info for recording comparison
 */
const FileChangeSchema = z.object({
  path: z.string().describe('File path'),
  beforePercentage: z.number().min(0).max(100).describe('Coverage when recording started'),
  afterPercentage: z.number().min(0).max(100).describe('Current coverage'),
  changePercentage: z.number().describe('Percentage point change (can be negative)')
});

/**
 * Schema for end_coverage_record tool output
 */
export const EndRecordingOutputSchema = z.object({
  before: CoverageInfoSchema.describe('Coverage when recording started'),
  after: CoverageInfoSchema.describe('Current coverage'),
  changeInPercentage: z
    .number()
    .describe('Percentage point change in coverage (can be negative)'),
  fileChanges: z
    .array(FileChangeSchema)
    .optional()
    .describe('Per-file coverage changes, sorted by largest change first'),
  newFiles: z
    .array(z.string())
    .optional()
    .describe('Files added to coverage since recording started'),
  removedFiles: z
    .array(z.string())
    .optional()
    .describe('Files removed from coverage since recording started')
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
export type StartRecordingOutput = z.infer<typeof StartRecordingOutputSchema>;
export type EndRecordingOutput = z.infer<typeof EndRecordingOutputSchema>;

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