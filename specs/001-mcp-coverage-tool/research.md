# Research: MCP Coverage Analysis Tool

**Branch**: `001-mcp-coverage-tool` | **Date**: 2025-10-21 | **Phase**: 0 (Research)

## Overview

This research document covers best practices for implementing an MCP (Model Context Protocol) server using the @modelcontextprotocol/sdk package from Anthropic, with specific focus on building a coverage analysis tool that parses LCOV files.

## 1. MCP Server Setup and Initialization

### Core Pattern

The MCP TypeScript SDK provides a class-based server initialization:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'coverage-analyzer',
  version: '1.0.0'
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### Transport Options

**STDIO Transport (Recommended for CLI Tools)**
- Best for: Command-line tools and local integrations
- Characteristics: Simple, local transport where client launches server as subprocess
- Communication: Over stdin/stdout with low overhead
- Eliminates network stack overhead, providing microsecond-level response times
- Use case: Local CLI tools that will be invoked by desktop AI assistants

**Streamable HTTP Transport (For Remote Access)**
- Best for: Web/remote access, cloud deployments, browser integrations
- Replaces the deprecated SSE transport
- Use case: Cloud-based services and remote integrations

**Recommendation**: Use STDIO transport for this coverage tool since it's a local analysis tool.

## 2. Tool Registration and Command Handling

### Modern API: Use `registerTool()` (Recommended)

The `register*` methods are the recommended approach for new code. The older `server.tool()` method remains for backwards compatibility.

```typescript
import { z } from 'zod';

server.registerTool(
  'get_overall_coverage',
  {
    title: 'Get Overall Coverage',
    description: 'Analyzes an LCOV file and returns overall line coverage percentage for the entire project',
    inputSchema: {
      lcovPath: z.string().describe('Absolute or relative path to the LCOV coverage file')
    }
  },
  async ({ lcovPath }) => {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ coveragePercent: 85.4 })
      }]
    };
  }
);
```

### Zod Schema Validation

The TypeScript SDK uses Zod for schema definition, providing both runtime validation and compile-time type safety:

```typescript
// Define reusable schema
const FilePathsSchema = z.object({
  lcovPath: z.string().describe('Path to the LCOV coverage file'),
  filePaths: z.array(z.string()).describe('Array of file paths to get coverage for')
});

// Type inference
type FilePathsInput = z.infer<typeof FilePathsSchema>;

// Use in tool registration
server.registerTool(
  'get_file_coverage',
  {
    title: 'Get Coverage for Specific Files',
    description: 'Returns line coverage percentage for specified files only',
    inputSchema: FilePathsSchema.shape
  },
  async (args: FilePathsInput) => {
    // Handler implementation
  }
);
```

**Key Points**:
- Validation happens automatically before handler runs
- Invalid parameters trigger structured error without executing handler
- Zod provides end-to-end type safety with TypeScript

## 3. Error Handling and Response Formats

### Structured Error Response

MCP servers return errors using the `isError` flag in `CallToolResult`:

```typescript
server.registerTool(
  'tool_name',
  { /* config */ },
  async (args) => {
    try {
      const result = await processData(args);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);
```

### McpError Class

For protocol-level errors:

```typescript
import { McpError } from '@modelcontextprotocol/sdk';

throw new McpError(
  -32602,  // Invalid params error code
  'LCOV file not found',
  { path: lcovPath }
);
```

### Error Handling Best Practices

1. **Wrap all handlers with try-catch**: Prevent uncaught exceptions from crashing the server
2. **Sanitize error messages**: Don't leak system information to AI clients
3. **Log to stderr**: All debugging output must go to stderr, not stdout (stdout is reserved for JSON-RPC)
4. **Include isError flag**: Helps AI assistants understand when to retry
5. **Provide context**: Include helpful error details in the response

```typescript
// Logging pattern
console.error('[Coverage Tool] Parsing LCOV file:', lcovPath); // Goes to stderr
```

## 4. Response Format Structure

### Standard Response Format

```typescript
type ToolResponse = {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  structuredContent?: unknown;
};
```

### Token-Efficient Response Guidelines

**Key Principles**:
- Return concise, structured data - not verbose explanations
- Use JSON for structured data (easier for LLMs to parse)
- Include only relevant properties, not every possible field
- For coverage data: return percentages as numbers, not formatted strings
- Avoid redundant information

