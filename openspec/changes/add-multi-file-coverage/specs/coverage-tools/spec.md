## ADDED Requirements

### Requirement: Multi-File Coverage Summary
The system SHALL provide a `coverage_files_summary` tool that accepts a list of file paths and returns coverage information for each file.

#### Scenario: Coverage for multiple specified files
- **WHEN** a list of file paths is provided
- **THEN** the system returns an array of coverage info objects, one per file, each containing:
  - `path`: the file path
  - `linesCoveragePercentage`: percentage of lines covered (0-100)
  - `branchesCoveragePercentage`: percentage of branches covered (0-100)

#### Scenario: Empty file list provided
- **WHEN** an empty array of file paths is provided
- **THEN** the system returns an empty array

#### Scenario: Some files not found in LCOV
- **WHEN** some requested files are not present in the LCOV data
- **THEN** the system returns 0% coverage for those files (consistent with existing `coverage_file_summary` behavior)
