# coverage-mcp-v2 Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-21

## Active Technologies
- Node.js with TypeScript (no interfaces, use types) (001-mcp-coverage-tool)
- TypeScript with Node.js (latest LTS) + @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser (001-mcp-coverage-tool)
- Temporary filesystem storage for coverage recordings (001-mcp-coverage-tool)
- TypeScript with Node.js (latest LTS) + @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser, Node.js fs module (002-coverage-diff-tracking)
- Local filesystem (recording folder for snapshots) (002-coverage-diff-tracking)

## Project Structure
```
src/
tests/
```

## Commands
npm test && npm run lint

## Code Style
Node.js with TypeScript (no interfaces, use types): Follow standard conventions

## Recent Changes
- 002-coverage-diff-tracking: Added TypeScript with Node.js (latest LTS) + @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser, Node.js fs module
- 001-mcp-coverage-tool: Added TypeScript with Node.js (latest LTS) + @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser
- 001-mcp-coverage-tool: Added Node.js with TypeScript (no interfaces, use types)

<!-- MANUAL ADDITIONS START -->
## References
- [LCOV Format Guide](src/core/lcov_guide.md) - Detailed explanation of LCOV file format shortcuts
<!-- MANUAL ADDITIONS END -->
