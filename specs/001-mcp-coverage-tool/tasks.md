# Tasks: MCP Coverage Analysis Tool

**Input**: Design documents from `/specs/001-mcp-coverage-tool/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification - tests are OPTIONAL

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure with src/, src/mcp/, src/core/coverage/, src/core/recording/, tests/integration/, tests/fixtures/, tests/helpers/
- [X] T002 Initialize Node.js project with package.json (name: coverage-mcp, version: 1.0.0, type: module)
- [X] T003 [P] Install core dependencies: @modelcontextprotocol/sdk, @friedemannsommer/lcov-parser (exact versions)
- [X] T004 [P] Install dev dependencies: vitest, typescript, @types/node (exact versions)
- [X] T005 [P] Configure TypeScript with tsconfig.json (target: ES2022, module: NodeNext, strict: true)
- [X] T006 [P] Configure ESLint with eslint.config.js following project constitution
- [X] T007 [P] Add build and test scripts to package.json (build, test, lint)
- [X] T008 Create .gitignore file (node_modules/, dist/, coverage/, .DS_Store)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Define core types in src/core/coverage/types.ts (CoverageInfo, FileCoverageInfo, MultiFileCoverageInfo)
- [X] T010 [P] Define recording types in src/core/recording/types.ts (RecordingSession, CoverageSnapshot, RecordResults)
- [X] T011 [P] Define error types in src/core/errors.ts (CoverageError, CoverageErrorCode, ErrorResponse)
- [X] T012 Create MCP server initialization in src/mcp/server.ts (McpServer with STDIO transport)
- [X] T013 Create main entry point in src/index.ts that starts MCP server
- [X] T014 [P] Create test helper for building LCOV content in tests/helpers/lcov-builder.ts
- [X] T015 [P] Create sample LCOV fixtures in tests/fixtures/sample-lcov/ (with-summary.lcov, without-summary.lcov, mixed.lcov, empty.lcov)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Get Overall Coverage Before Code Changes (Priority: P1) 🎯 MVP

**Goal**: Enable AI agents to retrieve overall project coverage percentage from LCOV files

**Independent Test**: Point to any LCOV file and verify it returns the correct overall line coverage percentage

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement LCOV file parser wrapper in src/core/coverage/parser.ts (parseLcovFile function)
- [X] T017 [P] [US1] Implement overall coverage calculator in src/core/coverage/calculator.ts (calculateOverallCoverage function)
- [X] T018 [US1] Implement path resolution and default lookup in src/core/coverage/path-resolver.ts (resolveLcovPath function with ./coverage/lcov.info default)
- [X] T019 [US1] Create MCP handler for coverage_summary tool (overall coverage case) in src/mcp/handlers.ts
- [X] T020 [US1] Register coverage_summary tool in src/mcp/server.ts with Zod schema validation
- [X] T021 [US1] Add error handling for file not found and parse errors in src/mcp/handlers.ts
- [X] T022 [US1] Create integration test in tests/integration/overall-coverage.test.ts using InMemoryTransport

**Checkpoint**: At this point, User Story 1 should be fully functional - agents can get overall project coverage

---

## Phase 4: User Story 2 - Get Coverage for a Specific File (Priority: P2)

**Goal**: Enable AI agents to get coverage for specific files without parsing entire report

**Independent Test**: Provide a specific file path from an LCOV report and verify that file's coverage is returned

### Implementation for User Story 2

- [ ] T023 [P] [US2] Implement file-specific coverage lookup in src/core/coverage/calculator.ts (calculateFileCoverage function)
- [ ] T024 [P] [US2] Implement multi-file coverage lookup in src/core/coverage/calculator.ts (calculateMultiFileCoverage function)
- [ ] T025 [US2] Implement file path matching logic in src/core/coverage/path-matcher.ts (matchFilePaths function handling relative/absolute)
- [ ] T026 [US2] Extend coverage_summary handler to support filePath parameter in src/mcp/handlers.ts
- [ ] T027 [US2] Extend coverage_summary handler to support filePaths array parameter in src/mcp/handlers.ts
- [ ] T028 [US2] Add error handling for files not in coverage report in src/mcp/handlers.ts
- [ ] T029 [US2] Create integration test in tests/integration/file-coverage.test.ts for single file coverage
- [ ] T030 [US2] Create integration test in tests/integration/multi-file-coverage.test.ts for multiple files coverage

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Compare Coverage Before and After Changes (Priority: P1)

**Goal**: Enable AI agents to track coverage changes by comparing before/after states

**Independent Test**: Start recording, modify coverage data, end recording, verify delta is correct

### Implementation for User Story 3

- [ ] T031 [P] [US3] Implement recording storage manager in src/core/recording/storage.ts (createRecording, loadRecording, deleteRecording functions)
- [ ] T032 [P] [US3] Implement coverage snapshot creation in src/core/recording/snapshot.ts (createSnapshot function)
- [ ] T033 [US3] Implement coverage comparison logic in src/core/recording/comparator.ts (compareCoverage function)
- [ ] T034 [US3] Implement recording ID generation using crypto.randomUUID in src/core/recording/id-generator.ts
- [ ] T035 [US3] Implement temp directory management in src/core/recording/storage.ts (using os.tmpdir and fs.mkdtemp)
- [ ] T036 [US3] Create MCP handler for start_coverage_record tool in src/mcp/handlers.ts
- [ ] T037 [US3] Create MCP handler for end_coverage_record tool in src/mcp/handlers.ts
- [ ] T038 [US3] Register start_coverage_record tool in src/mcp/server.ts with Zod schema
- [ ] T039 [US3] Register end_coverage_record tool in src/mcp/server.ts with Zod schema
- [ ] T040 [US3] Add error handling for invalid recording IDs and missing recordings in src/mcp/handlers.ts
- [ ] T041 [US3] Implement recording cleanup after comparison in src/core/recording/storage.ts
- [ ] T042 [US3] Create integration test in tests/integration/recording.test.ts for full recording workflow
- [ ] T043 [US3] Create integration test for concurrent recordings in tests/integration/concurrent-recordings.test.ts

**Checkpoint**: All core user stories (US1, US2, US3) should now be independently functional

---

## Phase 6: User Story 4 - Receive Clear Guidance for Command Usage (Priority: P3)

**Goal**: Ensure LLMs can easily discover and use the right coverage command

**Independent Test**: Review command descriptions and verify they clearly indicate purpose and usage

### Implementation for User Story 4

- [ ] T044 [US4] Enhance coverage_summary tool description in src/mcp/server.ts with clear when-to-use guidance
- [ ] T045 [US4] Enhance start_coverage_record tool description in src/mcp/server.ts with workflow examples
- [ ] T046 [US4] Enhance end_coverage_record tool description in src/mcp/server.ts with interpretation guidance
- [ ] T047 [US4] Add detailed parameter descriptions for all tool inputs in src/mcp/server.ts
- [ ] T048 [US4] Add examples to error messages in src/mcp/handlers.ts

**Checkpoint**: All user stories complete - tool is fully usable with great documentation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T049 [P] Add response token optimization in src/mcp/handlers.ts (ensure responses under 300 tokens per file)
- [ ] T050 [P] Add logging to stderr for debugging in src/core/coverage/parser.ts and src/core/recording/storage.ts
- [ ] T051 [P] Implement performance optimization for large LCOV files (50MB target, 5 second parse time) in src/core/coverage/parser.ts
- [ ] T052 Add input validation for all handler parameters in src/mcp/handlers.ts
- [ ] T053 [P] Create README.md with installation and usage instructions
- [ ] T054 Add package.json bin entry for CLI execution (coverage-mcp command)
- [ ] T055 Verify all code passes ESLint with npm run lint
- [ ] T056 Run all integration tests and verify 100% pass rate with npm test
- [ ] T057 Validate quickstart.md examples work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 4): Can start after Foundational - Reuses US1 parser but independently testable
  - US3 (Phase 5): Can start after Foundational - Depends on US1 coverage calculation but independently testable
  - US4 (Phase 6): Can start after US1, US2, US3 are implemented (enhances existing tools)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for all other stories - implements core parsing and calculation
- **User Story 2 (P2)**: Extends US1's calculator but independently testable
- **User Story 3 (P1)**: Uses US1's coverage calculation in snapshots but independently testable
- **User Story 4 (P3)**: Documentation enhancement - no functional dependencies

### Within Each User Story

**US1 Flow**:
- T016, T017 (parser and calculator) can run in parallel
- T018 (path resolver) independent
- T019-T021 (handler and registration) sequential after T016, T017, T018
- T022 (test) after all implementation

**US2 Flow**:
- T023, T024, T025 (coverage functions and matcher) can run in parallel
- T026, T027, T028 (handler extensions) sequential after T023-T025
- T029, T030 (tests) can run in parallel after handlers

**US3 Flow**:
- T031-T035 (storage, snapshot, comparator, ID, temp) can run in parallel
- T036-T039 (handlers and registration) sequential after T031-T035
- T040, T041 (error handling and cleanup) after handlers
- T042, T043 (tests) can run in parallel after all implementation

### Parallel Opportunities

**Phase 1 (Setup)**: T003, T004, T005, T006, T007 can all run in parallel

**Phase 2 (Foundational)**: T009, T010, T011 (types) and T014, T015 (test helpers) can run in parallel

**Phase 3 (US1)**: T016, T017 can run in parallel

**Phase 4 (US2)**: T023, T024, T025 can run in parallel; T029, T030 tests can run in parallel

**Phase 5 (US3)**: T031-T035 can run in parallel (5 tasks); T042, T043 tests can run in parallel

**Phase 7 (Polish)**: T049, T050, T051, T053 can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all core recording components in parallel:
Task: "Implement recording storage manager in src/core/recording/storage.ts"
Task: "Implement coverage snapshot creation in src/core/recording/snapshot.ts"
Task: "Implement coverage comparison logic in src/core/recording/comparator.ts"
Task: "Implement recording ID generation in src/core/recording/id-generator.ts"
Task: "Implement temp directory management in src/core/recording/storage.ts"

# After handlers complete, launch tests in parallel:
Task: "Create integration test in tests/integration/recording.test.ts"
Task: "Create integration test for concurrent recordings in tests/integration/concurrent-recordings.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T015) - CRITICAL foundation
3. Complete Phase 3: User Story 1 (T016-T022)
4. **STOP and VALIDATE**: Test US1 independently with integration test
5. Deploy/demo if ready - agents can now get overall coverage!

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Project structure and types ready
2. **+US1** (Phase 3) → Overall coverage working → MVP DEPLOYED ✅
3. **+US2** (Phase 4) → File-specific coverage added → Enhanced version deployed
4. **+US3** (Phase 5) → Recording/comparison working → Full feature set deployed
5. **+US4** (Phase 6) → Documentation polished → Production-ready
6. **Polish** (Phase 7) → Optimized and validated → Final release

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

- **Developer A**: US1 (Phase 3) - Core coverage functionality
- **Developer B**: US2 (Phase 4) - File-specific coverage (after US1 calculator exists, or coordinate on shared calculator)
- **Developer C**: US3 (Phase 5) - Recording system (can use US1's calculator)

Note: US2 and US3 both extend US1's calculator, so some coordination needed. Alternatively, complete US1 first, then parallelize US2 and US3.

---

## Task Summary

**Total Tasks**: 57

**By Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1): 7 tasks
- Phase 4 (US2): 8 tasks
- Phase 5 (US3): 13 tasks
- Phase 6 (US4): 5 tasks
- Phase 7 (Polish): 9 tasks

**By User Story**:
- US1 (Overall Coverage): 7 tasks
- US2 (File Coverage): 8 tasks
- US3 (Recording): 13 tasks
- US4 (Documentation): 5 tasks
- Setup/Foundation/Polish: 24 tasks

**Parallel Opportunities**: 24 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Can get overall coverage from any LCOV file
- US2: Can get specific file coverage from LCOV file
- US3: Can record, modify, and compare coverage deltas
- US4: Command descriptions are clear and helpful

**MVP Scope**: Phases 1-3 (22 tasks) deliver User Story 1 - agents can get overall project coverage

---

## Notes

- All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with path`
- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Type definitions (types.ts) use TypeScript `type` aliases, not interfaces (per constitution)
- Functions should be short (<20 lines) and focused (per constitution)
- MCP handlers are thin wrappers, core logic in src/core/ (per constitution)
- Integration tests use InMemoryTransport pattern from research.md
- Tests approach in-process entry point, no subprocess testing
- LCOV parser uses @friedemannsommer/lcov-parser (per research.md)
- Recording IDs use crypto.randomUUID (per research.md)
- Temp storage uses os.tmpdir() + fs.mkdtemp() (per research.md)
- Tool names use snake_case (coverage_summary, start_coverage_record, end_coverage_record)
- Error responses include isError flag and helpful messages
- Responses optimized for token efficiency (<300 tokens per file)
- Default LCOV path: ./coverage/lcov.info (per spec.md clarifications)