**Good Example (Token-Efficient)**:
```typescript
{
  content: [{
    type: 'text',
    text: JSON.stringify({
      overall: 85.4,
      files: {
        'src/parser.ts': 92.3,
        'src/snapshot.ts': 78.1
      }
    })
  }]
}
```

**Bad Example (Token-Wasteful)**:
```typescript
{
  content: [{
    type: 'text',
    text: 'The overall coverage is 85.4%. For src/parser.ts, the coverage is 92.3%. For src/snapshot.ts, the coverage is 78.1%.'
  }]
}
```

### Response Best Practices

1. Use JSON snippets, bullet lists, or key-value formats
2. Don't inject every object property - only relevant ones
3. Return numeric values as numbers, not strings
4. For large datasets, consider pagination or filtering
5. Keep responses under 300 tokens per file when possible

## 5. Tool Descriptions for LLMs

### Naming Conventions

**Use snake_case for tool names**:
- GPT-4o tokenization understands this best
- Over 90% of MCP tools use snake_case
- Format: 1-64 characters, case-sensitive
- Allowed: alphanumeric, underscores (_), dashes (-), dots (.)
- Avoid: spaces, parentheses, brackets

**Examples**:
```typescript
'get_overall_coverage'      // Good
'get_file_coverage'         // Good
'start_coverage_snapshot'   // Good
'getCoverage'               // Acceptable but less common
'get-coverage'              // Acceptable
'get coverage'              // Bad - contains space
'getCoverage()'             // Bad - contains parentheses
```

### Description Best Practices

**Structure**:
1. Start with what the tool does (action verb)
2. Explain the specific purpose
3. Indicate when to use it
4. Describe what it returns

**Example**:
```typescript
server.registerTool(
  'get_overall_coverage',
  {
    title: 'Get Overall Coverage',
    description: 'Analyzes an LCOV coverage file and returns the overall line coverage percentage for the entire project. Use this before making code changes to establish a baseline. Returns a single percentage value representing total project coverage.',
    inputSchema: {
      lcovPath: z.string().describe('Absolute or relative path to the LCOV coverage file (e.g., "./coverage/lcov.info")')
    }
  },
  handler
);
```

### Parameter Documentation

All parameters must:
- Offer a clear description
- Be explicitly marked as "optional" or "required" (via Zod)
- Include default values in description if optional
- Provide examples when helpful

```typescript
{
  lcovPath: z.string().describe(
    'Path to the LCOV coverage file. Can be absolute or relative to the current working directory. Example: "./coverage/lcov.info"'
  ),
  filePaths: z.array(z.string()).optional().describe(
    'Optional array of specific file paths to analyze. If not provided, analyzes all files. Paths should match those in the LCOV file.'
  )
}
```

## 6. TypeScript Patterns

### Types vs Interfaces (For Function-Based Code)

**Recommendation**: Use `type` by default for function-based architectures.

**Rationale**:
- More versatile: supports unions, mapped types, conditional types
- Better for function types: more concise syntax
- Interfaces can't express unions or conditional types
- Types work better with function composition patterns

**Example**:
```typescript
// Use type for function signatures
type CoverageParser = (lcovPath: string) => Promise<CoverageData>;

// Use type for data structures
type CoverageData = {
  overall: number;
  files: Record<string, FileCoverage>;
};

type FileCoverage = {
  path: string;
  lines: number;
  covered: number;
  percent: number;
};

// Use type for unions
type CoverageResult = SuccessResult | ErrorResult;
```

### Function-Based Architecture Pattern

```typescript
// parser.ts - Pure functions for parsing
export const parseLcov = async (filePath: string): Promise<LcovSection[]> => {
  const content = await fs.readFile(filePath, 'utf-8');
  return lcovParser({ from: content });
};

export const calculateOverallCoverage = (sections: LcovSection[]): number => {
  // Calculation logic
  return percentage;
};

// handlers.ts - MCP handler functions (thin layer)
export const getOverallCoverageHandler = async ({ lcovPath }: { lcovPath: string }) => {
  const sections = await parseLcov(lcovPath);
  const coverage = calculateOverallCoverage(sections);
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ overall: coverage })
    }]
  };
};

// server.ts - Server setup
const registerTools = (server: McpServer) => {
  server.registerTool(
    'get_overall_coverage',
    config,
    getOverallCoverageHandler
  );
};
```

