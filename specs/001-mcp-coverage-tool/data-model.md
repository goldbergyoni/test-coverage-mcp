# Data Model: MCP Coverage Analysis Tool

**Feature**: MCP Coverage Analysis Tool
**Date**: 2025-10-21
**Phase**: Phase 1 - Design

## Overview

This document defines all data types, entities, and their relationships for the MCP coverage analysis tool. All types use TypeScript `type` declarations (not `interface`) following the function-based architecture pattern.

---

## Core Entity Types

### CoverageReport

Represents parsed LCOV file data containing line coverage information for all files in a project.

```typescript
type CoverageReport = {
  overall: number;
  totalLines: number;
  coveredLines: number;
  files: Record<string, FileCoverage>;
};
```

**Properties**:
- `overall`: Overall coverage percentage for the entire project (0-100, one decimal place)
- `totalLines`: Total number of lines across all files in the project
- `coveredLines`: Total number of covered lines across all files
- `files`: Map of file paths to their coverage data

**Validation Rules**:
- `overall` must be between 0 and 100
- `coveredLines` must be <= `totalLines`
- `files` keys must be non-empty strings (file paths)

**Usage**: Returned by parsing functions and used for overall coverage calculations

---

### FileCoverage

Represents coverage data for a single file.

```typescript
type FileCoverage = {
  path: string;
  totalLines: number;
  coveredLines: number;
  percentage: number;
  uncoveredLines: number[];
};
```

**Properties**:
- `path`: File path (as it appears in LCOV file)
- `totalLines`: Total number of executable lines in the file
- `coveredLines`: Number of lines that were executed
- `percentage`: Coverage percentage for this file (0-100, one decimal place)
- `uncoveredLines`: Array of line numbers that are not covered

**Validation Rules**:
- `path` must be non-empty string
- `coveredLines` must be <= `totalLines`
- `percentage` must be between 0 and 100
- `uncoveredLines` must contain valid positive integers

**Usage**: Represents coverage for individual files, used in file-specific queries and delta calculations

---

### CoverageSnapshot

Represents a point-in-time capture of coverage data used for comparison.

```typescript
type CoverageSnapshot = {
  id: string;
  timestamp: number;
  lcovPath: string;
  coverageData: CoverageReport;
};
```

**Properties**:
- `id`: Unique identifier (UUID v4 format)
- `timestamp`: Unix timestamp in milliseconds when snapshot was created
- `lcovPath`: Path to the LCOV file that was snapshotted
- `coverageData`: The coverage report at the time of snapshot

**Validation Rules**:
- `id` must be valid UUID v4 format
- `timestamp` must be positive integer
- `lcovPath` must be non-empty string
- `coverageData` must be valid CoverageReport

**Usage**: Stored temporarily for later comparison, returned by snapshot creation

---

### CoverageDelta

Represents the difference between two coverage states (before and after).

```typescript
type CoverageDelta = {
  overallChange: number;
  fileChanges: Record<string, FileDelta>;
  newFiles: string[];
  removedFiles: string[];
};
```

**Properties**:
- `overallChange`: Change in overall coverage percentage (can be positive, negative, or zero)
- `fileChanges`: Map of file paths to their coverage changes
- `newFiles`: Array of file paths that exist in current but not in snapshot
- `removedFiles`: Array of file paths that existed in snapshot but not in current

**Validation Rules**:
- `overallChange` must be between -100 and 100
- `fileChanges` keys must be non-empty strings
- `newFiles` and `removedFiles` must be arrays of strings

**Usage**: Returned when comparing snapshots to show coverage impact

---

### FileDelta

Represents coverage change for a single file.

```typescript
type FileDelta = {
  before: number;
  after: number;
  change: number;
  linesAdded: number;
  linesRemoved: number;
};
```

**Properties**:
- `before`: Coverage percentage before changes
- `after`: Coverage percentage after changes
- `change`: Difference (after - before), can be positive, negative, or zero
- `linesAdded`: Number of new covered lines
- `linesRemoved`: Number of lines that became uncovered

**Validation Rules**:
- `before` and `after` must be between 0 and 100
- `change` must equal `after - before`
- `linesAdded` and `linesRemoved` must be non-negative integers

**Usage**: Used within CoverageDelta to show per-file changes

---

## LCOV Parser Types

### LcovSection

Represents a parsed section from LCOV file (one section per source file).

```typescript
type LcovSection = {
  title: string;
  lines: LcovLines;
  functions?: LcovFunctions;
  branches?: LcovBranches;
};
```

