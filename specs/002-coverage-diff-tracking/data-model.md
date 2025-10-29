# Data Model: Coverage Diff Tracking

**Feature**: Coverage Diff Tracking
**Phase**: 1 - Design
**Date**: 2025-10-28

## Overview

This document defines the data structures and entities for coverage diff tracking functionality.

## Core Types

### CoverageDiffInfo

The result of comparing current coverage against a recorded snapshot.

```typescript
type CoverageDiffInfo = {
  linesPercentageImpact: number;
  branchesPercentageImpact: number;
};
```

**Fields**:
- `linesPercentageImpact` (number): Difference in line coverage percentage (current - snapshot)
  - Positive values = coverage improved
  - Negative values = coverage decreased
  - Zero = no change
  - Range: -100 to +100
  - Precision: Two decimal places

- `branchesPercentageImpact` (number): Difference in branch coverage percentage (current - snapshot)
  - Same interpretation as linesPercentageImpact
  - Range: -100 to +100
  - Precision: Two decimal places

**Example**:
```typescript
{
  linesPercentageImpact: 12.5,      // Coverage improved by 12.5%
  branchesPercentageImpact: -3.2    // Branch coverage decreased by 3.2%
}
```

**Usage**:
- Returned by `get_diff_since_start` MCP tool
- Consumed by AI agents to understand their impact on test coverage
- Displayed to users as positive (green) or negative (red) values

### Enhanced CoverageMetrics

Extended version of existing coverage metrics to include branch coverage.

```typescript
type CoverageMetrics = {
  linesCoveragePercentage: number;
  branchesCoveragePercentage: number;
};
```

**Fields**:
- `linesCoveragePercentage` (number): Percentage of lines covered by tests
  - Range: 0 to 100
  - Precision: Two decimal places
  - Calculation: (linesHit / linesFound) * 100

- `branchesCoveragePercentage` (number): Percentage of branches covered by tests
  - Range: 0 to 100
  - Precision: Two decimal places
  - Calculation: (branchesHit / branchesFound) * 100
  - Returns 0 if LCOV has no branch data

**Example**:
```typescript
{
  linesCoveragePercentage: 85.7,
  branchesCoveragePercentage: 72.3
}
```

**Usage**:
- Returned by all existing coverage tools (coverage_summary, file_coverage)
- Used internally for diff calculation
- Backward compatible - adds new field without removing existing one

## File System Entities

### Coverage Snapshot

A stored copy of an LCOV coverage file used as a baseline for future comparisons.

**Storage Location**: `recording/last-recording.lcov` (relative to project root)

**Format**: Standard LCOV format (text file)

**Lifecycle**:
1. Created by `start_recording` tool
2. Replaced when `start_recording` called again (only one snapshot exists)
3. Read by `get_diff_since_start` tool
4. Persists until explicitly replaced (survives process restarts)

**Content**: Full LCOV file containing:
- Test name (TN)
- Source file paths (SF)
- Line data (DA, LF, LH)
- Branch data (BRDA, BRF, BRH)
- End of record markers (end_of_record)

**Size**: Typically 10KB to 10MB depending on project size

**Validation**:
- Must be valid LCOV format
- Must be parseable by @friedemannsommer/lcov-parser
- Must contain at least line coverage data (branch data optional)

## Domain Operations

### Recording Workflow

```
State: No snapshot exists
  ↓
Action: start_recording called with lcovPath
  ↓
Process:
  1. Resolve LCOV path to absolute path
  2. Verify LCOV file exists
  3. Create recording/ folder if needed
  4. Delete last-recording.lcov if exists
  5. Copy LCOV to recording/last-recording.lcov
  ↓
State: Snapshot exists (ready for diff)
  ↓
Result: Return "Recording started"
```

### Diff Calculation Workflow

