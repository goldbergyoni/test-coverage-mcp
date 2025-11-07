# Contributing to test-coverage-mcp

## Prerequisites

- npm account and logged in (`npm login`)
- GitHub account for MCP registry
- [mcp-publisher CLI](https://github.com/modelcontextprotocol/registry) installed

## Publishing Workflow

### 1. Update Versions (BOTH files required)

**CRITICAL**: Update version in TWO places:

Edit `server.json` (lines 9 and 14):
```json
{
  "version": "1.2.0",
  "packages": [{ "version": "1.2.0" }]
}
```

(`package.json` updates automatically via npm scripts)

### 2. Commit and Publish

```bash
# Run tests and commit
npm test && npm run lint
git add . && git commit -m "Release v1.2.0"

# Publish to npm (choose one):
npm run publish:patch   # Bug fixes (1.0.0 → 1.0.1)
npm run publish:minor   # New features (1.0.0 → 1.1.0)
npm run publish:major   # Breaking changes (1.0.0 → 2.0.0)

# Publish to MCP registry
npm run publish:mcp

# Push tags
git push && git push --tags
```

### 3. Verify

- npm: `npm view test-coverage-mcp`
- MCP Registry: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## Version Strategy

Follow [semver](https://semver.org/): **major.minor.patch**

## Notes

- Both `server.json` versions must match exactly
- `prepublishOnly` runs tests/lint/build automatically
- MCP publishing requires GitHub auth as `goldbergyoni`
