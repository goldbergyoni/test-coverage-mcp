# Data Model: MCP Coverage Analysis Tool

**Date**: 2025-10-23 | **Feature**: 001-mcp-coverage-tool | **Phase**: 1 (Design)

## Overview

This document defines the data structures and types used throughout the MCP coverage analysis tool. All types are defined using TypeScript `type` aliases (not interfaces) per project constitution.

## Core Domain Types

### Coverage Information Types

```typescript
// Basic coverage information for a single entity
type CoverageInfo = {
  linesCoveragePercentage: number; // 0-100, with 1 decimal precision
};

// Coverage information for a specific file
type FileCoverageInfo = {
  path: string; // Normalized file path
  coverageInfo: CoverageInfo;
};

// Results from comparing two coverage states
type RecordResults = {
  before: CoverageInfo;
  after: CoverageInfo;
  changeInPercentage: number; // Can be negative
};
```

### Extended Domain Types

```typescript
// Detailed file coverage with line-level information
type DetailedFileCoverage = {
  path: string;
  totalLines: number;
  coveredLines: number;
  uncoveredLines: number[];
  linesCoveragePercentage: number;
};

// Coverage delta between two states
type CoverageDelta = {
  overallChange: number; // Percentage point change (can be negative)
  fileChanges: FileDeltaInfo[];
  newFiles: string[]; // Files added since recording started
  removedFiles: string[]; // Files removed since recording started
};

// Per-file delta information
type FileDeltaInfo = {
  path: string;
  beforePercentage: number;
  afterPercentage: number;
  changePercentage: number; // Percentage point change
};

// Recording session metadata
type RecordingSession = {
  id: string; // UUID v4
  timestamp: number; // Unix timestamp in milliseconds
  lcovPath: string; // Source LCOV file path
  coverageSnapshot: CoverageSnapshot;
};

// Snapshot of coverage at a point in time
type CoverageSnapshot = {
  overallCoverage: CoverageInfo;
  fileCoverage: Map<string, DetailedFileCoverage>;
  totalFiles: number;
  timestamp: number;
};
```

## LCOV Parser Types

```typescript
// Types from @friedemannsommer/lcov-parser
type LcovSection = {
  title: string; // File path (SF record)
  lines: {
    found: number; // Total lines (LF record)
    hit: number; // Covered lines (LH record)
    details: LcovLineDetail[];
  };
  functions?: {
    found: number;
    hit: number;
    details: LcovFunctionDetail[];
  };
  branches?: {
    found: number;
    hit: number;
    details: LcovBranchDetail[];
  };
};

type LcovLineDetail = {
  line: number; // Line number
  hit: number; // Execution count (0 = not covered)
};

type LcovFunctionDetail = {
  name: string;
  line: number;
  hit: number;
};

type LcovBranchDetail = {
  line: number;
  block: number;
  branch: number;
  taken: number;
};
```

## MCP Protocol Types

```typescript
// MCP tool response types
type ToolResponse = {
  content: Array<{
    type: 'text';
    text: string; // JSON stringified result
  }>;
  isError?: boolean;
};

// MCP tool input schemas (using Zod inference)
type GetCoverageInput = {
  lcovPath?: string; // Optional, defaults to ./coverage/lcov.info
  filePath?: string; // Optional, for file-specific coverage
};

type StartRecordingInput = {
  lcovPath?: string; // Optional, defaults to ./coverage/lcov.info
};

type EndRecordingInput = {
  recordingId: string; // Required recording ID from start_coverage_record
  lcovPath?: string; // Optional, defaults to ./coverage/lcov.info
};
```

## Error Types

```typescript
// Application-specific error types
type CoverageError = {
  code: CoverageErrorCode;
  message: string;
  details?: unknown;
};

type CoverageErrorCode =
  | 'LCOV_FILE_NOT_FOUND'
  | 'LCOV_PARSE_ERROR'
  | 'FILE_NOT_IN_COVERAGE'
  | 'RECORDING_NOT_FOUND'
  | 'INVALID_RECORDING_ID'
  | 'PATH_RESOLUTION_ERROR';

// Error response format
type ErrorResponse = {
  error: CoverageError;
  timestamp: number;
};
```

## Test Helper Types

```typescript
// Types for test helper utilities
type LcovBuilderFile = {
  path: string;
  lines: LcovBuilderLine[];
};

type LcovBuilderLine = {
  lineNumber: number;
  isHit: boolean;
  executionCount?: number; // Optional, defaults to 1 if isHit is true
};

type LcovBuilderOptions = {
  includeFunction?: boolean; // Include function coverage
  includeBranch?: boolean; // Include branch coverage
};
```

## Storage Types

```typescript
// File system storage for recordings
type RecordingStorageMetadata = {
  activeRecordings: Map<string, RecordingStorageEntry>;
  storageBasePath: string; // Base temp directory path
};

type RecordingStorageEntry = {
  id: string;
  filePath: string; // Full path to JSON file
  createdAt: number;
  expiresAt: number; // Auto-cleanup after 1 hour
};
```

## Validation Rules

### Coverage Percentages
- Must be between 0 and 100 (inclusive)
- Stored with 1 decimal place precision
- Calculated as: `(coveredLines / totalLines) * 100`
- When totalLines is 0, coverage is 0%

### File Paths
- Normalized using `path.normalize()`
- Relative paths resolved from current working directory
- Case-sensitive matching on Unix systems
- Case-insensitive matching on Windows

### Recording IDs
- UUID v4 format (e.g., "550e8400-e29b-41d4-a716-446655440000")
- Must be unique across all active recordings
- Automatically cleaned up after 1 hour of inactivity

### LCOV File Requirements
- Must be valid LCOV format
- Can contain either summary sections (LF/LH) or line details (DA)
- Empty files are treated as 0% coverage
- Maximum file size: 50MB (configurable)

## State Transitions

### Recording Lifecycle

```
NONE -> RECORDING_STARTED -> RECORDING_ENDED -> NONE
         ^                                        |
         |________________________________________|
                    (can start new recording)
```

### Coverage Calculation States

```
LCOV_FILE -> PARSE -> CALCULATE -> RETURN_RESULT
                |           |
                v           v
            ERROR      ERROR
```

## Data Flow

### Overall Coverage Request
1. Input: `lcovPath` (optional)
2. Parse LCOV file → `LcovSection[]`
3. Calculate overall coverage → `CoverageInfo`
4. Return formatted response

### File-Specific Coverage Request
1. Input: `lcovPath`, `filePath` or `filePaths`
2. Parse LCOV file → `LcovSection[]`
3. Filter to requested files
4. Calculate per-file coverage → `FileCoverageInfo[]`
5. Return formatted response

### Recording Workflow
1. Start: Parse current LCOV → Create `CoverageSnapshot` → Store with ID
2. End: Parse new LCOV → Load stored snapshot → Calculate `CoverageDelta`
3. Return comparison results

## Performance Characteristics

### Memory Usage
- LCOV parsing: O(n) where n = file size
- Coverage storage: O(f) where f = number of files
- Recording storage: O(r) where r = number of active recordings

### Time Complexity
- Overall coverage: O(n) for parsing + O(f) for calculation
- File-specific: O(n) for parsing + O(1) for lookup per file
- Recording comparison: O(f) for delta calculation

### Storage Requirements
- Recording snapshot: ~2KB + (100 bytes × number of files)
- Temporary storage: Automatically cleaned after 1 hour
- Maximum concurrent recordings: Limited by available temp disk space