# Research: Coverage Diff Tracking

**Feature**: Coverage Diff Tracking
**Phase**: 0 - Research
**Date**: 2025-10-28

## Overview

This document captures research decisions for implementing coverage diff tracking. Since this feature builds on existing infrastructure and uses proven patterns, minimal research was needed.

## Key Decisions

### 1. Snapshot Storage Approach

**Decision**: Copy LCOV file to local `recording/` folder with fixed filename `last-recording.lcov`

**Rationale**:
- Simple file copy operation using Node.js fs.promises.copyFile
- Fixed filename makes it easy to locate and prevents accumulation of old snapshots
- Local folder (not tmp) ensures snapshot persists across test runs until explicitly replaced
- Single snapshot approach keeps implementation simple for first iteration

**Alternatives Considered**:
- SQLite storage: Rejected - adds dependency, overkill for storing a single file
- Multiple named snapshots: Rejected - adds complexity, not needed for initial use case
- In-memory storage: Rejected - loses snapshot if process restarts

### 2. Diff Calculation Algorithm

**Decision**: Parse both LCOV files, calculate total coverage percentages, subtract to get impact

**Algorithm**:
```
1. Parse snapshot LCOV → get lines/branches totals
2. Parse current LCOV → get lines/branches totals
3. Calculate snapshot percentages: (covered / total) * 100
4. Calculate current percentages: (covered / total) * 100
5. Return {
     linesPercentageImpact: current.lines - snapshot.lines,
     branchesPercentageImpact: current.branches - snapshot.branches
   }
```

**Rationale**:
- Reuses existing calculator.ts functions for percentage calculation
- Simple subtraction gives clear positive/negative impact
- No need to track individual file changes for first iteration
- Matches user's mental model: "did coverage go up or down?"

**Alternatives Considered**:
- Per-file diff with detailed changes: Rejected - too complex for MVP, not requested
- Absolute numbers instead of percentages: Rejected - percentages easier to interpret
- Comparing parsed data structures: Rejected - percentages sufficient for impact tracking

### 3. Branch Coverage Integration

**Decision**: Enhance existing calculator.ts to return both lines and branches percentages

**Approach**:
- Modify return type from `{ linesCoveragePercentage: number }` to include `branchesCoveragePercentage: number`
- Parse branch hit/found data from LCOV (BRH/BRF records)
- Apply same calculation logic as lines: (branchesHit / branchesFound) * 100
- Return 0 if no branch data present (maintains backward compatibility)

**Rationale**:
- LCOV format already includes branch data (BRH/BRF)
- @friedemannsommer/lcov-parser already extracts branch data
- Consistent with existing line coverage calculation
- No breaking changes - adds new field, doesn't remove existing

**Alternatives Considered**:
- Separate tool for branch coverage: Rejected - users want both metrics together
- Optional parameter to request branches: Rejected - simpler to always include both

### 4. Error Handling Strategy

**Decision**: Throw typed errors for missing files, let MCP framework convert to error responses

**Error Cases**:
1. LCOV file not found when recording → throw `LCOV_FILE_NOT_FOUND`
2. No snapshot exists when getting diff → throw `NO_RECORDING_FOUND`
3. LCOV parse errors → throw `INVALID_LCOV_FORMAT`

**Rationale**:
- Consistent with existing error handling in codebase
- MCP handlers already catch and format errors properly
- Typed errors (using existing errors.ts) provide clear messaging
- Fail fast for irrecoverable situations

**Alternatives Considered**:
- Return error objects instead of throwing: Rejected - inconsistent with existing patterns
- Silent defaults (e.g., 0% if no snapshot): Rejected - hides problems, confuses users

## Technical Specifications

### File System Operations

Using Node.js `fs/promises` for async file operations:
- `copyFile(source, dest)` - Copy LCOV to recording folder
- `unlink(path)` - Delete old snapshot if exists
- `readFile(path)` - Read LCOV for parsing
- `mkdir(path, { recursive: true })` - Ensure recording folder exists

**Error handling**: Catch ENOENT for missing files, let other errors propagate

### LCOV Parsing

Reuse existing parser.ts which wraps @friedemannsommer/lcov-parser:
- Already handles various LCOV formats
- Extracts lines data: LF (lines found), LH (lines hit)
- Extracts branches data: BRF (branches found), BRH (branches hit)
- Returns structured data for calculator

### Percentage Calculation

Extend existing calculator.ts logic:
```typescript
type CoverageMetrics = {
  linesCoveragePercentage: number;
  branchesCoveragePercentage: number;
};

function calculateCoverage(lcovData): CoverageMetrics {
  const lines = (linesHit / linesFound) * 100 || 0;
  const branches = (branchesHit / branchesFound) * 100 || 0;
  return { linesCoveragePercentage: lines, branchesCoveragePercentage: branches };
}
```

## Testing Strategy

### Test Data Factory

Extend existing `createLcovFile` helper to support branch coverage:
```typescript
createLcovFile([
  {
    path: 'src/main.ts',
    lines: 10,
    coveredLines: [1, 2, 3],
    branches: 4,
    coveredBranches: [0, 1]  // NEW: branch coverage data
  }
])
```

### Key Test Scenarios (8 tests total)

**Recording Tests (3)**:
1. When LCOV exists, recording succeeds and stores snapshot
2. When recording twice, second recording replaces first
3. When LCOV doesn't exist, recording fails with clear error

**Diff Calculation Tests (4)**:
4. When coverage improves, diff returns positive values
5. When coverage decreases, diff returns negative values
6. When coverage unchanged, diff returns zero
7. When no recording exists, diff fails with clear error

**Branch Coverage Tests (1)**:
8. When LCOV has branch data, existing tools return both metrics

### Test Pattern

All tests follow existing pattern:
```typescript
it('when [scenario], then [expectation]', async () => {
  // Arrange - create test data
  const lcovPath = await createLcovFile([...]);
  const client = await createMCPClient();

  // Act - call MCP tool
  const result = await client.callTool('tool_name', { params });

  // Assert - verify result
  expect(result.field).toBe(expected);
});
```

## Implementation Notes

### Function Size Guidelines

All functions must stay under 20 lines per constitution:
- `copySnapshot()` - 5 lines: ensure dir exists, copy file
- `deleteSnapshot()` - 3 lines: try unlink, catch ENOENT
- `readSnapshot()` - 4 lines: check exists, read file, parse
- `calculateDiff()` - 8 lines: parse both, calculate both percentages, subtract, return
- `extractBranchCoverage()` - 6 lines: sum BRH/BRF, calculate percentage

### MCP Handler Pattern

Handlers remain thin adapters (5-7 lines each):
```typescript
async start_recording({ lcovPath }): Promise<string> {
  const resolvedPath = await resolveLcovPath(lcovPath);
  await recordSnapshot(resolvedPath);
  return "Recording started";
}

async get_diff_since_start({ lcovPath }): Promise<CoverageDiffInfo> {
  const resolvedPath = await resolveLcovPath(lcovPath);
  return await calculateDiffSinceRecording(resolvedPath);
}
```

## References

- [LCOV Format Guide](../../src/core/lcov_guide.md) - Branch coverage format (BRH/BRF)
- Existing parser.ts - LCOV parsing patterns
- Existing calculator.ts - Coverage percentage calculation
- Node.js fs/promises docs - File system operations