**Properties**:
- `title`: File path from LCOV file
- `lines`: Line coverage data (required)
- `functions`: Function coverage data (optional - not used in v1)
- `branches`: Branch coverage data (optional - not used in v1)

**Note**: This type comes from @friedemannsommer/lcov-parser. We focus on `lines` only for v1.

---

### LcovLines

Represents line coverage within an LCOV section.

```typescript
type LcovLines = {
  found: number;
  hit: number;
  details: LcovLineDetail[];
};
```

**Properties**:
- `found`: Total number of executable lines (LF in LCOV)
- `hit`: Number of lines that were executed (LH in LCOV)
- `details`: Array of per-line execution data

**Usage**: Parsed from LCOV, used to calculate coverage percentages

---

### LcovLineDetail

Represents execution data for a single line.

```typescript
type LcovLineDetail = {
  line: number;
  hit: number;
};
```

**Properties**:
- `line`: Line number in the source file
- `hit`: Execution count (0 = not covered, >0 = covered)

**Usage**: Used to identify uncovered lines

---

## MCP Request/Response Types

### GetOverallCoverageRequest

```typescript
type GetOverallCoverageRequest = {
  lcovPath: string;
};
```

**Properties**:
- `lcovPath`: Path to LCOV file (absolute or relative)

---

### GetOverallCoverageResponse

```typescript
type GetOverallCoverageResponse = {
  overall: number;
};
```

**Properties**:
- `overall`: Overall project coverage percentage (0-100, one decimal place)

---

### GetFileCoverageRequest

```typescript
type GetFileCoverageRequest = {
  lcovPath: string;
  filePaths: string[];
};
```

**Properties**:
- `lcovPath`: Path to LCOV file
- `filePaths`: Array of file paths to get coverage for

---

### GetFileCoverageResponse

```typescript
type GetFileCoverageResponse = {
  files: Record<string, number>;
};
```

**Properties**:
- `files`: Map of requested file paths to their coverage percentages

**Note**: Files not found in LCOV return 0% coverage

---

### StartSnapshotRequest

```typescript
type StartSnapshotRequest = {
  lcovPath: string;
};
```

**Properties**:
- `lcovPath`: Path to LCOV file to snapshot

---

### StartSnapshotResponse

```typescript
type StartSnapshotResponse = {
  snapshotId: string;
  timestamp: number;
};
```

**Properties**:
- `snapshotId`: Unique identifier for this snapshot (UUID)
- `timestamp`: Unix timestamp when snapshot was created

---

### EndSnapshotRequest

```typescript
type EndSnapshotRequest = {
  snapshotId: string;
  lcovPath: string;
};
```

**Properties**:
- `snapshotId`: ID returned from start_coverage_snapshot
- `lcovPath`: Path to current LCOV file to compare

---

### EndSnapshotResponse

```typescript
type EndSnapshotResponse = {
  overallChange: number;
  fileChanges: Record<string, number>;
  newFiles: string[];
  removedFiles: string[];
};
```

**Properties**:
- `overallChange`: Change in overall coverage
- `fileChanges`: Map of file paths to coverage change amounts
- `newFiles`: Files added since snapshot
- `removedFiles`: Files removed since snapshot

---

## Error Types

### McpToolError

```typescript
type McpToolError = {
  isError: true;
  content: Array<{
    type: 'text';
    text: string;
  }>;
};
```

**Properties**:
- `isError`: Always `true` for errors
- `content`: Array containing error message

**Error Categories**:
1. **File Not Found**: LCOV file doesn't exist
2. **Parse Error**: LCOV file is malformed or invalid
3. **Snapshot Not Found**: Invalid or expired snapshot ID
4. **File Not in Coverage**: Requested file not found in LCOV report

---

## Function Signatures

These type signatures define the core business logic functions.

### Parser Functions

```typescript
type ParseLcovFile = (lcovPath: string) => Promise<LcovSection[]>;
type CalculateOverallCoverage = (sections: LcovSection[]) => number;
type CalculateFileCoverage = (section: LcovSection) => FileCoverage;
type FindUncoveredLines = (details: LcovLineDetail[]) => number[];
```

### Coverage Functions

```typescript
type GetOverallCoverageFromSections = (sections: LcovSection[]) => CoverageReport;
type GetFileCoverageFromSections = (
  sections: LcovSection[],
  filePaths: string[]
) => Record<string, number>;
type NormalizePath = (filePath: string) => string;
type FindSectionByPath = (
  sections: LcovSection[],
  targetPath: string
) => LcovSection | undefined;
```

