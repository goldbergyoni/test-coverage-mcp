# Implementation Plan: MCP Coverage Analysis Tool

**Branch**: `001-mcp-coverage-tool` | **Date**: 2025-10-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mcp-coverage-tool/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an MCP (Model Context Protocol) tool that enables AI agents to efficiently analyze and track test coverage without consuming excessive tokens. The tool provides commands to get overall project coverage, file-specific coverage, and track coverage changes through recordings.

## Technical Context

**Language/Version**: TypeScript with Node.js (latest LTS)
**Primary Dependencies**: @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser
**Storage**: Temporary filesystem storage for coverage recordings
**Testing**: Vitest for integration tests
**Target Platform**: Cross-platform Node.js environment
**Project Type**: single - MCP server tool
**Performance Goals**: Parse 50MB LCOV files under 5 seconds, respond to commands within 200ms
**Constraints**: Minimize token consumption in responses (<300 tokens per file), support concurrent recordings
**Scale/Scope**: Support projects up to 1000 files in coverage reports

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with core principles from [constitution.md](../../.specify/memory/constitution.md):

- [x] **Short, Focused Functions**: Design favors small, single-purpose functions (target <20 lines)
- [x] **Proven Dependencies**: All proposed dependencies are well-established and actively maintained
  - @modelcontextprotocol/sdk: Official Anthropic SDK
  - @friedemannsommer/lcov-parser: 600k+ weekly downloads, actively maintained
- [x] **Simple Tests**: Test plan includes self-contained tests under 10 lines with helpers
  - Integration tests with LCOV file builder helpers
  - Tests approach in-process entry point with clear assertions
- [x] **Core Domain Separation**: Architecture separates domain logic from entry points (CLI/API/MCP)
  - MCP handlers are thin wrappers forwarding to core logic layer
  - Core logic in separate internal folder
- [x] **Linting Compliance**: ESLint will be configured and all code will pass linting

**Complexity Justification**: If any principle is violated, document in Complexity Tracking table below with rationale.

## Project Structure

### Documentation (this feature)

```
specs/001-mcp-coverage-tool/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── mcp/                    # MCP entry point layer (thin adapters)
│   ├── server.ts          # MCP server initialization
│   └── handlers.ts        # MCP tool command handlers
├── core/                  # Core business logic (domain layer)
│   ├── coverage/
│   │   ├── parser.ts      # LCOV file parsing logic
│   │   ├── calculator.ts # Coverage calculation functions
│   │   └── types.ts       # Domain types (CoverageInfo, etc.)
│   └── recording/
│       ├── manager.ts     # Recording lifecycle management
│       ├── storage.ts     # Recording persistence
  │       └── comparator.ts  # Coverage delta calculations
└── index.ts               # Main entry point

tests/
├── integration/
│   ├── coverage.test.ts   # Full coverage workflow tests
│   ├── recording.test.ts  # Recording lifecycle tests
│   └── helpers/
│       └── lcov-builder.ts # Test helper for building LCOV files
└── fixtures/
    └── sample-lcov/        # Sample LCOV files for testing
```

**Structure Decision**: Single project structure with clear separation between MCP entry points and core domain logic. The MCP handlers in `src/mcp/` act as thin adapters that forward to the core logic in `src/core/`, ensuring testability without invoking the MCP protocol.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

