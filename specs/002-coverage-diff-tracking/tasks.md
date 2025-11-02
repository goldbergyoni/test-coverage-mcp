# Tasks: Coverage Diff Tracking

**Input**: Design documents from `/specs/002-coverage-diff-tracking/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - tests are OPTIONAL

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Walking Skeleton + Foundation

**Purpose**: Create the complete external shell of the feature with all public APIs, types, test structure, and foundational infrastructure. This allows for review of the interface before implementation.

- [X] T001 [US1] Create walking skeleton for start_recording tool: add tool schema to src/schemas/tool-schemas.ts with complete input/output schema and error codes
- [X] T002 [P] [US2] Create walking skeleton for get_diff_since_start tool: add tool schema to src/schemas/tool-schemas.ts with complete input/output schema and error codes
- [X] T003 [P] [US1] Create recorder module stub in src/core/coverage/recorder.ts with exported function signatures (recordSnapshot, snapshotExists) that throw "Not implemented"
- [X] T004 [P] [US2] Create diff-calculator module stub in src/core/coverage/diff-calculator.ts with exported function signature (calculateDiffSinceRecording) that throws "Not implemented"
- [X] T005 [P] [US3] Enhance calculator types in src/core/coverage/calculator.ts: update CoverageMetrics type to include branchesCoveragePercentage field
- [X] T006 [US1] Add start_recording handler stub to src/mcp/handlers.ts that calls recordSnapshot (throws "Not implemented")
- [X] T007 [US2] Add get_diff_since_start handler stub to src/mcp/handlers.ts that calls calculateDiffSinceRecording (throws "Not implemented")
- [X] T008 Register both new tools in src/mcp/server.ts with schemas from tool-schemas.ts
- [X] T009 Create recording folder structure: ensure recording/ directory exists at project root
- [X] T010 [P] Add CoverageDiffInfo type to src/core/coverage/types.ts (linesPercentageImpact, branchesPercentageImpact)
- [X] T011 [P] Add error codes to src/core/errors.ts: NO_RECORDING_FOUND error type
- [X] T012 [P] Create helper function in src/core/coverage/calculator.ts to extract branch coverage from parsed LCOV data
- [X] T013 Create complete test suite in tests/diff-tracking.test.ts with REAL assertions (TDD - tests will fail until implementation): record baseline (success, replacement), get diff (positive/negative/zero impact, no recording error, missing LCOV error), branch coverage included in results. Group scenarios with describe blocks

**Checkpoint**: Walking skeleton complete - all external APIs, types, foundational infrastructure, and test structure defined. Ready for review before implementation.

---

## Phase 2: User Story 1 - Record Coverage Baseline (Priority: P1) 🎯 MVP

**Goal**: Enable AI agents to establish a coverage baseline before making code changes

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement snapshot creation in src/core/coverage/recorder.ts: recordSnapshot function copies LCOV to recording/last-recording.lcov
- [X] T015 [P] [US1] Implement snapshot deletion in src/core/coverage/recorder.ts: delete existing snapshot before creating new one
- [X] T016 [P] [US1] Implement snapshot existence check in src/core/coverage/recorder.ts: snapshotExists function
- [X] T017 [US1] Update start_recording handler in src/mcp/handlers.ts: implement full logic calling recordSnapshot
- [X] T018 [US1] Add error handling in start_recording handler for LCOV_FILE_NOT_FOUND and INVALID_LCOV_FORMAT

**Checkpoint**: Recording tests pass in tests/diff-tracking.test.ts - confirm recording scenarios (success, replacement) pass with npm test

---

## Phase 3: User Story 2 - Calculate Coverage Impact (Priority: P2)

**Goal**: Enable AI agents to see how their changes affected test coverage

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement snapshot reading in src/core/coverage/recorder.ts: readSnapshot function reads and parses recording/last-recording.lcov
- [X] T020 [P] [US2] Implement diff calculation in src/core/coverage/diff-calculator.ts: calculateDiffSinceRecording compares current vs snapshot
- [X] T021 [P] [US2] Enhance calculator to compute branch coverage percentage in src/core/coverage/calculator.ts: use extractBranchCoverage helper
- [X] T022 [US2] Update get_diff_since_start handler in src/mcp/handlers.ts: implement full logic calling calculateDiffSinceRecording
- [X] T023 [US2] Add error handling in get_diff_since_start handler for NO_RECORDING_FOUND, LCOV_FILE_NOT_FOUND, INVALID_LCOV_FORMAT

**Checkpoint**: Diff calculation tests pass in tests/diff-tracking.test.ts - confirm diff scenarios (positive/negative/zero impact, no recording error, missing LCOV error) pass with npm test

---

## Phase 4: User Story 3 - View Branch Coverage Metrics (Priority: P3)

**Goal**: Enhance all existing tools to show branch coverage alongside line coverage

### Implementation for User Story 3

- [X] T024 [US3]     Create the walking skeleton for user story 3 where you only enhance the types, the schemas, the testing, write a little more testing that includes a branch coverage, and that's it, no implementation.
- [X] T025 [P] [US3] Enhance calculateProjectCoverage in src/core/coverage/calculator.ts: return both linesCoveragePercentage and branchesCoveragePercentage
- [X] T026 [P] [US3] Enhance calculateFileCoverage in src/core/coverage/calculator.ts: return both metrics for specific files
- [X] T027 [US3] Update coverage_summary handler in src/mcp/handlers.ts to return enhanced metrics
- [X] T028 [US3] Update file_coverage handler in src/mcp/handlers.ts to return enhanced metrics

**Checkpoint**: Branch coverage tests pass - update tests for coverage_summary and file_coverage tools to verify branchesCoveragePercentage field is present and correct, confirm with npm test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Walking Skeleton + Foundation)**: No dependencies - creates all external APIs, types, test structure, and foundational infrastructure first for review
- **Phase 2 (US1)**: Depends on Phase 1 - implements recording baseline functionality
- **Phase 3 (US2)**: Depends on Phase 2 completion (needs recordSnapshot) - implements diff calculation
- **Phase 4 (US3)**: Depends on Phase 3 completion (enhances existing calculator) - implements branch metrics

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for US2 - implements snapshot recording
- **User Story 2 (P2)**: Depends on US1 - uses recorded snapshots for diff calculation
- **User Story 3 (P3)**: Enhances existing tools - depends on calculator refactoring in US2

### Within Each Phase

**Phase 1 (Walking Skeleton + Foundation)**:
- T001, T002 (tool schemas) can run in parallel
- T003, T004, T005 (module stubs) can run in parallel
- T006, T007 (handler stubs) sequential after T003-T005
- T008 (registration) after T006-T007
- T009 (recording folder) after T008
- T010, T011, T012 (types, errors, helpers) can run in parallel
- T013 (complete test suite with real assertions) after T010-T012

**Phase 2 (US1)**:
- T014, T015, T016 (recorder functions) can run in parallel
- T017, T018 (handler implementation) sequential after T014-T016

**Phase 3 (US2)**:
- T019, T020, T021 (diff calculation components) can run in parallel
- T022, T023 (handler implementation) sequential after T019-T021

**Phase 4 (US3)**:
- T024, T025 (calculator enhancements) can run in parallel
- T026, T027 (handler updates) can run in parallel after T024-T025

### Parallel Opportunities

**Phase 1**: T001, T002 (schemas); T003, T004, T005 (stubs); T010, T011, T012 (types/errors/helpers)

**Phase 2 (US1)**: T014, T015, T016 can run in parallel

**Phase 3 (US2)**: T019, T020, T021 can run in parallel

**Phase 4 (US3)**: T024, T025 can run in parallel; T026, T027 can run in parallel

---

## Implementation Strategy

### Walking Skeleton First (Phase 1)

1. Complete Phase 1: Walking Skeleton + Foundation (T001-T013)
2. **STOP and REVIEW**: Review all external APIs, types, tool schemas, foundational infrastructure, and test suite (tests will be failing - this is expected TDD)
3. Get approval on interface design before proceeding to implementation
4. This ensures the public API is correct before writing internal logic

### Incremental Delivery

1. **Phase 1** (Walking Skeleton + Foundation) → External APIs, types, and foundation defined → **REVIEW POINT** ✅
2. **+Phase 2** (US1) → Recording working → **Checkpoint: Recording tests pass** → MVP DEPLOYED ✅
3. **+Phase 3** (US2) → Diff calculation working → **Checkpoint: Diff tests pass** → Core feature complete
4. **+Phase 4** (US3) → Branch metrics added → **Checkpoint: Branch coverage tests pass** → Full feature set deployed

### Parallel Team Strategy

With multiple developers after Walking Skeleton approval:

- **Developer A**: US1 (Phase 2) - Recording functionality
- **Developer B**: Prepare for US2
- After US1 complete: Developer B implements US2, Developer A implements US3

---

## Task Summary

**Total Tasks**: 27

**By Phase**:
- Phase 1 (Walking Skeleton + Foundation): 13 tasks
- Phase 2 (US1): 5 tasks
- Phase 3 (US2): 5 tasks
- Phase 4 (US3): 4 tasks

**By User Story**:
- US1 (Record Baseline): 5 tasks
- US2 (Calculate Impact): 5 tasks
- US3 (Branch Metrics): 4 tasks
- Walking Skeleton/Foundation: 13 tasks

**Parallel Opportunities**: 12 tasks marked [P] can run in parallel within their phases

**Checkpoint Criteria**:
- Phase 1: All external APIs, types, and foundation defined, ready for review (tests will be failing - TDD approach)
- Phase 2: Recording tests pass with npm test
- Phase 3: Diff calculation tests pass with npm test
- Phase 4: Branch coverage tests pass with npm test

**MVP Scope**: Phases 1-2 (18 tasks including walking skeleton review) deliver User Story 1 - agents can record coverage baselines

**Walking Skeleton Review Point**: After Phase 1 (13 tasks), all external APIs, types, and foundational infrastructure are defined and ready for review before implementation begins. Tests will be failing at this point (TDD approach - red, then green).

---

## Notes

- All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with path`
- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- **Walking skeleton + foundation come first** - all external APIs, types, and foundational infrastructure defined before implementation
- **TDD approach**: Tests written in Phase 1 with REAL assertions, will fail until implementation complete (red → green)
- **Checkpoint for each phase**: Implementation is done when tests pass with npm test
- Single test file tests/diff-tracking.test.ts covers entire feature workflow with describe blocks
- Branch coverage tested in diff-tracking.test.ts AND existing coverage tool tests
- Each user story is independently completable with clear test checkpoint
- Type definitions use TypeScript `type` aliases, not interfaces (per constitution)
- Functions should be short (<20 lines) and focused (per constitution)
- MCP handlers are thin wrappers, core logic in src/core/ (per constitution)
- Tool schemas in src/schemas/tool-schemas.ts define complete contracts
- Recording snapshot stored at recording/last-recording.lcov
- Existing coverage tools enhanced to return branch coverage (backward compatible)
- Error responses include clear error codes and messages
- Calculator returns both linesCoveragePercentage and branchesCoveragePercentage
- Tool names use snake_case (start_recording, get_diff_since_start)
- Default LCOV path resolution handled by existing path-resolver.ts
