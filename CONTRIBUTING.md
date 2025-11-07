# Contributing to test-coverage-mcp

Thank you for your interest in contributing to test-coverage-mcp! This guide explains how to publish new versions.

## Prerequisites

Before publishing, ensure you have:

- **npm account**: Create one at [npmjs.com](https://www.npmjs.com)
- **npm login**: Run `npm login` to authenticate
- **GitHub account**: Required for MCP registry (you're publishing under `io.github.goldbergyoni`)
- **Write access**: To this repository

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.0 → 1.0.1): Bug fixes, no breaking changes
- **Minor** (1.0.0 → 1.1.0): New features, backwards compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes (API changes, schema changes)

## Publishing Workflow

### Step 1: Update Version Numbers

**IMPORTANT**: You must update version in TWO files:

1. `package.json` - Updated automatically by npm scripts
2. `server.json` - **Must be updated manually** (lines 9 and 14)

Edit `server.json` to match the new version:
```json
{
  "version": "2.0.0",
  "packages": [
    {
      "version": "2.0.0"
    }
  ]
}
```

### Step 2: Publish to npm

Run the appropriate command based on version type:

```bash
# For bug fixes (1.0.0 → 1.0.1)
npm run publish:patch

# For new features (1.0.0 → 1.1.0)
npm run publish:minor

# For breaking changes (1.0.0 → 2.0.0)
npm run publish:major
```

This automatically:
- Runs tests, linting, and builds (via `prepublishOnly`)
- Updates `package.json` version
- Creates a git tag
- Publishes to npm registry

### Step 3: Publish to MCP Registry

#### Install MCP Publisher CLI (First Time Only)

Choose one method:

**Homebrew** (Recommended for macOS):
```bash
brew install mcp-publisher
```

**Direct download** (macOS/Linux):
```bash
curl -L "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
```

**From source** (requires Go 1.24+):
```bash
git clone https://github.com/modelcontextprotocol/registry
cd registry
make publisher
export PATH=$PATH:$(pwd)/bin
```

#### Publish to Registry

```bash
# Navigate to project root
cd /path/to/test-coverage-mcp

# Publish (will prompt for GitHub authentication)
mcp-publisher publish
```

The CLI will:
1. Read your `server.json` configuration
2. Prompt you to authenticate via GitHub (required for `io.github.goldbergyoni` namespace)
3. Validate the configuration
4. Submit to the MCP registry

#### Verify Publication

After publishing, verify your server appears at:
- MCP Registry: Check [modelcontextprotocol.io](https://modelcontextprotocol.io)
- npm: `npm view test-coverage-mcp`

## Complete Publishing Checklist

- [ ] Make and test your changes
- [ ] Run tests: `npm test`
- [ ] Run linter: `npm run lint`
- [ ] Update `server.json` version (lines 9 and 14) to match new version
- [ ] Commit all changes: `git add . && git commit -m "Release v2.0.0"`
- [ ] Publish to npm: `npm run publish:major` (or minor/patch)
- [ ] Publish to MCP registry: `mcp-publisher publish`
- [ ] Verify on npm: `npm view test-coverage-mcp`
- [ ] Verify on MCP registry
- [ ] Push git tags: `git push && git push --tags`

## Important Notes

### Version Sync

Always keep these versions in sync:
- `package.json` → version (auto-updated by npm scripts)
- `server.json` → version (line 9) - **UPDATE MANUALLY**
- `server.json` → packages[0].version (line 14) - **UPDATE MANUALLY**

### Namespace

This project uses `io.github.goldbergyoni/test-coverage-mcp` which requires:
- GitHub authentication during MCP registry publishing
- Publishing as the `goldbergyoni` GitHub user

### Automated Checks

The `prepublishOnly` script runs automatically before npm publish:
```json
"prepublishOnly": "npm run build && npm test && npm run lint"
```

If any step fails, publishing is aborted.

## Troubleshooting

### "Authentication failed" (MCP Registry)

Ensure you're authenticated as the `goldbergyoni` GitHub user. The CLI will guide you through OAuth.

### "Version already exists" (npm)

You cannot republish the same version. Bump the version using the publish scripts.

### "Tests failing"

Fix failing tests before publishing. The `prepublishOnly` hook will prevent publishing.

### server.json validation errors

Ensure:
- Version format is semantic (e.g., "1.0.0", not "v1.0.0")
- npm package name matches: `"test-coverage-mcp"`
- Both version fields in server.json are identical

## Questions?

- Open an issue in this repository
- Check MCP Registry docs: https://github.com/modelcontextprotocol/registry
