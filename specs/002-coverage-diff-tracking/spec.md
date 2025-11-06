# Feature Specification: Coverage Diff Tracking

**Feature Branch**: `002-coverage-diff-tracking`
**Created**: 2025-10-28
**Status**: Draft
**Input**: User description: "We'd like to allow Agents that write code and test to get clear data on their impact so they can record and remember the coverage before they started and then do some stuff and then ask to get the coverage diff since they started. With this, they can see if they positively or negatively impacted the coverage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record Coverage Baseline (Priority: P1)

An AI agent working on a codebase wants to establish a coverage baseline before making any code changes, so it can later measure the impact of its work.

**Why this priority**: This is the foundation for the entire feature - without the ability to record a baseline, no diff can be calculated. It's the minimal viable functionality needed for any coverage tracking workflow.

**Independent Test**: Can be fully tested by calling the record baseline operation with an existing coverage file, verifying the snapshot is stored, and confirming that subsequent calls replace the previous snapshot. Delivers immediate value by enabling future diff calculations.

**Acceptance Scenarios**:

1. **Given** a project has a current LCOV coverage file, **When** agent calls "Start Coverage Record", **Then** the current coverage data is stored as a snapshot with a known filename
2. **Given** an existing coverage snapshot already exists, **When** agent calls "Start Coverage Record" again, **Then** the old snapshot is deleted and replaced with the new one
3. **Given** no LCOV coverage file exists, **When** agent calls "Start Coverage Record", **Then** system provides clear error message indicating no coverage file was found

---

### User Story 2 - Calculate Coverage Impact (Priority: P2)

An AI agent has made code changes and wants to see how those changes affected test coverage, both positively or negatively, to understand if it improved testing quality.

**Why this priority**: This delivers the core value proposition - visibility into coverage impact. It depends on P1 (baseline recording) but is the feature users actually want to use. Without this, the baseline recording has no purpose.

**Independent Test**: Can be tested by creating a baseline snapshot, modifying the coverage file to simulate code/test changes, calling the diff operation, and verifying the returned percentage impacts match the actual differences. Delivers clear value by showing concrete coverage improvements or regressions.

**Acceptance Scenarios**:

1. **Given** a coverage snapshot exists and tests have been run with improved coverage, **When** agent calls "Get Diff Since Start", **Then** system returns positive percentage values for lines and branches coverage impact
2. **Given** a coverage snapshot exists and coverage has decreased, **When** agent calls "Get Diff Since Start", **Then** system returns negative percentage values showing coverage regression
3. **Given** a coverage snapshot exists and coverage is unchanged, **When** agent calls "Get Diff Since Start", **Then** system returns zero values for both metrics
4. **Given** no coverage snapshot exists, **When** agent calls "Get Diff Since Start", **Then** system provides clear error message indicating no baseline was recorded

---

### User Story 3 - View Branch Coverage Metrics (Priority: P3)

An AI agent or user wants to see branch coverage percentages in addition to line coverage for all existing tools, providing a more complete picture of test quality.

**Why this priority**: This enhances existing functionality rather than enabling new workflows. It's valuable for comprehensive coverage assessment but not critical for the core diff tracking feature. Can be added after P1 and P2 are working.

**Independent Test**: Can be tested by calling existing coverage tools with LCOV files containing branch data and verifying branch coverage percentages are returned alongside line coverage. Delivers value by providing more thorough coverage metrics without requiring the diff tracking feature.

**Acceptance Scenarios**:

1. **Given** an LCOV file with branch coverage data, **When** agent requests project coverage, **Then** both lines and branches percentage are returned
2. **Given** an LCOV file with branch coverage data, **When** agent requests specific file coverage, **Then** both lines and branches percentage are returned for those files

---

### Edge Cases

- What happens when the LCOV file format changes between snapshot and current coverage?
- How does system handle corrupted or incomplete LCOV files?
- What happens if the coverage file is deleted between recording baseline and calculating diff?
- How does system handle very large LCOV files (performance considerations)?
- What happens when file paths in coverage data change (file renames/moves)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a command to record the current coverage as a baseline snapshot
- **FR-002**: System MUST store coverage snapshots in a fixed "snapshots" folder with a consistent filename
- **FR-003**: System MUST delete any existing snapshot when creating a new one (only one snapshot at a time)
- **FR-004**: System MUST provide a command to calculate the difference between current coverage and the stored snapshot
- **FR-005**: System MUST return coverage diff as an object containing lines percentage impact and branches percentage impact
- **FR-006**: System MUST calculate percentage impact as: current percentage minus snapshot percentage (positive = improvement, negative = regression)
- **FR-007**: System MUST enhance existing coverage tools to return both lines and branches coverage percentages
- **FR-008**: System MUST parse LCOV files to extract both line and branch coverage data
- **FR-009**: System MUST handle missing snapshot gracefully with clear error messaging
- **FR-010**: System MUST handle missing current coverage file gracefully with clear error messaging

### Key Entities

- **Coverage Snapshot**: A stored copy of LCOV coverage data from a specific point in time, used as a baseline for calculating future diffs. Contains line and branch coverage metrics for the entire project.

- **Coverage Diff Info**: The result of comparing current coverage against a snapshot. Contains two numeric values: lines percentage impact and branches percentage impact, where positive values indicate improvement and negative values indicate regression.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Agent can establish a coverage baseline and calculate a diff in under 5 seconds for typical projects (under 1000 files)
- **SC-002**: Coverage diff calculations are accurate within 0.01 percentage points compared to manual calculation
- **SC-003**: All existing coverage tools return both lines and branches coverage with no breaking changes to existing functionality
- **SC-004**: System handles 100% of well-formed LCOV files generated by standard coverage tools (Jest, Istanbul, etc.)
- **SC-005**: Agents receive clear, actionable error messages for 100% of failure scenarios (missing files, corrupted data, etc.)