### Snapshot Functions

```typescript
type CreateSnapshot = (coverageData: CoverageReport) => Promise<string>;
type LoadSnapshot = (snapshotId: string) => Promise<CoverageSnapshot>;
type CompareCoverage = (
  before: CoverageReport,
  after: CoverageReport
) => CoverageDelta;
type CalculateFileDelta = (
  beforeFile: FileCoverage | undefined,
  afterFile: FileCoverage | undefined
) => FileDelta;
```

### MCP Handler Functions

```typescript
type HandleGetOverallCoverage = (
  request: GetOverallCoverageRequest
) => Promise<GetOverallCoverageResponse | McpToolError>;

type HandleGetFileCoverage = (
  request: GetFileCoverageRequest
) => Promise<GetFileCoverageResponse | McpToolError>;

type HandleStartSnapshot = (
  request: StartSnapshotRequest
) => Promise<StartSnapshotResponse | McpToolError>;

type HandleEndSnapshot = (
  request: EndSnapshotRequest
) => Promise<EndSnapshotResponse | McpToolError>;
```

---

## Data Flow

### 1. Get Overall Coverage Flow

```
User Request � HandleGetOverallCoverage
  �
ParseLcovFile(lcovPath) � LcovSection[]
  �
GetOverallCoverageFromSections � CoverageReport
  �
Return { overall: number }
```

### 2. Get File Coverage Flow

```
User Request � HandleGetFileCoverage
  �
ParseLcovFile(lcovPath) � LcovSection[]
  �
For each filePath:
  NormalizePath � normalized path
  FindSectionByPath � LcovSection | undefined
  CalculateFileCoverage � FileCoverage
  �
Return { files: Record<string, number> }
```

### 3. Snapshot Comparison Flow

```
Start Snapshot:
  User Request � HandleStartSnapshot
    �
  ParseLcovFile � LcovSection[]
    �
  GetOverallCoverageFromSections � CoverageReport
    �
  CreateSnapshot � snapshotId
    �
  Return { snapshotId, timestamp }

End Snapshot:
  User Request � HandleEndSnapshot
    �
  LoadSnapshot(snapshotId) � CoverageSnapshot
  ParseLcovFile(currentPath) � LcovSection[]
    �
  GetOverallCoverageFromSections � currentReport
    �
  CompareCoverage(snapshot.coverageData, currentReport) � CoverageDelta
    �
  Return delta
```

---

## State Transitions

### Snapshot State Machine

```
[No Snapshot]
    � start_coverage_snapshot
[Snapshot Created] (stored in temp dir with UUID)
    � end_coverage_snapshot
[Comparison Computed] � return delta
    �
[No Snapshot] (can create new snapshot)
```

**States**:
1. **No Snapshot**: Initial state, no active snapshot exists
2. **Snapshot Created**: Snapshot stored with UUID, ready for comparison
3. **Comparison Computed**: Delta calculated and returned

**Transitions**:
- `start_coverage_snapshot`: No Snapshot � Snapshot Created
- `end_coverage_snapshot`: Snapshot Created � Comparison Computed � No Snapshot

**Note**: Multiple snapshots can exist concurrently with unique UUIDs

---

## Validation Rules Summary

### CoverageReport
-  overall: 0-100
-  coveredLines <= totalLines
-  files: Record keys non-empty

### FileCoverage
-  path: non-empty string
-  coveredLines <= totalLines
-  percentage: 0-100
-  uncoveredLines: positive integers

### CoverageSnapshot
-  id: valid UUID v4
-  timestamp: positive integer
-  lcovPath: non-empty string
-  coverageData: valid CoverageReport

### CoverageDelta
-  overallChange: -100 to 100
-  fileChanges keys: non-empty strings
-  newFiles/removedFiles: string arrays

---

## Implementation Notes

1. **Type Safety**: All types use TypeScript `type` (not `interface`) for consistency
2. **Purity**: All function types are pure functions (no side effects in core logic)
3. **Token Efficiency**: Response types are minimal, containing only essential data
4. **Path Handling**: All path comparisons use normalized absolute paths
5. **Precision**: Coverage percentages rounded to one decimal place
6. **Error Handling**: All handlers return `Response | McpToolError` union types
7. **Simplicity**: V1 focuses on line coverage only (not functions/branches)

---

## Next Steps

After data model definition:
1. Create contracts/ directory with tool contracts (Zod schemas)
2. Create quickstart.md with usage examples
3. Verify all types align with MCP protocol requirements
4. Proceed to Phase 2 (tasks.md generation)
