# Implementation Plan: Coverage Diff Tracking

**Branch**: `002-coverage-diff-tracking` | **Date**: 2025-10-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-coverage-diff-tracking/spec.md`

## Summary

Enable AI agents to track their impact on test coverage by recording a baseline snapshot before making changes, then calculating the difference after running tests. The system stores LCOV coverage files in a local recording folder and compares line and branch coverage percentages to show improvements or regressions. Additionally, enhance all existing coverage tools to report both line and branch coverage percentages.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS)
**Primary Dependencies**: @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser, Node.js fs module
**Storage**: Local filesystem (recording folder for snapshots)
**Testing**: Vitest with integration tests following MCP client pattern
**Target Platform**: Node.js runtime (cross-platform)
**Project Type**: Single project (MCP server)
**Performance Goals**: Complete baseline recording and diff calculation in under 5 seconds for projects with <1000 files
**Constraints**: Must work with all standard LCOV formats (Jest, Istanbul, nyc, c8)
**Scale/Scope**: Handle LCOV files up to 10MB, support projects with up to 1000 source files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with core principles from [constitution.md](../../.specify/memory/constitution.md):

- [x] **Short, Focused Functions**: Design favors small, single-purpose functions (target <20 lines)
  - Snapshot storage: separate functions for copy, delete, read
  - Diff calculation: separate functions for parse, calculate, compare
  - Each function does one thing (copy file, parse LCOV, calculate percentage, etc.)

- [x] **Proven Dependencies**: All proposed dependencies are well-established and actively maintained
  - @friedemannsommer/lcov-parser: Already in use, proven for LCOV parsing
  - Node.js fs/promises: Standard library, stable API
  - No new external dependencies needed

- [x] **Simple Tests**: Test plan includes self-contained tests under 10 lines with helpers
  - Reuse existing createLcovFile and createMCPClient helpers
  - Each test: arrange (create LCOV), act (call tool), assert (verify result)
  - 8 focused tests covering key scenarios (not exhaustive edge cases)

- [x] **Core Domain Separation**: Architecture separates domain logic from entry points (CLI/API/MCP)
  - Core orchestration functions in src/core/coverage/ (e.g., getOverallCoverageSummary, getFileCoverageSummary)
  - Core logic in src/core/coverage/recorder.ts (snapshot management)
  - Core logic in src/core/coverage/diff-calculator.ts (diff computation)
  - MCP handlers in src/mcp/handlers.ts call exactly ONE core function each
  - MCP handlers do ONLY: input validation (Zod) → single core call → response formatting
  - MCP handlers do NOT orchestrate, perform file operations, or contain business logic
  - Domain code independent of MCP protocol

- [x] **Linting Compliance**: ESLint will be configured and all code will pass linting
  - Project already has ESLint configured
  - All new code will follow existing lint rules

**Complexity Justification**: No constitutional violations.

## Project Structure

### Documentation (this feature)

```
specs/002-coverage-diff-tracking/
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - straightforward feature)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (MCP tool schemas)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```
src/
├── core/
│   ├── coverage/
│   │   ├── calculator.ts          # Existing: coverage percentage calculation
│   │   ├── parser.ts              # Existing: LCOV parsing
│   │   ├── types.ts               # Existing + NEW: add CoverageDiffInfo type
│   │   ├── path-resolver.ts       # Existing: LCOV file path resolution
│   │   ├── recorder.ts            # NEW: snapshot management (copy, delete, read)
│   │   └── diff-calculator.ts     # NEW: diff computation logic
│   ├── errors.ts                  # Existing: error types
│   └── lcov_guide.md              # Existing: LCOV format reference
├── mcp/
│   ├── handlers.ts                # MODIFIED: add start_recording and get_diff_since_start handlers
│   └── server.ts                  # Existing: MCP server setup
├── schemas/
│   └── tool-schemas.ts            # MODIFIED: add schemas for new tools
└── index.ts                       # Existing: entry point

tests/
├── helpers/
│   ├── mcp-client.ts              # Existing: test client helper
│   └── lcov-builder.ts            # Existing: test data factory
├── diff-tracking.test.ts          # NEW: integration tests for recording and diff
└── enhanced-coverage.test.ts      # NEW: tests for branch coverage on existing tools

recording/                         # NEW: local folder for coverage snapshots
└── last-recording.lcov            # Created at runtime by start_recording
```

**Structure Decision**: Using existing single-project structure. New feature adds two new core modules (recorder.ts, diff-calculator.ts) and modifies existing MCP handlers. The recording folder will be created at project root for snapshot storage.

## Complexity Tracking

*No constitutional violations - table not needed.*

