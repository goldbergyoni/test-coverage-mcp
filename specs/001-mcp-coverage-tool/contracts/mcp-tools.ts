/**
 * MCP Tool Schemas
 *
 * Zod schemas for MCP tool input validation
 * Phase 1 - Contracts
 */

import { z } from 'zod';

/**
 * Tool 1: get_overall_coverage
 *
 * Gets overall line coverage percentage from an LCOV file
 */
export const GetOverallCoverageSchema = z.object({
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file. Can be absolute or relative. Example: "./coverage/lcov.info"'
  )
});

export type GetOverallCoverageInput = z.infer<typeof GetOverallCoverageSchema>;

/**
 * Tool 2: get_file_coverage
 *
 * Gets coverage for specific files only
 */
export const GetFileCoverageSchema = z.object({
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file'
  ),
  filePaths: z.array(z.string()).describe(
    'Array of file paths to analyze. Paths should match those in the LCOV file (relative or absolute). Example: ["src/parser.ts", "src/coverage.ts"]'
  )
});

export type GetFileCoverageInput = z.infer<typeof GetFileCoverageSchema>;

/**
 * Tool 3: start_coverage_snapshot
 *
 * Creates a snapshot of current coverage for later comparison
 */
export const StartSnapshotSchema = z.object({
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file to snapshot'
  )
});

export type StartSnapshotInput = z.infer<typeof StartSnapshotSchema>;

/**
 * Tool 4: end_coverage_snapshot
 *
 * Compares current coverage against a snapshot
 */
export const EndSnapshotSchema = z.object({
  snapshotId: z.string().describe(
    'The snapshot ID returned from start_coverage_snapshot'
  ),
  lcovPath: z.string().describe(
    'Path to the current LCOV coverage file to compare against the snapshot'
  )
});

export type EndSnapshotInput = z.infer<typeof EndSnapshotSchema>;

/**
 * Tool Configuration Type
 *
 * Used for registering tools with MCP server
 */
export type ToolConfig = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, z.ZodTypeAny>;
};

/**
 * All tool configurations for registration
 */
export const TOOL_CONFIGS: ToolConfig[] = [
  {
    name: 'get_overall_coverage',
    title: 'Get Overall Project Coverage',
    description: 'Analyzes an LCOV coverage file and returns the overall line coverage percentage for the entire project. Use this before making code changes to establish a baseline. Returns a single percentage value representing total project coverage.',
    inputSchema: GetOverallCoverageSchema.shape
  },
  {
    name: 'get_file_coverage',
    title: 'Get Coverage for Specific Files',
    description: 'Returns line coverage percentage for specific files only. Use this after modifying files to check coverage impact on just those files. More efficient than parsing the entire report when you only care about specific files. Returns coverage percentage for each requested file.',
    inputSchema: GetFileCoverageSchema.shape
  },
  {
    name: 'start_coverage_snapshot',
    title: 'Start Coverage Snapshot',
    description: 'Creates a snapshot of current coverage state for later comparison. Use this before making code changes to track coverage impact. The snapshot is stored temporarily and can be compared later using end_coverage_snapshot. Returns a snapshot ID that must be saved for the comparison step.',
    inputSchema: StartSnapshotSchema.shape
  },
  {
    name: 'end_coverage_snapshot',
    title: 'End Coverage Snapshot and Compare',
    description: 'Compares current coverage against a previously created snapshot and returns the difference. Shows overall coverage change and per-file changes (increases/decreases). Use this after making code changes to see coverage impact. Identifies new files added and files removed since the snapshot.',
    inputSchema: EndSnapshotSchema.shape
  }
];
