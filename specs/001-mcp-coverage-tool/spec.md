# Feature Specification: MCP Coverage Analysis Tool

**Feature Branch**: `001-mcp-coverage-tool`
**Created**: 2025-10-21
**Status**: Draft
**Input**: User description: "when the AI agent writes code and tests, it can't easily know how and if it affected the test coverage. If it tries to parse lcov files, it consumes tons of tokens, so it needs some MCP tool to easily get the project coverage in advance and after the change in overall and also per file. Consequently, we need to write a standard MCP model context protocol tool that exposes a few commands: the first command gets the path of Elcov file and returns the overall project lines coverage. The second command is very similar, only it gets as a parameter an array of file paths and returns the coverage only for these files. The third one is interesting; it constitutes two commands. The first one is called start recording snapshot, which will store the existing coverage in some temporary folder. The next command is add end recording snapshot, which will return the difference between the start and now. We need to support every type of LCAP file. Some of them contain already contains per-file summary, while others don't, and they just hold a line-by-line count. We need to be prepared for both cases. The MCP should be very standard with great descriptions so the LLM can invoke it at the right time"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get Overall Coverage Before Code Changes (Priority: P1)

An AI agent starts working on a development task and needs to understand the current test coverage baseline before making any changes. The agent invokes a command with the path to the project's coverage file and receives the overall coverage percentage.

**Why this priority**: This is the foundation use case - agents need to know the starting point before making improvements. Without this, agents cannot measure their impact on coverage.

**Independent Test**: Can be fully tested by pointing to any LCOV file and verifying it returns the correct overall line coverage percentage. Delivers immediate value by answering "what's our current coverage?"

**Acceptance Scenarios**:

1. **Given** an LCOV file with per-file summary sections, **When** agent requests overall coverage with the file path, **Then** system returns total line coverage percentage
2. **Given** an LCOV file with only line-by-line data (no summary), **When** agent requests overall coverage, **Then** system calculates and returns total line coverage percentage
3. **Given** no file path is provided, **When** agent requests overall coverage, **Then** system looks for lcov file in `coverage` folder at project root and returns coverage
4. **Given** an invalid or missing LCOV file path, **When** agent requests coverage, **Then** system returns clear error message indicating file not found
5. **Given** a malformed LCOV file, **When** agent requests coverage, **Then** system returns error message indicating parsing failure with helpful context

---

### User Story 2 - Get Coverage for a Specific File (Priority: P2)

An AI agent modifies a specific file and wants to understand coverage for just that file without parsing the entire coverage report. The agent provides a single file path and receives coverage data for that file.

**Why this priority**: Enables focused analysis on a changed file, reducing cognitive load and token consumption. Common workflow is to change one file and want to see its coverage.

**Independent Test**: Can be fully tested by providing a specific file path from an LCOV report and verifying that file's coverage is returned. Delivers value by enabling targeted coverage analysis.

**Acceptance Scenarios**:

1. **Given** an LCOV file and a specific file path, **When** agent requests coverage for that file, **Then** system returns coverage percentage for the requested file
2. **Given** a file path that exists in the project but not in coverage report, **When** agent requests its coverage, **Then** system returns 0% coverage or indicates file is uncovered
3. **Given** a relative file path, **When** agent requests coverage, **Then** system correctly matches it against paths in the LCOV file

---

### User Story 3 - Compare Coverage Before and After Changes (Priority: P1)

An AI agent wants to understand whether code changes improved or degraded test coverage. The agent starts a coverage recording before making changes, then after completing work, ends the recording to see the difference.

**Why this priority**: This is the critical use case that enables agents to verify they're improving coverage. Answers "did my changes make things better or worse?" which is essential for quality-focused development.

**Independent Test**: Can be fully tested by starting a recording, modifying coverage data, then ending the recording. Delivers value by showing coverage delta, enabling agents to validate their testing work.

**Acceptance Scenarios**:

1. **Given** no existing recording, **When** agent starts a coverage recording, **Then** system stores the current coverage state and returns recording identifier
2. **Given** an active recording, **When** agent ends the recording with new coverage data, **Then** system returns the difference showing coverage increase/decrease overall and per file
3. **Given** a recording was taken and coverage improved, **When** agent ends recording, **Then** system shows positive delta with files that gained coverage
4. **Given** a recording was taken and coverage decreased, **When** agent ends recording, **Then** system shows negative delta with files that lost coverage
5. **Given** a recording was taken but new files were added, **When** agent ends recording, **Then** system includes new files in the comparison showing them as additions
6. **Given** multiple recordings could be active, **When** agent starts a new recording, **Then** system manages multiple recordings with unique identifiers