### Separation of Concerns

**Layer 1: MCP Entry Points** (`src/mcp/`)
- Server setup and configuration
- Tool registration
- Request/response transformation
- Error boundary for protocol compliance

**Layer 2: Core Business Logic** (`src/core/`)
- LCOV parsing
- Coverage calculations
- Snapshot storage/comparison
- Pure functions, no MCP dependencies

**Layer 3: Type Definitions** (`src/types/`)
- Shared types across layers
- Use `type` instead of `interface`

## 7. LCOV Parsing Library

### Recommended Package: @friedemannsommer/lcov-parser

**Why**:
- Written in TypeScript (native type support)
- Actively maintained (latest update 2 months ago)
- Supports both sync and async parsing
- Can handle streams, strings, and buffers
- Latest version: 5.0.1

**Installation**:
```bash
npm install --save-dev --save-exact @friedemannsommer/lcov-parser
```

**Usage Examples**:

```typescript
// Async parsing with file stream (recommended for large files)
import lcovParser from '@friedemannsommer/lcov-parser';
import { createReadStream } from 'node:fs';

const lcovFile = createReadStream(lcovPath);
const sections = await lcovParser({ from: lcovFile });

// Sync parsing with string (good for small files)
import lcovParser from '@friedemannsommer/lcov-parser/sync';

const sections = lcovParser({ from: lcovContent });
```

**Data Structure**:
```typescript
type LcovSection = {
  title: string;           // File path
  lines: {
    found: number;        // Total lines
    hit: number;          // Covered lines
    details: Array<{
      line: number;
      hit: number;        // 0 = not covered, >0 = covered
    }>;
  };
  functions: { /* ... */ };
  branches: { /* ... */ };
};
```

### Handling Path Matching

**Common Issue**: LCOV files may contain absolute or relative paths, and these must match user-provided paths.

**Solution Approach**:
1. Normalize all paths using `path.resolve()` for comparison
2. Support both absolute and relative paths in input
3. Match based on normalized absolute paths
4. Handle cases where LCOV contains different path formats

```typescript
import path from 'node:path';

const normalizePath = (filePath: string): string => {
  return path.resolve(filePath);
};

const findFileInSections = (sections: LcovSection[], targetPath: string): LcovSection | undefined => {
  const normalizedTarget = normalizePath(targetPath);
  return sections.find(section => {
    const normalizedSection = normalizePath(section.title);
    return normalizedSection === normalizedTarget;
  });
};
```

## 8. Testing Approaches

### In-Process Testing with InMemoryTransport (Recommended)

The in-memory testing pattern eliminates subprocess issues and provides fast, deterministic tests.

**Pattern**:
```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Coverage MCP Server', () => {
  let client: Client;
  let serverTransport: InMemoryTransport;
  let clientTransport: InMemoryTransport;

  beforeAll(async () => {
    // Create linked transport pair
    const [client_t, server_t] = InMemoryTransport.createLinkedPair();
    clientTransport = client_t;
    serverTransport = server_t;

    // Initialize server
    const server = new McpServer({ name: 'test-server', version: '1.0.0' });
    registerTools(server);
    await server.connect(serverTransport);

    // Initialize client
    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await serverTransport.close();
  });

  it('should return overall coverage', async () => {
    const result = await client.callTool('get_overall_coverage', {
      lcovPath: './test/fixtures/sample.lcov'
    });

    expect(result.isError).toBe(false);
    const data = JSON.parse(result.content[0].text);
    expect(data.overall).toBeGreaterThan(0);
  });
});
```

### Testing Framework: Vitest vs Jest

**Recommendation**: Use Vitest

**Why**:
- Faster than Jest
- Native ESM support
- Better TypeScript integration
- Compatible with Vite tooling
- Promise-based testing (natural for async MCP operations)

### Test Structure

**2-3 Integration Tests Covering Full Flows**:
1. `overall-coverage.test.ts` - Tests get_overall_coverage tool
2. `file-coverage.test.ts` - Tests get_file_coverage tool
3. `snapshot-comparison.test.ts` - Tests snapshot workflow (start + end)

**Test Helpers**:
- LCOV builder/fixture generator for creating test scenarios
- Utility functions for creating mock coverage data

```typescript
// helpers/lcov-builder.ts
export const createLcovContent = (files: Array<{ path: string; lines: number; covered: number }>): string => {
  return files.map(file => `
