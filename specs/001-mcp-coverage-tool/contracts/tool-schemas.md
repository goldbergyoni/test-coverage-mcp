# MCP Tool Schemas

**Feature**: MCP Coverage Analysis Tool
**Date**: 2025-10-21
**Phase**: Phase 1 - Contracts

## Overview

This document defines the MCP tool contracts for the coverage analysis tool. Each tool includes its name, description, input schema, and expected output format following MCP protocol standards.

---

## Tool 1: get_overall_coverage

### Description
Analyzes an LCOV coverage file and returns the overall line coverage percentage for the entire project. Use this before making code changes to establish a baseline. Returns a single percentage value representing total project coverage.

### Input Schema (Zod)
```typescript
{
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file. Can be absolute or relative. Example: "./coverage/lcov.info"'
  )
}
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lcovPath | string | Yes | Path to the LCOV coverage file (absolute or relative) |

### Output Format

**Success Response**:
```json
{
  "overall": 85.4
}
```

**Error Response**:
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Error: LCOV file not found at path ./coverage/lcov.info"
  }]
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| overall | number | Overall coverage percentage (0-100, one decimal place) |

### Error Scenarios

1. **File Not Found**: LCOV file doesn't exist at specified path
2. **Parse Error**: LCOV file is malformed or cannot be parsed
3. **Permission Error**: No read access to LCOV file

---

## Tool 2: get_file_coverage

### Description
Returns line coverage percentage for specific files only. Use this after modifying files to check coverage impact on just those files. More efficient than parsing the entire report when you only care about specific files. Returns coverage percentage for each requested file.

### Input Schema (Zod)
```typescript
{
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file'
  ),
  filePaths: z.array(z.string()).describe(
    'Array of file paths to analyze. Paths should match those in the LCOV file (relative or absolute). Example: ["src/parser.ts", "src/coverage.ts"]'
  )
}
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lcovPath | string | Yes | Path to the LCOV coverage file |
| filePaths | string[] | Yes | Array of file paths to get coverage for |

### Output Format

**Success Response**:
```json
{
  "files": {
    "src/parser.ts": 92.3,
    "src/coverage.ts": 78.1,
    "src/new-file.ts": 0
  }
}
```

**Error Response**:
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Error: LCOV file not found"
  }]
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| files | Record<string, number> | Map of file paths to coverage percentages |

### Behavior Notes

- Files not found in LCOV report return 0% coverage (not an error)
- Paths are normalized for matching (absolute vs relative)
- Empty array for filePaths returns empty object

### Error Scenarios

1. **File Not Found**: LCOV file doesn't exist
2. **Parse Error**: LCOV file is malformed
3. **Invalid Input**: filePaths is not an array

---

## Tool 3: start_coverage_snapshot

### Description
Creates a snapshot of current coverage state for later comparison. Use this before making code changes to track coverage impact. The snapshot is stored temporarily and can be compared later using end_coverage_snapshot. Returns a snapshot ID that must be saved for the comparison step.

