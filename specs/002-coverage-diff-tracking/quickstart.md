# Quickstart: Coverage Diff Tracking

**Feature**: Coverage Diff Tracking
**Phase**: 1 - Design
**Date**: 2025-10-28

## Overview

This guide helps developers understand and implement the coverage diff tracking feature. It covers the core workflow, key functions, and integration points.

## User Workflow

### Basic Diff Tracking Flow

```
1. Agent establishes baseline
   → Call: start_recording({ lcovPath: 'coverage/lcov.info' })
   → Returns: "Recording started"

2. Agent makes code changes and writes tests

3. Agent runs tests to generate new coverage
   → Test runner creates new coverage/lcov.info

4. Agent checks impact
   → Call: get_diff_since_start({ lcovPath: 'coverage/lcov.info' })
   → Returns: {
       linesPercentageImpact: 12.5,
       branchesPercentageImpact: -3.2
     }

5. Agent interprets results
   → Positive = coverage improved
   → Negative = coverage decreased
   → Zero = no change
```

### Example Agent Interaction

```typescript
// Agent starts work on a feature
await mcp.callTool('start_recording', { lcovPath: './coverage/lcov.info' });
// → "Recording started"

// ... agent writes code and tests ...

// Agent checks impact after running tests
const impact = await mcp.callTool('get_diff_since_start', {
  lcovPath: './coverage/lcov.info'
});
// → { linesPercentageImpact: 8.3, branchesPercentageImpact: 5.1 }

// Agent reports: "I improved coverage by 8.3% lines and 5.1% branches"
```

## Core Implementation

### Module Structure

```
src/core/coverage/
├── recorder.ts           # NEW: Snapshot management
├── diff-calculator.ts    # NEW: Diff computation
├── calculator.ts         # MODIFIED: Add branch coverage
├── parser.ts             # Existing: LCOV parsing
├── types.ts              # MODIFIED: Add CoverageDiffInfo type
└── path-resolver.ts      # Existing: Path resolution
```

### Key Functions to Implement

#### 1. recorder.ts - Snapshot Management

```typescript
// Create or replace coverage snapshot
export async function recordSnapshot(lcovPath: string): Promise<void> {
  await ensureRecordingDir();
  await deleteExistingSnapshot();
  await copyToSnapshot(lcovPath);
}

// Read stored snapshot
export async function readSnapshot(): Promise<string> {
  if (!snapshotExists()) {
    throw new NoRecordingFoundError();
  }
  return await fs.readFile(SNAPSHOT_PATH, 'utf-8');
}

// Helper functions (each < 10 lines)
async function ensureRecordingDir(): Promise<void>
async function deleteExistingSnapshot(): Promise<void>
async function copyToSnapshot(source: string): Promise<void>
function snapshotExists(): boolean
```

**Design notes**:
- Fixed snapshot path: `recording/last-recording.lcov`
- Use fs/promises for async operations
- Delete before copy to handle existing snapshots
- Let errors propagate for missing source files

#### 2. diff-calculator.ts - Diff Computation

```typescript
// Calculate coverage diff between snapshot and current
export async function calculateDiff(currentLcovPath: string): Promise<CoverageDiffInfo> {
  const snapshotContent = await readSnapshot();
  const currentContent = await fs.readFile(currentLcovPath, 'utf-8');

  const snapshotMetrics = await calculateMetrics(snapshotContent);
  const currentMetrics = await calculateMetrics(currentContent);

  return {
    linesPercentageImpact: currentMetrics.lines - snapshotMetrics.lines,
    branchesPercentageImpact: currentMetrics.branches - snapshotMetrics.branches
  };
}

// Parse LCOV and calculate percentages
async function calculateMetrics(lcovContent: string): Promise<Metrics> {
  const parsed = await parseLcov(lcovContent);
  return {
    lines: calculateLinesPercentage(parsed),
    branches: calculateBranchesPercentage(parsed)
  };
}
```

**Design notes**:
- Reuse existing calculator functions
- Return rounded percentages (2 decimals)
- Throw typed errors for missing files
- Keep functions small and focused