```
State: Snapshot exists
  ↓
Action: get_diff_since_start called with lcovPath
  ↓
Process:
  1. Resolve LCOV path to absolute path
  2. Verify current LCOV file exists
  3. Read and parse snapshot LCOV
  4. Read and parse current LCOV
  5. Calculate snapshot metrics (lines %, branches %)
  6. Calculate current metrics (lines %, branches %)
  7. Compute diffs (current - snapshot for each)
  ↓
State: Unchanged (snapshot still available for next diff)
  ↓
Result: Return CoverageDiffInfo object
```

## Error States

### LCOV_FILE_NOT_FOUND

**Trigger**: LCOV path provided to start_recording or get_diff_since_start doesn't exist

**Response**:
```typescript
{
  code: 'LCOV_FILE_NOT_FOUND',
  message: 'LCOV file not found at path: {path}'
}
```

**Recovery**: User must provide valid LCOV path

### NO_RECORDING_FOUND

**Trigger**: get_diff_since_start called but no snapshot exists

**Response**:
```typescript
{
  code: 'NO_RECORDING_FOUND',
  message: 'No coverage recording found. Call start_recording first.'
}
```

**Recovery**: User must call start_recording before getting diff

### INVALID_LCOV_FORMAT

**Trigger**: LCOV file exists but cannot be parsed

**Response**:
```typescript
{
  code: 'INVALID_LCOV_FORMAT',
  message: 'Invalid LCOV format: {details}'
}
```

**Recovery**: User must fix LCOV file or regenerate coverage

## Data Flow Diagram

```
┌─────────────────┐
│ Current LCOV    │
│ (coverage.lcov) │
└────────┬────────┘
         │
         │ start_recording
         │
         ↓
┌─────────────────┐
│   Snapshot      │
│ (last-recording │
│   .lcov)        │
└────────┬────────┘
         │
         │ [Code changes + test runs]
         │
         ↓
┌─────────────────┐
│ New LCOV        │
│ (coverage.lcov) │
└────────┬────────┘
         │
         │ get_diff_since_start
         │
         ↓
┌─────────────────┐       ┌─────────────────┐
│   Snapshot      │       │   New LCOV      │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │ Parse & Calculate       │ Parse & Calculate
         ↓                         ↓
    Lines: 75%                 Lines: 87.5%
    Branches: 60%              Branches: 58%
         │                         │
         └───────────┬─────────────┘
                     │
                     │ Subtract
                     ↓
              CoverageDiffInfo
              {
                linesPercentageImpact: +12.5,
                branchesPercentageImpact: -2.0
              }
```

## Validation Rules

### For start_recording Input

1. `lcovPath` must be provided (required parameter)
2. `lcovPath` must point to existing file
3. File must be readable by process
4. File must be valid LCOV format

### For get_diff_since_start Input

1. `lcovPath` must be provided (required parameter)
2. `lcovPath` must point to existing file
3. Snapshot must exist in recording/ folder
4. Both current and snapshot files must be valid LCOV format

### For CoverageDiffInfo Output

1. `linesPercentageImpact` must be finite number
2. `branchesPercentageImpact` must be finite number
3. Both values must be in range [-100, 100]
4. Values rounded to 2 decimal places for display

## Integration Points

### With Existing Calculator

The enhanced calculator returns both metrics:

```typescript
// Before (existing)
function calculateProjectCoverage(lcovData): { linesCoveragePercentage: number }

// After (enhanced - backward compatible)
function calculateProjectCoverage(lcovData): {
  linesCoveragePercentage: number;
  branchesCoveragePercentage: number;
}
```

All existing callers continue to work - they can ignore the new field.

### With MCP Tools

New tools integrate seamlessly with existing tool registration:

```typescript
tools: [
  'coverage_summary',           // Enhanced to return branches %
  'file_coverage',              // Enhanced to return branches %
  'start_recording',            // NEW
  'get_diff_since_start'        // NEW
]
```

## Assumptions

1. Only one snapshot needed at a time (no history tracking)
2. Snapshot persists until explicitly replaced (no auto-expiration)
3. Percentage precision of 2 decimals is sufficient
4. LCOV files under 10MB (typical for most projects)
5. recording/ folder at project root is acceptable location
6. No concurrent recording operations (single-threaded Node.js)
