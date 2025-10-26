# LCOV Format Reference Guide

This guide explains the LCOV trace file format shortcuts used throughout the codebase.

## Record Structure

Each file's coverage information is contained between `SF:` and `end_of_record` markers.

## Common LCOV Shortcuts

### File Information
- **`TN:`** - Test Name: Name of the test that generated this coverage data (often empty)
- **`SF:`** - Source File: Path to the source file being measured

### Line Coverage
- **`DA:`** - Data: Line execution data in format `DA:line_number,hit_count`
  - `line_number`: The line number in the source file
  - `hit_count`: Number of times this line was executed (0 = not covered)
- **`LF:`** - Lines Found: Total number of instrumented lines in the file
- **`LH:`** - Lines Hit: Number of lines that were executed at least once

### Function Coverage
- **`FN:`** - Function: Function definition in format `FN:line_number,function_name`
- **`FNDA:`** - Function Data: Function execution data in format `FNDA:hit_count,function_name`
- **`FNF:`** - Functions Found: Total number of functions in the file
- **`FNH:`** - Functions Hit: Number of functions that were executed

### Branch Coverage
- **`BRDA:`** - Branch Data: Branch execution data in format `BRDA:line,block,branch,taken`
  - `line`: Line number where the branch occurs
  - `block`: Block number
  - `branch`: Branch number within the block
  - `taken`: Number of times taken, or `-` if not taken
- **`BRF:`** - Branches Found: Total number of branches in the file
- **`BRH:`** - Branches Hit: Number of branches that were taken

### Record Terminator
- **`end_of_record`** - Marks the end of a file's coverage data

## Example

```lcov
TN:
SF:/path/to/file.js
FN:5,myFunction
FNDA:10,myFunction
FNF:1
FNH:1
DA:1,5
DA:2,5
DA:3,0
DA:4,5
LF:4
LH:3
BRDA:2,0,0,3
BRDA:2,0,1,2
BRF:2
BRH:2
end_of_record
```

This example shows:
- File `/path/to/file.js` with one function `myFunction` called 10 times
- 4 lines total, 3 covered (line 3 was not executed)
- 2 branches total, both taken
