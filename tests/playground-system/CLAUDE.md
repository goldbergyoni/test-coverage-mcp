# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a playground system designed to test the coverage MCP with incomplete test coverage scenarios. It provides a test environment for validating coverage tracking and diff functionality.

## Development Setup

This project requires **Node.js 22**. Before running any commands, ensure you're on the correct version:

```bash
nvm use
```

## Commands

### Running Tests
```bash
npm test
```

This executes the Node.js test runner with coverage reporting, generating an LCOV report at `coverage/lcov.info`.

## Checking Coverage

Use the coverage MCP tools to analyze test coverage:
- `coverage_summary` - Get overall project line coverage percentage
- `coverage_file_summary` - Get coverage for a specific file
- `start_recording` - Record baseline coverage before changes
- `get_diff_since_start` - Compare current coverage against baseline
