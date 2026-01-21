# Change: Add Multi-File Coverage Tool

## Why
Currently, users can only get coverage for the entire codebase or a single file at a time. When working with multiple files, users must make multiple individual calls. This is inefficient when you want to check coverage for a specific set of files (e.g., files changed in a PR).

## What Changes
- Add new `coverage_files_summary` MCP tool that accepts a list of file paths
- Returns coverage info per file in a single response
- Uses existing `FileCoverageInfo` type and patterns

## Impact
- Affected specs: coverage-tools (new capability)
- Affected code: `src/schemas/tool-schemas.ts`, `src/mcp/handlers.ts`, `src/mcp/server.ts`, `src/core/coverage/facade.ts`, `src/core/coverage/calculator.ts`