TN:
SF:${file.path}
LF:${file.lines}
LH:${file.covered}
end_of_record
  `.trim()).join('\n');
};
```

### Testing Best Practices

1. **Test at the MCP protocol level**: Use InMemoryTransport, not direct function calls
2. **Use fixtures**: Create sample LCOV files for different scenarios
3. **Test error cases**: Invalid paths, malformed LCOV, missing files
4. **Keep tests fast**: In-memory testing should complete in milliseconds
5. **Focus on integration**: 2-3 full-flow tests > many unit tests

## 9. Snapshot Storage Implementation

### Temporary Directory Pattern

```typescript
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

type Snapshot = {
  id: string;
  timestamp: number;
  coverageData: CoverageData;
};

const SNAPSHOT_DIR_PREFIX = 'coverage-snapshot-';

export const createSnapshot = async (coverageData: CoverageData): Promise<string> => {
  const snapshotId = randomUUID();
  const tempDir = await mkdtemp(join(tmpdir(), SNAPSHOT_DIR_PREFIX));
  const snapshotPath = join(tempDir, `${snapshotId}.json`);

  const snapshot: Snapshot = {
    id: snapshotId,
    timestamp: Date.now(),
    coverageData
  };

  await writeFile(snapshotPath, JSON.stringify(snapshot));
  return snapshotId;
};

export const loadSnapshot = async (snapshotId: string): Promise<Snapshot> => {
  // Implementation to find and load snapshot
};
```

### Best Practices for Snapshots

1. **Use crypto.randomUUID()**: For unique snapshot identifiers
2. **Use os.tmpdir() + fs.mkdtemp()**: For platform-independent temp directories
3. **Store as JSON**: Simple, parseable format
4. **Include metadata**: Timestamp, snapshot ID, source LCOV path
5. **Cleanup strategy**: Consider implementing auto-cleanup for old snapshots
6. **Path structure**: `${tmpdir()}/coverage-snapshot-XXXXXX/${uuid}.json`

## 10. Architecture Summary

### Project Structure (Recommended)

```
src/
├── mcp/
│   ├── server.ts          # Server initialization and transport setup
│   └── handlers.ts        # Tool handlers (thin MCP layer)
├── core/
│   ├── parser.ts          # LCOV parsing logic
│   ├── coverage.ts        # Coverage calculation functions
│   └── snapshot.ts        # Snapshot storage and comparison
└── types/
    └── coverage.types.ts  # Type definitions

tests/
├── integration/
│   ├── overall-coverage.test.ts
│   ├── file-coverage.test.ts
│   └── snapshot-comparison.test.ts
├── fixtures/
│   └── sample.lcov        # Test LCOV files
└── helpers/
    └── lcov-builder.ts    # Test utilities
```

### Key Design Decisions

1. **Transport**: STDIO (local CLI tool use case)
2. **Tool Registration**: Use `registerTool()` API
3. **Schema Validation**: Zod for type-safe parameter validation
4. **TypeScript Style**: Use `type` over `interface`
5. **Architecture**: Function-based, layered (MCP / Core / Types)
6. **LCOV Parser**: @friedemannsommer/lcov-parser
7. **Testing**: Vitest with InMemoryTransport
8. **Response Format**: Concise JSON for token efficiency
9. **Snapshot Storage**: Temp directory with UUIDs
10. **Error Handling**: Structured errors with isError flag

### Implementation Flow

1. **Phase 1**: Setup server with STDIO transport
2. **Phase 2**: Implement LCOV parsing and overall coverage calculation
3. **Phase 3**: Add file-specific coverage filtering
4. **Phase 4**: Implement snapshot storage and comparison
5. **Phase 5**: Add comprehensive error handling
6. **Phase 6**: Write integration tests with InMemoryTransport

## 11. Example Tool Definitions

### Tool 1: Get Overall Coverage

```typescript
server.registerTool(
  'get_overall_coverage',
  {
    title: 'Get Overall Project Coverage',
    description: 'Analyzes an LCOV coverage file and returns the overall line coverage percentage for the entire project. Use this before making code changes to establish a baseline. Returns a percentage value (0-100) representing total project coverage.',
    inputSchema: {
      lcovPath: z.string().describe('Path to the LCOV coverage file. Can be absolute or relative. Example: "./coverage/lcov.info"')
    }
  },
  async ({ lcovPath }) => {
    try {
      const sections = await parseLcov(lcovPath);
      const coverage = calculateOverallCoverage(sections);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ overall: coverage })
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error parsing LCOV file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);
```

