<!--
Sync Impact Report:
- Version change: 0.0.0 (template) → 1.0.0
- Modified principles: N/A (initial constitution)
- Added sections: All core principles (1-5), Development Standards, Testing Philosophy, Governance
- Removed sections: N/A
- Templates requiring updates:
  ✅ constitution.md (this file - completed)
  ✅ plan-template.md (updated Constitution Check with concrete principle checklist)
  ✅ spec-template.md (no changes required - principles don't add mandatory sections)
  ✅ tasks-template.md (added test standards reminder aligned with testing principles)
- Follow-up TODOs: None
-->

# Coverage MCP Tool Constitution

## Core Principles

### I. Short, Focused Functions

Functions MUST be concise and single-purpose. Each function should do one thing well and be easily understood at a glance. Complex operations MUST be decomposed into smaller, composable functions rather than creating long procedural code.

**Rationale**: Short functions improve readability, testability, and maintainability. They reduce cognitive load and make debugging easier. Functions under 20 lines are easier to understand and modify without introducing bugs.

### II. Proven and Popular Dependencies

All external dependencies MUST be well-established libraries with strong community support, active maintenance, and proven stability. Avoid experimental, abandoned, or niche packages unless absolutely necessary and explicitly justified.

**Rationale**: Popular dependencies reduce risk of supply chain issues, have better documentation, receive security updates, and have community-tested solutions for common problems. This minimizes technical debt and maintenance burden.

### III. Simple, Self-Explanatory Tests

Test code MUST mimic real user flows in a single process. Tests create their own data and files needed for scenarios, making them self-contained and independent. Each test MUST be under 10 lines long by extracting common setup logic into well-named helper functions.

**Rationale**: Self-explanatory tests serve as living documentation and reduce time to understand test failures. Short tests with helpers improve maintainability while ensuring test isolation prevents flaky tests and enables parallel execution.

### IV. Core Domain Separation

Core business logic and domain models MUST be separated from entry points (CLI, API, MCP handlers). Entry points act as thin adapters that translate external protocols into domain operations. Domain code MUST NOT depend on framework-specific or protocol-specific code.

**Rationale**: Separation enables testing core logic without invoking entry points, allows switching protocols or interfaces without rewriting business logic, and prevents framework lock-in. Domain logic remains pure and reusable.

### V. Linting Compliance

All code MUST pass ESLint with default configuration (or project-configured rules) without warnings or errors. Linting rules MUST NOT be disabled except for specific, documented cases approved during code review.

**Rationale**: Consistent linting enforces code quality standards, catches common bugs early, maintains code uniformity across the team, and reduces bikeshedding in code reviews. Automated enforcement reduces manual review burden.

## Development Standards

### Language & Runtime

- **Language**: TypeScript with Node.js runtime
- **Type System**: Use `type` declarations (NOT `interface`)
- **Async Patterns**: Prefer async/await over callbacks or raw promises
- **Error Handling**: Use typed errors and explicit error handling

### Code Style

- Use ESLint default configuration
- Prefer explicit over implicit behavior
- Avoid comments except for complex algorithms (code should be self-documenting through naming and structure)
- Use descriptive variable and function names that reveal intent

### Dependency Management

- Minimize dependency count
- Evaluate dependencies for: maintenance status, download count, security audit results, license compatibility
- Document rationale for any non-standard or specialized dependencies

## Testing Philosophy

### Test Organization

- Tests MUST mimic user workflows in a single process
- Each test MUST be independently runnable without external state
- Test files create their own fixtures, data files, and temporary resources
- Cleanup MUST occur in test teardown to prevent pollution

### Test Structure

- Main test body: under 10 lines
- Setup logic: extracted to named helper functions
- Assertions: clear and specific about expected outcomes
- Test names: describe the scenario and expected behavior

### Test Coverage

- Critical paths MUST have tests
- Edge cases MUST be covered
- Error conditions MUST be tested
- Public API surface MUST have contract tests

## Governance

### Amendment Process

1. Propose constitutional change with rationale
2. Document impact on existing code and templates
3. Update version number following semantic versioning
4. Update dependent templates (plan, spec, tasks, commands)
5. Commit constitution changes with impact report

### Versioning Policy

- **MAJOR**: Backward-incompatible principle changes, removals, or redefinitions
- **MINOR**: New principles added, material expansions of existing principles
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Review

- All code reviews MUST verify compliance with constitutional principles
- Violations MUST be justified in writing and approved by team lead
- Complexity additions MUST document why simpler alternatives were rejected
- Templates MUST be kept synchronized with constitution changes

### Constitutional Authority

This constitution supersedes all other development practices and guidelines. When conflicts arise between this document and other guidance, the constitution takes precedence. Use project-specific documentation (CLAUDE.md, README.md) for runtime development guidance that does not conflict with these principles.

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22
