# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Project Overview

MCP server providing token-efficient LCOV-based test coverage data for AI coding agents. Exposes 5 tools: `coverage_summary`, `coverage_file_summary`, `coverage_files_summary`, `start_recording`, `get_diff_since_start`.

## Commands

```bash
npm run build          # Compile TypeScript to dist/
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
npm run lint           # Run ESLint
npm run inspect        # Launch MCP inspector for debugging

# Run a single test file
npx vitest tests/summary.test.ts

# Run a single test by name
npx vitest -t "when all lines are covered"
```

## Architecture

### Two-Layer Design

**Entry Point Layer (`src/mcp/`)** - Thin adapters that:
1. Validate input via Zod schemas
2. Delegate to exactly ONE core function
3. Format response for MCP protocol

Entry points MUST NOT orchestrate multiple core functions, perform file operations, or contain business logic.

**Core Layer (`src/core/`)** - All business logic lives here:
- `facade.ts` - Orchestration functions (the single functions entry points call)
- `parser.ts` - LCOV file parsing using `@friedemannsommer/lcov-parser`
- `calculator.ts` - Coverage percentage calculations
- `recorder.ts` - Baseline storage in `./recording/`
- `diff-calculator.ts` - Compare current vs baseline coverage

### Key Files

- `src/mcp/server.ts` - MCP server setup, tool registration with inline JSON schemas
- `src/mcp/handlers.ts` - Request handlers that call facade functions
- `src/schemas/tool-schemas.ts` - Zod schemas and tool configurations

## Testing

**Integration tests only** - No unit tests. Tests call the MCP server as a real client would.

**Test helpers:**
- `tests/helpers/mcp-client.ts` - Creates in-memory MCP client, provides `callTool()` and `callToolExpectingError()`
- `tests/helpers/lcov-builder.ts` - Factory for generating LCOV test data with auto-cleanup

**Test naming:** Use "when-then" pattern: `when [scenario], then [expectation]`

**Pattern:** Flat AAA (Arrange-Act-Assert), no loops or conditionals, tests under 10 lines.

## Code Style

- TypeScript: Use `type`, NOT `interface`
- Baselines stored in `./recording/baseline-recording.lcov`
- Default LCOV path: `./coverage/lcov.info`

## Error Codes

Custom `CoverageError` class in `src/core/errors.ts` with codes:
- `LCOV_FILE_NOT_FOUND` - LCOV file path doesn't exist
- `LCOV_PARSE_ERROR` - Failed to parse LCOV content
- `FILE_NOT_IN_COVERAGE` - Requested file not found in LCOV data
- `NO_RECORDING_FOUND` - `get_diff_since_start` called without `start_recording`
- `PATH_RESOLUTION_ERROR` - Path resolution failed

## References

- [LCOV Format Guide](src/core/lcov_guide.md) - LCOV file format details
