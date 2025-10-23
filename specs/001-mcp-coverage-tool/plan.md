# Implementation Plan: MCP Coverage Analysis Tool

**Branch**: `001-mcp-coverage-tool` | **Date**: 2025-10-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mcp-coverage-tool/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

An MCP (Model Context Protocol) tool that enables AI agents to analyze LCOV code coverage files efficiently without consuming excessive tokens. The tool provides three core capabilities: retrieving overall project coverage, getting coverage for specific files, and tracking coverage changes through snapshots. Implementation uses Node.js with TypeScript and the Anthropic MCP SDK, with a function-based architecture separating MCP entry points from internal logic.

## Technical Context

**Language/Version**: Node.js with TypeScript (no interfaces, use types)
**Primary Dependencies**:
- @modelcontextprotocol/sdk (Anthropic MCP SDK)
- @friedemannsommer/lcov-
- Testing framework: Vitest

**Storage**: File system (temporary storage for snapshots)
**Testing**: 2-3 integration tests covering full flows, with in-process entry point testing and LCOV test helper for scenario building
**Target Platform**: Node.js runtime (cross-platform)
**Project Type**: Single library with MCP server interface
**Architecture**: Separate the entry-point folder with MCP server and the core logic where lcov is parsed and analyzed
**Performance Goals**:
- Parse LCOV files up to 50MB in under 5 seconds
- Return file-specific coverage using less than 300 tokens per file
- Snapshot operations complete in under 5 seconds for projects with up to 1000 files

**Constraints**:
- Function-based architecture only (no classes)
- Layered design separating MCP entry points from internal logic
- Token-efficient output format
- Support both summary-based and line-by-line LCOV formats
- Keep first version simple (no edge case handling)

**Scale/Scope**: Support projects with up to 1000 files and LCOV files up to 50MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Check (Before Phase 0)**:
- **Status**: No project constitution defined yet (constitution.md contains only template placeholders)
- **Applicable Principles**: Once constitution is established, verify testing approach, architecture patterns, and simplicity principles
- **Violations**: None detected - requirements align with standard Node.js/TypeScript best practices
- **Decision**: PROCEED with Phase 0 research

**Post-Design Check (After Phase 1)**:
- **Architecture Review**: ✓ Function-based design with clear separation of concerns (MCP layer / Core logic / Types)
- **Testing Strategy**: ✓ Integration tests with test helpers as specified in user requirements
- **Simplicity**: ✓ V1 design avoids edge cases, focuses on core functionality (line coverage only, no branches/functions)
- **Type System**: ✓ Uses `type` instead of `interface` throughout (per user requirements)
- **Dependencies**: ✓ Minimal dependencies (@modelcontextprotocol/sdk, @friedemannsommer/lcov-parser, Zod, Vitest)
- **Token Efficiency**: ✓ Response formats designed to minimize token usage (JSON structures, numeric values)

**Violations**: None detected

**Complexity Justification**: Not applicable - no violations requiring justification

**Decision**: PROCEED to Phase 2 (tasks.md generation via /speckit.tasks)

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
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
├── mcp/                    # MCP entry points - handles MCP protocol
│   ├── server.ts          # MCP server setup and tool registration
│   └── handlers.ts        # MCP command handlers (thin layer)
├── core/                   # Internal logic - pure business logic
│   ├── parser.ts          # LCOV file parsing logic
│   ├── coverage.ts        # Coverage calculation functions
│   └── snapshot.ts        # Snapshot storage and comparison
└── types/                  # TypeScript type definitions
    └── coverage.types.ts  # Coverage-related types

tests/
├── integration/            # 2-3 full flow tests
│   ├── overall-coverage.test.ts
│   ├── file-coverage.test.ts
│   └── snapshot-comparison.test.ts
└── helpers/               # Testing utilities
    └── lcov-builder.ts    # LCOV file builder for test scenarios

package.json               # Node.js project configuration
tsconfig.json             # TypeScript configuration
```

**Structure Decision**: Single project structure chosen because this is a standalone MCP tool without frontend/backend separation. The layered architecture separates MCP-specific concerns (src/mcp/) from pure business logic (src/core/), following the user requirement for clear separation between entry points and internal logic. Function-based design throughout eliminates the need for models/ directory (no classes).

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