---

### User Story 4 - Receive Clear Guidance for Command Usage (Priority: P3)

An LLM encounters a development scenario and needs to determine which coverage command to invoke. The tool provides clear, descriptive command documentation that helps the LLM understand when and how to use each command.

**Why this priority**: While important for usability, this is primarily about documentation quality rather than core functionality. Good descriptions enhance adoption but don't block basic usage.

**Independent Test**: Can be tested by reviewing command descriptions and verifying they clearly indicate purpose, parameters, and expected returns. Delivers value by improving discoverability.

**Acceptance Scenarios**:

1. **Given** an LLM reviewing available commands, **When** it reads command descriptions, **Then** each command clearly states its purpose, when to use it, and what it returns
2. **Given** an LLM needs to choose between overall and file-specific coverage, **When** it reviews descriptions, **Then** the distinction between commands is clear
3. **Given** an LLM wants to track coverage changes, **When** it reviews recording commands, **Then** the two-step process (start/end) is clearly documented with examples

---

### Edge Cases

- What happens when an LCOV file contains no coverage data (empty file)?
- How does the system handle LCOV files with mixed formats (some files with summaries, others without)?
- What if a recording is started but never ended (orphaned recordings)?
- What happens when comparing recordings where files were deleted between start and end?

## Clarifications

### Session 2025-10-23

- Q: Should the lcov file path be optional, with a default lookup location? → A: Yes, if no path is provided, look for lcov file in a `coverage` folder at the project root
- Q: What terminology should be used for the coverage capture feature? → A: Use "recording" terminology (`start_coverage_record`, `end_coverage_record`) instead of "snapshot"

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse LCOV files and extract overall line coverage percentage
- **FR-002**: System MUST support LCOV files with per-file summary sections (DA/LH/LF records)
- **FR-003**: System MUST support LCOV files with only line-by-line execution data
- **FR-004**: System MUST accept an optional file path parameter and return coverage data for the specified LCOV file; if no path provided, system MUST look for lcov file in `coverage` folder at project root
- **FR-005**: System MUST accept a single file path and return coverage percentage for that file
- **FR-006**: System MUST provide a command to start a coverage recording with a unique identifier
- **FR-007**: System MUST store recording data temporarily for later comparison
- **FR-008**: System MUST provide a command to end a coverage recording and return the difference
- **FR-009**: System MUST return coverage differences showing increases and decreases per file
- **FR-010**: System MUST return overall coverage difference between recording start and end
- **FR-011**: System MUST handle file paths using both absolute and relative path formats
- **FR-012**: System MUST return clear error messages when LCOV files cannot be parsed or found
- **FR-013**: Commands MUST include descriptions that clearly explain their purpose and usage to LLMs
- **FR-014**: System MUST follow MCP (Model Context Protocol) standard specification
- **FR-015**: System MUST return coverage data in a structured format that minimizes token consumption
- **FR-016**: System MUST handle LCOV files where some files have summaries and others don't (mixed format)
- **FR-017**: System MUST identify new files added between recording start and end
- **FR-018**: System MUST identify files removed between recording start and end
- **FR-019**: Recording storage MUST support concurrent recordings with unique identifiers
- **FR-020**: System MUST provide coverage as percentage with reasonable precision (e.g., one decimal place)

### Key Entities

- **Coverage Report**: Represents parsed LCOV file data containing line coverage information for all files in a project. Attributes include overall coverage percentage, per-file coverage data, total lines, and covered lines.

- **Coverage Recording**: Represents a point-in-time capture of coverage data used for comparison. Attributes include unique identifier, timestamp, overall coverage, per-file coverage map, and source LCOV file path.

- **File Coverage**: Represents coverage data for a single file. Attributes include file path, total lines, covered lines, coverage percentage, and uncovered line numbers.

- **Coverage Delta**: Represents the difference between two coverage states (recording start and end). Attributes include overall coverage change, per-file changes (increase/decrease), newly covered files, and newly uncovered files.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI agents can retrieve overall project coverage in under 5 seconds for LCOV files up to 50MB
- **SC-002**: System returns file-specific coverage using less than 300 tokens per file in the response
- **SC-003**: Coverage recordings can be created and compared within 5 seconds for projects with up to 1000 files
- **SC-005**: System correctly parses 100% of valid LCOV files regardless of whether they contain per-file summaries
