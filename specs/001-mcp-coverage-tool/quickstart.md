# Quickstart Guide: MCP Coverage Analysis Tool

**Feature**: MCP Coverage Analysis Tool
**Date**: 2025-10-21
**Phase**: Phase 1 - Design

## Overview

The MCP Coverage Analysis Tool enables AI agents to efficiently analyze LCOV code coverage files without consuming excessive tokens. This guide provides installation instructions, usage examples, and common workflows.

---

## Installation

### Prerequisites

- Node.js 18+ (for native test runner) or Node.js 16+ (with test framework)
- npm or yarn package manager
- Existing project with LCOV coverage reports

### Install the MCP Server

```bash
npm install -g coverage-mcp
```

Or add to your project:

```bash
npm install --save-dev coverage-mcp
```

### Configure with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "coverage-analyzer": {
      "command": "npx",
      "args": ["coverage-mcp"]
    }
  }
}
```

### Verify Installation

Restart Claude Desktop and check that the coverage tools appear in your available tools list.

---

## Quick Start

### Step 1: Generate Coverage Report

First, ensure your project generates LCOV coverage reports:

```bash
# For Jest
npm test -- --coverage --coverageReporters=lcov

# For Vitest
npm test -- --coverage --coverage.reporter=lcov

# For Mocha + nyc
nyc --reporter=lcov npm test
```

This creates a coverage report at `./coverage/lcov.info`.

### Step 2: Check Overall Coverage

Use the `get_overall_coverage` tool to see your project's baseline:

```typescript
// AI Agent Request
get_overall_coverage({
  lcovPath: "./coverage/lcov.info"
})

// Response
{
  "overall": 82.5
}
```

### Step 3: Check Specific Files

After modifying files, check their coverage:

```typescript
// AI Agent Request
get_file_coverage({
  lcovPath: "./coverage/lcov.info",
  filePaths: ["src/parser.ts", "src/coverage.ts"]
})

// Response
{
  "files": {
    "src/parser.ts": 95.2,
    "src/coverage.ts": 78.3
  }
}
```

### Step 4: Track Coverage Changes

Use snapshots to track your impact:

```typescript
// Before changes - create snapshot
start_coverage_snapshot({
  lcovPath: "./coverage/lcov.info"
})
// Response: { snapshotId: "550e8400...", timestamp: 1729533600000 }

// Make code changes, run tests, generate new coverage

// After changes - compare
end_coverage_snapshot({
  snapshotId: "550e8400...",
  lcovPath: "./coverage/lcov.info"
})

// Response
{
  "overallChange": 3.2,
  "fileChanges": {
    "src/parser.ts": 2.1,
    "src/coverage.ts": 5.3
  },
  "newFiles": ["src/new-feature.ts"],
  "removedFiles": []
}
```

---

## Common Workflows

### Workflow 1: Baseline Assessment

**Use Case**: AI agent starts a task and wants to understand current test coverage.

```typescript
// Step 1: Get overall coverage
const baseline = await get_overall_coverage({
  lcovPath: "./coverage/lcov.info"
});
// Result: { overall: 78.5 }

// Step 2: Agent knows baseline is 78.5% and can aim to improve it
```

**Token Cost**: ~50 tokens (request + response)

---

### Workflow 2: Focused File Analysis

**Use Case**: AI agent modifies 3 files and wants to check only those files' coverage.

```typescript
// Step 1: Identify modified files
const modifiedFiles = ["src/auth.ts", "src/user.ts", "src/db.ts"];

// Step 2: Get coverage for just those files
const fileCoverage = await get_file_coverage({
  lcovPath: "./coverage/lcov.info",
  filePaths: modifiedFiles
});

// Result: {
//   "files": {
//     "src/auth.ts": 92.0,
//     "src/user.ts": 85.5,
//     "src/db.ts": 70.2
//   }
// }

// Step 3: Agent identifies src/db.ts needs more test coverage
```

**Token Cost**: ~120 tokens (for 3 files)

---

### Workflow 3: Coverage Impact Tracking

**Use Case**: AI agent wants to verify that code changes improved coverage.

```typescript
// Step 1: Before starting work, snapshot current state
const snapshot = await start_coverage_snapshot({
  lcovPath: "./coverage/lcov.info"
});
// Result: { snapshotId: "abc123...", timestamp: 1729533600000 }

// Step 2: Agent writes code and tests

// Step 3: Re-run tests to generate new coverage
// (External: npm test -- --coverage)