#### 3. calculator.ts - Enhanced Coverage Calculation

```typescript
// BEFORE (existing)
export function calculateProjectCoverage(lcovData: LcovData): number {
  const { linesHit, linesFound } = sumLcovData(lcovData);
  return (linesHit / linesFound) * 100 || 0;
}

// AFTER (enhanced - backward compatible)
export function calculateProjectCoverage(lcovData: LcovData): CoverageMetrics {
  const { linesHit, linesFound, branchesHit, branchesFound } = sumLcovData(lcovData);

  return {
    linesCoveragePercentage: (linesHit / linesFound) * 100 || 0,
    branchesCoveragePercentage: (branchesHit / branchesFound) * 100 || 0
  };
}

// Update sumLcovData to also extract branch data
function sumLcovData(lcovData: LcovData) {
  // Add branches extraction from BRDA/BRF/BRH records
}
```

**Design notes**:
- Add branch metrics extraction to existing summing logic
- Return 0 for branches if no branch data in LCOV
- Maintain backward compatibility (change return type, not signature)
- Round percentages to 2 decimals

### Type Definitions

```typescript
// Add to src/core/coverage/types.ts

export type CoverageDiffInfo = {
  linesPercentageImpact: number;
  branchesPercentageImpact: number;
};

export type CoverageMetrics = {
  linesCoveragePercentage: number;
  branchesCoveragePercentage: number;
};
```

## MCP Integration

### Handler Implementation

Add to `src/mcp/handlers.ts`:

```typescript
// New handler: Record baseline
async start_recording(args: { lcovPath: string }): Promise<string> {
  const resolvedPath = await resolveLcovPath(args.lcovPath);
  await recordSnapshot(resolvedPath);
  return "Recording started";
}

// New handler: Get diff
async get_diff_since_start(args: { lcovPath: string }): Promise<CoverageDiffInfo> {
  const resolvedPath = await resolveLcovPath(args.lcovPath);
  return await calculateDiff(resolvedPath);
}
```

### Schema Registration

Add to `src/schemas/tool-schemas.ts`:

```typescript
export const START_RECORDING_SCHEMA = {
  name: 'start_recording',
  description: 'Record current coverage as baseline for future comparison',
  inputSchema: {
    type: 'object',
    properties: {
      lcovPath: {
        type: 'string',
        description: 'Path to LCOV file to record as baseline'
      }
    },
    required: ['lcovPath']
  }
};

export const GET_DIFF_SCHEMA = {
  name: 'get_diff_since_start',
  description: 'Calculate coverage diff since baseline recording',
  inputSchema: {
    type: 'object',
    properties: {
      lcovPath: {
        type: 'string',
        description: 'Path to current LCOV file'
      }
    },
    required: ['lcovPath']
  }
};
```

## Testing Strategy

### Test File Structure

```typescript
// tests/diff-tracking.test.ts

describe('start_recording tool', () => {
  it('when valid lcov provided, then recording succeeds', async () => {
    const lcovPath = await createLcovFile([/* data */]);
    const client = await createMCPClient();

    const result = await client.callTool('start_recording', { lcovPath });

    expect(result).toBe('Recording started');
  });

  // 2 more tests for recording...
});

describe('get_diff_since_start tool', () => {
  it('when coverage improves, then returns positive values', async () => {
    const client = await createMCPClient();

    // Arrange: Record baseline with 50% coverage
    const baselinePath = await createLcovFile([
      { lines: 10, coveredLines: [1,2,3,4,5] }
    ]);
    await client.callTool('start_recording', { lcovPath: baselinePath });

    // Act: New coverage with 80% coverage
    const currentPath = await createLcovFile([
      { lines: 10, coveredLines: [1,2,3,4,5,6,7,8] }
    ]);
    const diff = await client.callTool('get_diff_since_start', {
      lcovPath: currentPath
    });

    // Assert
    expect(diff.linesPercentageImpact).toBe(30);
  });

  // 3 more tests for diff calculation...
});

describe('enhanced coverage tools', () => {
  it('when lcov has branch data, then returns both metrics', async () => {
    const lcovPath = await createLcovFile([
      {
        lines: 10,
        coveredLines: [1,2,3,4,5],
        branches: 4,
        coveredBranches: [0, 1, 2]
      }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_summary', { lcovPath });

    expect(result.linesCoveragePercentage).toBe(50);
    expect(result.branchesCoveragePercentage).toBe(75);
  });
});
```

