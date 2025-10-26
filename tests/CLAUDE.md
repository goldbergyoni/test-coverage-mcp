# Testing Guidelines

## Running Tests
```bash
npm run test
```

## Test Type
Integration tests only - we test the MCP server as a real MCP client would use it.

## Core Principles
- **No unit tests** - All tests are integration tests calling the MCP server
- **Minimal mocking** - Tests act as real MCP clients
- **In-memory transport** - Test and code under test run in the same process (no separate process spawning)
- **Self-documenting** - Tests should be under 10 lines and immediately clear
- **Data factories** - Use helpers to craft test data, avoiding pre-baked files
- **Flat structure** - No loops, no if-statements, just arrange-act-assert

## Test Structure
Every test follows the AAA pattern:
1. **Arrange** - Craft test data using factories
2. **Act** - Call MCP server
3. **Assert** - Verify results using Vitest's built-in expect

## Test Naming Convention
All tests MUST follow the **"when-then"** pattern:
- Format: `when [scenario], then [expectation]`
- Example: `when all lines are covered, then returns 100%`
- Example: `when file does not exist, then throws error`

This pattern makes tests self-documenting and clearly states both the condition and expected outcome.

## Example Test
```typescript
import { describe, it, expect } from 'vitest';
import { createMCPClient } from './helpers/mcp-client';
import { createLcovFile } from './helpers/lcov-builder';

describe('coverage_summary tool', () => {
  it('when 3 of 4 lines are covered, then returns 75%', async () => {
    // Arrange
    const lcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 2 },
      { path: 'src/utils.ts', lines: 2, coveredLines: [1] }
    ]);
    const client = await createMCPClient();

    // Act
    const result = await client.callTool('coverage_summary', { lcovPath });

    // Assert
    expect(result.linesCoveragePercentage).toBe(75);
  });
});
```

## Data Factory Pattern
The lcov-factory should handle all the complexity:
- File creation
- LCOV format generation
- Cleanup after test

Test parameters should tell the story - just specify what matters (file paths, line counts).
