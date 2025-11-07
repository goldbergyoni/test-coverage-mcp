# Agent Instructions

## Running Tests

Before running tests, ensure you're on the correct Node.js version:

```bash
nvm use
```

This will switch to Node.js 22 as specified in the `.nvmrc` file.

Then run the tests using the npm script:

```bash
npm test
```

This runs the test command configured in `package.json`, which includes:
- Running tests with Node.js test runner
- Generating coverage reports
- Outputting coverage to `coverage/lcov.info`

## Checking Coverage

Use the coverage MCP tools to check your test coverage anytime:
- `coverage_summary` - Get overall project line coverage percentage
- `coverage_file_summary` - Get coverage for a specific file
- `start_recording` - Record baseline coverage before changes
- `get_diff_since_start` - Compare current coverage against baseline