### Test Data Helper Enhancement

Extend `createLcovFile` to support branch data:

```typescript
// tests/helpers/lcov-builder.ts

type FileSpec = {
  path?: string;
  lines: number;
  coveredLines?: number[];
  branches?: number;           // NEW
  coveredBranches?: number[];  // NEW
};

export async function createLcovFile(files: FileSpec[]): Promise<string> {
  const lcovContent = files.map(file => `
TN:
SF:${file.path || 'test.ts'}
${generateLineData(file.lines, file.coveredLines)}
${generateBranchData(file.branches, file.coveredBranches)}
end_of_record
  `).join('\n');

  // Write to temp file and return path
}

function generateBranchData(total?: number, covered?: number[]): string {
  if (!total) return '';
  // Generate BRDA, BRF, BRH records
}
```

## Error Handling

### Error Scenarios

```typescript
// 1. LCOV file not found when recording
try {
  await recordSnapshot('/nonexistent/lcov.info');
} catch (error) {
  // → LcovFileNotFoundError
  // User sees: "LCOV file not found at path: /nonexistent/lcov.info"
}

// 2. No recording exists when getting diff
try {
  await calculateDiff('./coverage/lcov.info');
} catch (error) {
  // → NoRecordingFoundError
  // User sees: "No coverage recording found. Call start_recording first."
}

// 3. Invalid LCOV format
try {
  await recordSnapshot('./corrupted.lcov');
} catch (error) {
  // → InvalidLcovFormatError
  // User sees: "Invalid LCOV format: {parse error details}"
}
```

### Error Type Definitions

Add to `src/core/errors.ts`:

```typescript
export class NoRecordingFoundError extends Error {
  code = 'NO_RECORDING_FOUND';
  constructor() {
    super('No coverage recording found. Call start_recording first.');
  }
}
```

## File System Layout

```
project-root/
├── coverage/
│   └── lcov.info              # Current coverage (regenerated by tests)
├── recording/
│   └── last-recording.lcov    # Snapshot (managed by our tool)
├── src/
│   └── core/
│       └── coverage/
│           ├── recorder.ts           # NEW
│           ├── diff-calculator.ts    # NEW
│           └── ...
└── tests/
    ├── diff-tracking.test.ts         # NEW
    └── enhanced-coverage.test.ts     # NEW
```

## Implementation Checklist

Phase 1 deliverables:

- [x] research.md - Technical decisions documented
- [x] data-model.md - Types and entities defined
- [x] contracts/mcp-tools.json - API contracts specified
- [x] quickstart.md - Implementation guide created
- [ ] Update agent context - Run update-agent-context.sh

Next phase (via `/speckit.tasks`):

- [ ] Implement recorder.ts
- [ ] Implement diff-calculator.ts
- [ ] Enhance calculator.ts with branch coverage
- [ ] Add CoverageDiffInfo type to types.ts
- [ ] Add MCP handlers
- [ ] Add tool schemas
- [ ] Write 8 integration tests
- [ ] Update existing tests for branch coverage
- [ ] Run linter and fix issues
- [ ] Manual testing with real LCOV files

## Key Design Decisions

1. **Single snapshot**: Only one recording at a time (simple, sufficient for MVP)
2. **Fixed location**: `recording/` folder at project root (predictable, easy to find)
3. **File copy approach**: Copy entire LCOV file (simple, no parsing needed for storage)
4. **Percentage diff**: Subtract percentages, not absolute numbers (easier interpretation)
5. **Backward compatible**: Add fields, don't change existing APIs (no breaking changes)
6. **Short functions**: All functions under 20 lines (constitutional requirement)
7. **Integration tests only**: Test via MCP client (matches project pattern)
8. **Existing helpers**: Reuse createLcovFile and createMCPClient (consistency)