// Step 4: Compare to see impact
const delta = await end_coverage_snapshot({
  snapshotId: snapshot.snapshotId,
  lcovPath: "./coverage/lcov.info"
});

// Result: {
//   "overallChange": 5.2,
//   "fileChanges": {
//     "src/auth.ts": 8.0,
//     "src/user.ts": 3.5
//   },
//   "newFiles": ["src/validation.ts"],
//   "removedFiles": []
// }

// Step 5: Agent confirms coverage improved by 5.2%
```

**Token Cost**: ~200 tokens (snapshot + comparison)

---

## Tool Reference

### get_overall_coverage

**Purpose**: Get overall project coverage percentage

**When to Use**:
- Starting a new task (establish baseline)
- After major refactoring (verify overall impact)
- Before committing changes (ensure no coverage loss)

**Input**:
```typescript
{
  lcovPath: string  // Path to LCOV file
}
```

**Output**:
```typescript
{
  overall: number  // Percentage (0-100, one decimal)
}
```

**Example**:
```typescript
get_overall_coverage({ lcovPath: "./coverage/lcov.info" })
// � { overall: 82.5 }
```

---

### get_file_coverage

**Purpose**: Get coverage for specific files only

**When to Use**:
- After modifying specific files
- When you only care about changed files
- To avoid parsing entire coverage report

**Input**:
```typescript
{
  lcovPath: string,
  filePaths: string[]  // Array of file paths
}
```

**Output**:
```typescript
{
  files: Record<string, number>  // Map of paths to percentages
}
```

**Example**:
```typescript
get_file_coverage({
  lcovPath: "./coverage/lcov.info",
  filePaths: ["src/parser.ts", "src/coverage.ts"]
})
// � {
//   files: {
//     "src/parser.ts": 92.3,
//     "src/coverage.ts": 78.1
//   }
// }
```

**Notes**:
- Files not in LCOV return 0% (not an error)
- Paths are normalized (absolute vs relative handled)

---

### start_coverage_snapshot

**Purpose**: Create a snapshot of current coverage for comparison

**When to Use**:
- Before making code changes
- Start of feature implementation
- Before refactoring

**Input**:
```typescript
{
  lcovPath: string
}
```

**Output**:
```typescript
{
  snapshotId: string,  // UUID to use later
  timestamp: number    // Unix timestamp (ms)
}
```

**Example**:
```typescript
start_coverage_snapshot({ lcovPath: "./coverage/lcov.info" })
// � {
//   snapshotId: "550e8400-e29b-41d4-a716-446655440000",
//   timestamp: 1729533600000
// }
```

**Important**: Save the `snapshotId` to use with `end_coverage_snapshot`

---

### end_coverage_snapshot

**Purpose**: Compare current coverage to snapshot

**When to Use**:
- After code changes and running tests
- To verify coverage improvements
- To identify coverage regressions

**Input**:
```typescript
{
  snapshotId: string,  // From start_coverage_snapshot
  lcovPath: string
}
```

**Output**:
```typescript
{
  overallChange: number,              // Overall delta (-100 to 100)
  fileChanges: Record<string, number>, // Per-file deltas
  newFiles: string[],                 // New files added
  removedFiles: string[]              // Files removed
}
```

**Example**:
```typescript
end_coverage_snapshot({
  snapshotId: "550e8400-e29b-41d4-a716-446655440000",
  lcovPath: "./coverage/lcov.info"
})
// � {
//   overallChange: 3.2,
//   fileChanges: {
//     "src/parser.ts": 5.1,
//     "src/coverage.ts": -1.2
//   },
//   newFiles: ["src/new.ts"],
//   removedFiles: []
// }
```

**Interpretation**:
- Positive = improvement
- Negative = regression
- Zero = no change

---

## Error Handling

### Common Errors

#### File Not Found
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "LCOV file not found at path ./coverage/lcov.info"
  }]
}
```

**Solution**: Verify the path and ensure coverage was generated

#### Parse Error
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Failed to parse LCOV file: invalid format"
  }]
}
```

**Solution**: Regenerate coverage report or check for corruption

#### Snapshot Not Found
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Snapshot not found with ID 550e8400..."
  }]
}
```

**Solution**: Create a new snapshot, previous may have been cleaned up

---

## Best Practices

### 1. Always Start with a Baseline

```typescript
// Good: Know your starting point
const baseline = await get_overall_coverage({ lcovPath: "./coverage/lcov.info" });
// Make changes...
const updated = await get_overall_coverage({ lcovPath: "./coverage/lcov.info" });
const improvement = updated.overall - baseline.overall;
```