### Input Schema (Zod)
```typescript
{
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file to snapshot'
  )
}
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lcovPath | string | Yes | Path to the LCOV file to snapshot |

### Output Format

**Success Response**:
```json
{
  "snapshotId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1729533600000
}
```

**Error Response**:
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Error: Cannot create snapshot - LCOV file not found"
  }]
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| snapshotId | string | Unique UUID v4 identifier for this snapshot |
| timestamp | number | Unix timestamp (milliseconds) when snapshot was created |

### Behavior Notes

- Snapshot is stored in system temp directory
- Multiple snapshots can exist concurrently (unique IDs)
- Snapshots persist until system cleanup (temp dir cleared)
- No automatic expiration in v1

### Error Scenarios

1. **File Not Found**: LCOV file doesn't exist
2. **Parse Error**: LCOV file is malformed
3. **Storage Error**: Cannot write to temp directory

---

## Tool 4: end_coverage_snapshot

### Description
Compares current coverage against a previously created snapshot and returns the difference. Shows overall coverage change and per-file changes (increases/decreases). Use this after making code changes to see coverage impact. Identifies new files added and files removed since the snapshot.

### Input Schema (Zod)
```typescript
{
  snapshotId: z.string().describe(
    'The snapshot ID returned from start_coverage_snapshot'
  ),
  lcovPath: z.string().describe(
    'Path to the current LCOV coverage file to compare against the snapshot'
  )
}
```

### Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| snapshotId | string | Yes | UUID from start_coverage_snapshot |
| lcovPath | string | Yes | Path to current LCOV file |

### Output Format

**Success Response**:
```json
{
  "overallChange": 3.2,
  "fileChanges": {
    "src/parser.ts": 5.1,
    "src/coverage.ts": -2.3,
    "src/snapshot.ts": 0
  },
  "newFiles": [
    "src/new-feature.ts"
  ],
  "removedFiles": [
    "src/deprecated.ts"
  ]
}
```

**Error Response**:
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Error: Snapshot not found with ID 550e8400-e29b-41d4-a716-446655440000"
  }]
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| overallChange | number | Change in overall coverage (-100 to 100) |
| fileChanges | Record<string, number> | Map of file paths to coverage change amounts |
| newFiles | string[] | Files present in current but not in snapshot |
| removedFiles | string[] | Files present in snapshot but not in current |

### Behavior Notes

- Positive change = coverage improved
- Negative change = coverage decreased
- Zero change = no coverage impact
- fileChanges includes all files that existed in either snapshot or current
- Files in both snapshots but unchanged (0) are still included

### Error Scenarios

1. **Snapshot Not Found**: Invalid or expired snapshot ID
2. **File Not Found**: Current LCOV file doesn't exist
3. **Parse Error**: Current LCOV file is malformed

---

## Common Error Codes

All tools return errors in this format:

```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "Error: <error message>"
  }]
}
```

### Error Messages

| Category | Message Format | Example |
|----------|----------------|---------|
| File Not Found | `LCOV file not found at path <path>` | `LCOV file not found at path ./coverage/lcov.info` |
| Parse Error | `Failed to parse LCOV file: <reason>` | `Failed to parse LCOV file: invalid format` |
| Snapshot Not Found | `Snapshot not found with ID <id>` | `Snapshot not found with ID 550e8400...` |
| Permission Error | `Cannot read LCOV file: <reason>` | `Cannot read LCOV file: permission denied` |
| Storage Error | `Cannot create snapshot: <reason>` | `Cannot create snapshot: temp dir not writable` |

---

## Usage Workflow Examples

### Workflow 1: Check Current Coverage

```
1. AI Agent í get_overall_coverage({ lcovPath: "./coverage/lcov.info" })
2. Response ê { overall: 82.5 }
3. AI Agent understands baseline coverage
```

### Workflow 2: Check Specific Files After Changes

```
1. AI Agent modifies src/parser.ts and src/coverage.ts
2. AI Agent í get_file_coverage({
     lcovPath: "./coverage/lcov.info",
     filePaths: ["src/parser.ts", "src/coverage.ts"]
   })
3. Response ê { files: { "src/parser.ts": 90, "src/coverage.ts": 75 } }
4. AI Agent knows coverage for changed files
```

### Workflow 3: Track Coverage Impact

```
1. AI Agent í start_coverage_snapshot({ lcovPath: "./coverage/lcov.info" })
2. Response ê { snapshotId: "550e8400...", timestamp: 1729533600000 }
3. AI Agent makes code changes and reruns tests
4. AI Agent í end_coverage_snapshot({
     snapshotId: "550e8400...",
     lcovPath: "./coverage/lcov.info"
   })
5. Response ê {
     overallChange: 3.2,
     fileChanges: { "src/new.ts": 100, "src/old.ts": -5.1 },
     newFiles: ["src/new.ts"],
     removedFiles: []
   }
6. AI Agent knows coverage improved by 3.2% overall
```

---

## Tool Naming Conventions

All tool names follow these conventions:
- **Format**: snake_case
- **Pattern**: `<verb>_<noun>_<noun>`
- **Examples**:
  - `get_overall_coverage`
  - `get_file_coverage`
  - `start_coverage_snapshot`
  - `end_coverage_snapshot`

---

## Token Efficiency Guidelines

Responses are designed to minimize token usage:
1. Return numbers, not formatted strings ("85.4" not "Coverage is 85.4%")
2. Use concise key names ("overall" not "overallCoveragePercentage")
3. Omit unnecessary fields
4. Structure data for easy parsing
5. Keep under 300 tokens per file in responses

---

## Next Steps

After contracts definition:
1. Create quickstart.md with usage examples and installation instructions
2. Implement Zod schemas in TypeScript (mcp-tools.ts)
3. Update agent context with new technology choices
4. Proceed to Phase 2 (tasks.md generation)