### Tool 2: Get File Coverage

```typescript
server.registerTool(
  'get_file_coverage',
  {
    title: 'Get Coverage for Specific Files',
    description: 'Returns line coverage percentage for specific files only. Use this after modifying files to check coverage impact on just those files. More efficient than parsing the entire report. Returns coverage percentage for each requested file.',
    inputSchema: {
      lcovPath: z.string().describe('Path to the LCOV coverage file'),
      filePaths: z.array(z.string()).describe('Array of file paths to analyze. Paths should match those in the LCOV file (relative or absolute)')
    }
  },
  async ({ lcovPath, filePaths }) => {
    try {
      const sections = await parseLcov(lcovPath);
      const fileCoverage = getFileCoverage(sections, filePaths);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ files: fileCoverage })
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error getting file coverage: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);
```

### Tool 3: Start Coverage Snapshot

```typescript
server.registerTool(
  'start_coverage_snapshot',
  {
    title: 'Start Coverage Snapshot',
    description: 'Creates a snapshot of current coverage state for later comparison. Use this before making code changes to track coverage impact. Returns a snapshot ID that can be used with end_coverage_snapshot.',
    inputSchema: {
      lcovPath: z.string().describe('Path to the LCOV coverage file to snapshot')
    }
  },
  async ({ lcovPath }) => {
    try {
      const sections = await parseLcov(lcovPath);
      const coverageData = parseCoverageData(sections);
      const snapshotId = await createSnapshot(coverageData);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ snapshotId, timestamp: Date.now() })
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error creating snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);
```

### Tool 4: End Coverage Snapshot

```typescript
server.registerTool(
  'end_coverage_snapshot',
  {
    title: 'End Coverage Snapshot and Compare',
    description: 'Compares current coverage against a previously created snapshot and returns the difference. Shows overall coverage change and per-file changes (increases/decreases). Use this after making code changes to see coverage impact.',
    inputSchema: {
      snapshotId: z.string().describe('The snapshot ID returned from start_coverage_snapshot'),
      lcovPath: z.string().describe('Path to the current LCOV coverage file to compare against snapshot')
    }
  },
  async ({ snapshotId, lcovPath }) => {
    try {
      const snapshot = await loadSnapshot(snapshotId);
      const sections = await parseLcov(lcovPath);
      const currentCoverage = parseCoverageData(sections);
      const delta = compareCoverage(snapshot.coverageData, currentCoverage);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            overallChange: delta.overallChange,
            fileChanges: delta.fileChanges,
            newFiles: delta.newFiles,
            removedFiles: delta.removedFiles
          })
        }]
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Error comparing snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }
);
```

## 12. References

### Official Documentation
- MCP Specification: https://modelcontextprotocol.io/
- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- Claude MCP Docs: https://docs.claude.com/en/docs/mcp
- Anthropic MCP Announcement: https://www.anthropic.com/news/model-context-protocol

### Package Documentation
- @modelcontextprotocol/sdk: https://www.npmjs.com/package/@modelcontextprotocol/sdk
- @friedemannsommer/lcov-parser: https://www.npmjs.com/package/@friedemannsommer/lcov-parser
- Zod: https://zod.dev/

### Community Resources
- Awesome MCP Servers: https://github.com/punkpeye/awesome-mcp-servers
- MCP Server Examples: https://github.com/modelcontextprotocol/servers
- GitHub's MCP Server: https://github.com/github/github-mcp-server

### Guides and Tutorials
- How to Build MCP Servers: https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28
- MCP Error Handling: https://mcpcat.io/guides/error-handling-custom-mcp-servers/
- Unit Testing MCP Servers: https://mcpcat.io/guides/writing-unit-tests-mcp-servers/
- MCP Best Practices: https://steipete.me/posts/2025/mcp-best-practices

## 13. Next Steps

After completing this research, proceed to Phase 1:
1. Create data-model.md defining all types and data structures
2. Create contracts/ directory with tool contracts
3. Create quickstart.md with usage examples
4. Review Phase 1 outputs before proceeding to Phase 2 (tasks.md generation)