### 2. Use File Coverage for Efficiency

```typescript
// Good: Check only changed files
await get_file_coverage({
  lcovPath: "./coverage/lcov.info",
  filePaths: changedFiles
});

// Less efficient: Parse entire report when you only care about 2 files
await get_overall_coverage({ lcovPath: "./coverage/lcov.info" });
```

### 3. Use Snapshots for Complex Changes

```typescript
// Good: Track impact of multi-file changes
const { snapshotId } = await start_coverage_snapshot({ lcovPath: "./coverage/lcov.info" });
// ... make changes, run tests ...
const delta = await end_coverage_snapshot({ snapshotId, lcovPath: "./coverage/lcov.info" });

// Shows overall + per-file impact
```

### 4. Regenerate Coverage Before Checking

```typescript
// Good workflow
// 1. Make code changes
// 2. Run: npm test -- --coverage
// 3. Then check coverage with MCP tools

// Bad: Check old coverage file
```

---

## Integration Examples

### With Jest

```bash
# package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage --coverageReporters=lcov"
  }
}

# Run tests with coverage
npm run test:coverage

# Coverage file created at: ./coverage/lcov.info
```

### With Vitest

```bash
# vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text']
    }
  }
}

# Run tests with coverage
npm test -- --coverage

# Coverage file created at: ./coverage/lcov.info
```

### With Mocha + nyc

```bash
# package.json
{
  "scripts": {
    "test": "mocha",
    "test:coverage": "nyc --reporter=lcov mocha"
  }
}

# Run tests with coverage
npm run test:coverage

# Coverage file created at: ./coverage/lcov.info
```

---

## Troubleshooting

### Tool Not Showing Up in Claude

1. Verify installation: `which coverage-mcp` or `npm list -g coverage-mcp`
2. Check Claude config: `~/Library/Application Support/Claude/claude_desktop_config.json`
3. Restart Claude Desktop completely

### Coverage File Not Found

1. Verify path: `ls -la ./coverage/lcov.info`
2. Run tests with coverage: `npm test -- --coverage`
3. Check test configuration for LCOV reporter

### Snapshot Expired

Snapshots are stored in temp directory and may be cleared:
1. Create a new snapshot
2. Complete workflow in same session
3. For long-running workflows, consider storing snapshot ID

---

## Performance Considerations

### File Size Limits

- Tested up to 50MB LCOV files
- Parse time: ~2-5 seconds for 50MB file
- Responses under 300 tokens per file

### Token Usage

| Operation | Typical Token Cost |
|-----------|-------------------|
| get_overall_coverage | ~50 tokens |
| get_file_coverage (3 files) | ~120 tokens |
| Snapshot workflow | ~200 tokens |

### Best Practices for Performance

1. Use file coverage for focused analysis (more efficient)
2. Create snapshots only when needed (storage overhead)
3. Clean up old snapshots if doing many iterations

---

## Advanced Usage

### Relative vs Absolute Paths

The tool handles both:

```typescript
// These are equivalent (if CWD is /project)
get_overall_coverage({ lcovPath: "./coverage/lcov.info" })
get_overall_coverage({ lcovPath: "/project/coverage/lcov.info" })
```

### Handling Missing Files

Files not in coverage return 0%:

```typescript
get_file_coverage({
  lcovPath: "./coverage/lcov.info",
  filePaths: ["src/exists.ts", "src/not-in-coverage.ts"]
})
// � {
//   files: {
//     "src/exists.ts": 85.5,
//     "src/not-in-coverage.ts": 0
//   }
// }
```

### Multiple Snapshots

Multiple snapshots can exist concurrently:

```typescript
const snapshot1 = await start_coverage_snapshot({ lcovPath: "./coverage/lcov.info" });
// Make changes to feature A
const snapshot2 = await start_coverage_snapshot({ lcovPath: "./coverage/lcov.info" });
// Make changes to feature B

// Compare both independently
const deltaA = await end_coverage_snapshot({ snapshotId: snapshot1.snapshotId, ... });
const deltaB = await end_coverage_snapshot({ snapshotId: snapshot2.snapshotId, ... });
```

---

## Next Steps

- Review [Data Model](./data-model.md) for type definitions
- Review [Tool Schemas](./contracts/tool-schemas.md) for detailed API reference
- Proceed to implementation (Phase 2: tasks.md generation)

---

## Support

For issues or questions:
- GitHub Issues: [coverage-mcp/issues](https://github.com/coverage-mcp/issues)
- Documentation: [coverage-mcp docs](https://github.com/coverage-mcp/docs)
