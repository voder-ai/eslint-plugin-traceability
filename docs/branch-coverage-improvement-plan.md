# Branch Coverage Improvement Plan

This document outlines the strategy for increasing branch coverage in low-coverage helper files.

## Overview

Current branch coverage analysis shows several helper files with missed branches. This document prioritizes them and provides guidance for adding tests.

## Priority Files (User Specified)

### 1. src/index.ts

**Status**: Full file analysis needed  
**Current Coverage**: TBD - need to run coverage on this file specifically

**Next Steps**:

- Run coverage to identify missed branches
- Add tests for error handling in dynamic rule loading
- Test edge cases in rule enumeration

### 2. src/rules/require-traceability.ts

**Status**: Composition rule - test both story and req paths  
**Current Coverage**: TBD

**Test Cases Needed**:

- Test when storyHandler exists but reqHandler doesn't
- Test when reqHandler exists but storyHandler doesn't
- Test when both handlers exist
- Test when neither handler exists
- Test merged message IDs from both rules

### 3. src/rules/helpers/prefer-implements-inline.ts

**Status**: 14 branches with missed paths  
**Priority**: High

**Missed Branches** (from coverage:branches output):

- Branch 1 at 26:26-26:30
- Branch 3 at 46:65-46:71
- Branch 4 at 47:62-49:3
- Branch 5 at 52:46-54:3
- Branch 7 at 60:63-60:69
- Branch 8 at 61:58-63:5
- Branch 12 at 71:22-73:3
- Branch 17 at 108:58-108:64
- Branch 18 at 109:64-111:5
- Branch 19 at 117:-1-118:3
- Branch 21 at 129:55-129:61
- Branch 24 at 140:31-142:3
- Branch 28 at 160:25-162:3
- Branch 34 at 203:5-206:5

**Test Strategy**:

- Review each branch condition
- Create fixtures that trigger each missed path
- Focus on edge cases and error conditions

### 4. src/rules/helpers/require-test-traceability-helpers.ts

**Status**: 21 branches with missed paths  
**Priority**: High

**Missed Branches** (partial list):

- Branch 3 at 52:19-52:44
- Branch 5 at 80:38-80:44
- Branch 6 at 84:29-87:3
- Branch 8 at 110:50-110:56
- Branch 10 at 125:10-125:21
- Branch 12 at 113:36-113:42
- Branch 16 at 154:-1-156:44
- Branch 17 at 157:4-161:1
- And 13 more...

**Test Strategy**:

- Break down into logical sections
- Test each helper function independently
- Add integration tests for combined behavior

### 5. src/utils/function-annotation-helpers.ts

**Status**: Need coverage analysis  
**Priority**: Medium

**Next Steps**:

- Run coverage to identify specific missed branches
- Add unit tests for annotation detection
- Test edge cases with malformed annotations

### 6. src/utils/branch-annotation-switch-helpers.ts

**Status**: Need coverage analysis  
**Priority**: Medium

**Next Steps**:

- Run coverage to identify specific missed branches
- Test switch statement handling
- Test branch annotation placement

## Implementation Strategy

### Phase 1: Analysis (Complete for most files)

- ✅ Ran coverage:branches to identify missed branches
- ✅ Documented missed branches per file
- ⏳ Need analysis for src/index.ts and utility files

### Phase 2: Test Creation (In Progress)

1. **Start with highest priority** (prefer-implements-inline, require-test-traceability-helpers)
2. **Create targeted test files** for each helper if they don't exist
3. **Write tests incrementally**:
   - One branch at a time
   - Verify coverage improves after each test
   - Run `npm run coverage:branches` to track progress

### Phase 3: Verification

1. Run full test suite: `npm test`
2. Run coverage: `npm test -- --coverage`
3. Extract uncovered branches: `npm run coverage:branches`
4. Verify no regressions

## Test File Locations

Create or enhance these test files:

```
tests/rules/
  require-traceability.test.ts          (may need creation)
  helpers/
    prefer-implements-inline.test.ts     (check if exists)
    require-test-traceability-helpers.test.ts (check if exists)

tests/unit/
  index.test.ts                          (for src/index.ts)

tests/utils/
  function-annotation-helpers.test.ts   (check if exists)
  branch-annotation-switch-helpers.test.ts (check if exists)
```

## Coverage Goals

**Target**: Achieve >90% branch coverage for all specified files

**Current Status**:

- prefer-implements-inline.ts: ~70-75% (estimated based on 14 missed branches)
- require-test-traceability-helpers.ts: ~60-65% (estimated based on 21 missed branches)
- Others: TBD

## Resources

- Coverage report: `npm test -- --coverage`
- Branch analysis: `npm run coverage:branches`
- Unit tests only: `npm run test:unit`
- Integration tests: `npm run test:integration`

## Notes

- Focus on **meaningful coverage** - not just hitting branches but testing actual behavior
- Add traceability annotations to new tests
- Document edge cases and why they're being tested
- Use descriptive test names that explain what branch is being covered

---

Last updated: 2026-01-10  
Status: Phase 2 - Ready for incremental test creation
