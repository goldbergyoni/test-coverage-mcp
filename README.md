# Test Coverage MCP

[![npm version](https://badge.fury.io/js/test-coverage-mcp.svg)](https://www.npmjs.com/package/test-coverage-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Make AI coding agents coverage-aware without wasting tokens**

A Model Context Protocol (MCP) server that gives AI coding agents instant, token-efficient access to test coverage data from LCOV files.

## The Problem

When AI coding agents work on your code without proper coverage tooling, they face three critical issues:

1. **Coverage Blindness** - They can't see if their changes improved or regressed test coverage
2. **Token Waste** - They burn thousands of tokens trying to parse massive LCOV files (some exceed 50MB)
3. **Unreliable Scripts** - They improvise custom parsing scripts that often fail or produce incorrect results

## The Solution

This MCP server solves all three problems by providing:

- **Coverage Awareness** - Agents can check coverage anytime with a simple tool call
- **Token Efficiency** - Get coverage summaries in <100 tokens instead of 10,000+
- **Accuracy** - Production-grade LCOV parsing that handles all format variations
- **Baseline Tracking** - Measure coverage progress within a session without keeping state in memory

**Test Coverage**: This project maintains 95% test coverage and we're targeting 100% soon.

## Two Main Workflows

### 1. Query Coverage Summary

Ask for overall project coverage or coverage for specific files:

```typescript
// Get overall project coverage
coverage_summary({ lcovPath: "./coverage/lcov.info" });
// Returns: { linesCoveragePercentage: 87.5, branchesCoveragePercentage: 82.1 }

// Get coverage for specific files
coverage_file_summary({
  lcovPath: "./coverage/lcov.info",
  filePath: "src/utils/parser.ts",
});
// Returns: { path: "src/utils/parser.ts", linesCoveragePercentage: 92.0, branchesCoveragePercentage: 88.5 }
```

### 2. Baseline Tracking for Session Progress

Establish a baseline at session start, then measure your progress:

```typescript
// At session start - record current coverage as baseline
start_recording({ lcovPath: "./coverage/lcov.info" });
// Returns: "Recording started"

// ... agent writes code and tests ...

// Check coverage impact
get_diff_since_start({ lcovPath: "./coverage/lcov.info" });
// Returns: { linesPercentageImpact: +2.3, branchesPercentageImpact: +1.8 }
```

**Why baseline tracking?** Without it, agents would need to keep initial coverage in their stateful memory throughout the session, consuming valuable context window space.

## Installation

```bash
npm install -g test-coverage-mcp
```

## Configuration

Add this MCP server to your AI coding tool's configuration:

### Claude Desktop (Claude Code)

**macOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: Edit `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "test-coverage": {
      "command": "npx",
      "args": ["-y", "test-coverage-mcp"]
    }
  }
}
```

After updating, restart Claude Desktop.

### Cursor IDE

Create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "test-coverage": {
      "command": "npx",
      "args": ["-y", "test-coverage-mcp"]
    }
  }
}
```

### GitHub Copilot (VS Code)

Create or edit `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "test-coverage": {
      "command": "npx",
      "args": ["-y", "test-coverage-mcp"]
    }
  }
}
```

Requires VS Code 1.99+ or Visual Studio 17.14+. Enterprise users need "MCP servers in Copilot" policy enabled.

### Windsurf (Codeium IDE)

**macOS**: Edit `~/.codeium/windsurf/mcp_config.json`
**Windows**: Edit `%APPDATA%\Codeium\Windsurf\mcp_config.json`
**Linux**: Edit `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "test-coverage": {
      "command": "npx",
      "args": ["-y", "test-coverage-mcp"]
    }
  }
}
```

Or use the GUI: Settings → Advanced Settings → Cascade → Add Server

## Available Tools

### `coverage_summary`

Get overall project coverage from an LCOV file.

**Input:**

```typescript
{
  lcovPath?: string  // Optional. Defaults to "./coverage/lcov.info"
}
```

**Output:**

```typescript
{
  linesCoveragePercentage: number,      // 0-100
  branchesCoveragePercentage: number    // 0-100
}
```

**Example:**

```typescript
coverage_summary({ lcovPath: "./coverage/lcov.info" });
// { linesCoveragePercentage: 87.5, branchesCoveragePercentage: 82.1 }
```

### `coverage_file_summary`

Get coverage for a specific file.

**Input:**

```typescript
{
  lcovPath?: string,  // Optional. Defaults to "./coverage/lcov.info"
  filePath: string    // Required. Path to the file
}
```

**Output:**

```typescript
{
  path: string,
  linesCoveragePercentage: number,      // 0-100
  branchesCoveragePercentage: number    // 0-100
}
```

**Example:**

```typescript
coverage_file_summary({
  lcovPath: "./coverage/lcov.info",
  filePath: "src/utils/parser.ts",
});
// { path: "src/utils/parser.ts", linesCoveragePercentage: 92.0, branchesCoveragePercentage: 88.5 }
```

### `start_recording`

Record current coverage as a baseline for later comparison.

**Input:**

```typescript
{
  lcovPath: string; // Required. Path to LCOV file to record
}
```

**Output:**

```typescript
"Recording started";
```

**Example:**

```typescript
start_recording({ lcovPath: "./coverage/lcov.info" });
// "Recording started"
```

### `get_diff_since_start`

Compare current coverage against the recorded baseline.

**Input:**

```typescript
{
  lcovPath: string; // Required. Path to current LCOV file
}
```

**Output:**

```typescript
{
  linesPercentageImpact: number,      // Positive = improvement, negative = regression
  branchesPercentageImpact: number    // Positive = improvement, negative = regression
}
```

**Example:**

```typescript
get_diff_since_start({ lcovPath: "./coverage/lcov.info" });
// { linesPercentageImpact: +2.3, branchesPercentageImpact: +1.8 }
```

## Usage Examples

### Example 1: Check Coverage Before Starting Work

```
Agent: "Let me check the current test coverage before I start working"
[Uses coverage_summary tool]
Agent: "Current coverage is 87.5% lines and 82.1% branches. I'll aim to maintain or improve this."
```

### Example 2: Track Coverage Impact During Development

```
Agent: "I'll record the baseline coverage first"
[Uses start_recording tool]

Agent: "Now I'll add the new authentication feature with tests"
[Writes code and tests]

Agent: "Let me check the coverage impact"
[Uses get_diff_since_start tool]
Agent: "Great! Coverage increased by 2.3% for lines and 1.8% for branches."
```

### Example 3: Verify Specific File Coverage

```
Agent: "Let me check coverage for the file I just modified"
[Uses coverage_file_summary with filePath: "src/auth/validator.ts"]
Agent: "The validator.ts file now has 95% line coverage and 92% branch coverage."
```

## How It Works

This MCP server:

1. **Parses LCOV files** using a production-grade parser that handles all LCOV format variations
2. **Calculates coverage** percentages for overall project or individual files
3. **Stores baselines** in a temporary directory for session-based tracking
4. **Returns compact JSON** responses that consume minimal tokens

## LCOV Format Support

This server supports all standard LCOV file formats, including:

- Files with summary sections (`SF:`, `end_of_record`)
- Files with line-by-line data only (`DA:` entries)
- Files with branch coverage data (`BRDA:`, `BRF:`, `BRH:`)
- Mixed formats within the same file

## Troubleshooting

### "LCOV file not found"

- Ensure you've run your test suite with coverage enabled first
- Check that the path to your LCOV file is correct (relative paths are resolved from current working directory)
- Default path is `./coverage/lcov.info`

### "No coverage data found for file"

- Verify the file path matches exactly as it appears in the LCOV file
- Some test frameworks use absolute paths, others use relative paths

### "No baseline recording found"

- You must call `start_recording` before calling `get_diff_since_start`
- Baselines are stored in temporary storage and cleared when the system restarts

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests (with coverage!)
npm test

# Run linter
npm run lint

# Test with MCP inspector
npm run inspect
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Yoni Goldberg

## Links

- [GitHub Repository](https://github.com/goldbergyoni/test-coverage-mcp)
- [npm Package](https://www.npmjs.com/package/test-coverage-mcp)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Report Issues](https://github.com/goldbergyoni/test-coverage-mcp/issues)


## Improvement ideas

- coverage_file_summary returns nested properties also declared as flat
- Start recording overrides other sessions files
- Improve record naming - setSessionBaseline, getDiffSinceBaseline
- 