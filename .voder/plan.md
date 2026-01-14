## NOW

### Rule 1: valid-annotation-format (Format Validation) ✅ COMPLETE
- [x] Enable `traceability/valid-annotation-format` at `error` for `src/**` and `tests/**`
- [x] Run linter to identify all files with format violations
- [x] Add `/* eslint-disable traceability/valid-annotation-format */` to top of each violating file (baseline)
- [x] Commit and push baseline + plugin fixes (completed in `fix(rules): harden valid-annotation-format parsing`)
- [x] Fix annotation concatenation bug (discovered during dogfooding)
- [x] Remove 14 unused suppressions after bug fix
- [x] Fix remaining 7 suppressed files (one at a time, one commit per file):
  - [x] tests/config/eslint-config-validation.test.ts - Fixed malformed @supports
  - [x] tests/integration/require-traceability-test-callbacks.integration.test.ts - Fixed story path format
  - [x] tests/utils/req-annotation-detection.test.ts - Wrapped @req in prose
  - [x] tests/rules/require-test-traceability.test.ts - Wrapped @supports in prose
  - [x] tests/maintenance/update-isolated.test.ts - Wrapped annotation keywords
  - [x] src/rules/prefer-implements-annotation.ts - Fixed 12 errors (prompts/ refs + prose)
  - [x] src/rules/helpers/valid-annotation-utils.ts - Fixed 131 errors (malformed pipe format)
- [x] Verify no files remain with suppressions for this rule (16/16 files clean, 100%)

**Result**: All 633 tests passing. Discovered and fixed malformed pipe-separated annotation format that wasn't a feature.

### Rule 2: valid-story-reference (Story File Validation)
- [x] Enable `traceability/valid-story-reference` at `error` for `src/**` and `tests/**`
- [x] Run linter to identify all files with broken story references
- [x] Fix plugin bugs (missing @supports support, false positives from prose)
- [x] Add `/* eslint-disable traceability/valid-story-reference */` to top of each violating file (6 files)
- [x] Commit: "chore(lint): add baseline suppressions for valid-story-reference rule"
- [x] For each suppressed file (one at a time, 6/6 complete):
  - [x] src/rules/helpers/valid-annotation-format-validators.ts - fixed template placeholder
  - [x] src/utils/annotation-scope-analyzer.ts - fixed template placeholders  
  - [x] tests/fixtures/stale/example.ts - kept suppression (intentionally invalid for testing)
  - [x] tests/fixtures/update/example.ts - kept suppression (intentionally invalid for testing)
  - [x] tests/integration/require-traceability-test-callbacks.integration.test.ts - corrected story reference
  - [x] tests/rules/no-redundant-annotation.test.ts - kept suppression (TODO test cases with placeholder paths)
- [x] Verify no files remain with suppressions for this rule (3 legitimate suppressions remain: 2 test fixtures + 1 TODO tests)

**Result**: Rule 2 complete! Fixed 2 plugin bugs, corrected 3 src/test files. Remaining suppressions are all intentional.

### Rule 3: valid-req-reference (Requirement ID Validation) 🔄 IN PROGRESS
- [x] Enable `traceability/valid-req-reference` at `error` for `src/**` and `tests/**`
- [x] Run linter to identify all files with malformed requirement IDs
- [x] Add `/* eslint-disable traceability/valid-req-reference */` to top of each violating file (65 files, 441 errors)
- [x] Commit: "chore(lint): enable valid-req-reference with baseline suppressions"
- [ ] For each suppressed file (one at a time, 0/65 complete):
  - [ ] Remove the eslint-disable comment from the file
  - [ ] Fix malformed requirement IDs (add to story files or fix code references)
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "chore(lint): correct requirement IDs in [filename]"
- [ ] Verify no files remain with suppressions for this rule

**Analysis**: 441 validation errors across 65 files. Top issues:
- REQ-MAINT-* variants (SAFE, DETECT, REPORT, VERIFY) - 113 errors - not in story 009
- REQ-AUTOFIX-* variants - 44 errors - missing from relevant stories
- REQ-ERROR-* variants - 31 errors - missing from story 007

**ROOT CAUSE**: Developers created placeholder/fake requirement IDs instead of linking to actual requirements in story files. This is lazy practice that breaks traceability.

**CRITICAL STRATEGY**: Code MUST link to existing requirements in story files:
1. **Fix code to reference correct existing requirements** - Review story files, find the actual requirement that justifies the code, update annotations
2. **Remove unnecessary code** - If no real requirement exists for the code, there's a strong possibility the code is not required and should be removed
3. **Document findings** - Track how many fake IDs were found, how many led to code removal

**NEVER**: Add fake requirements to story files to match fake IDs in code. Requirements drive development, not the other way around.

## NEXT

### Rule 4: require-traceability (Function-Level Annotations)
- [ ] Enable `traceability/require-traceability` at `error` for `src/**` only (exclude tests)
- [ ] Run linter to identify all source files with missing function annotations
- [ ] Add `/* eslint-disable traceability/require-traceability */` to top of each violating file
- [ ] Commit: "chore(lint): enable require-traceability for src/ with file suppressions"
- [ ] For each suppressed file (one at a time):
  - [ ] Remove the eslint-disable comment from the file
  - [ ] Add @story/@req or @supports annotations to all flagged functions
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure annotations are correct
  - [ ] Commit: "feat(traceability): add function annotations in [filename]"
- [ ] Verify no src/ files remain with suppressions for this rule

### Rule 5: require-branch-annotation (Branch-Level Annotations)
- [ ] Enable `traceability/require-branch-annotation` at `error` for `src/**` only
- [ ] Configure to target only critical branches (try/catch, complex if/else)
- [ ] Run linter to identify all source files with missing branch annotations
- [ ] Add `/* eslint-disable traceability/require-branch-annotation */` to top of each violating file
- [ ] Commit: "chore(lint): enable require-branch-annotation for src/ with file suppressions"
- [ ] For each suppressed file (one at a time):
  - [ ] Remove the eslint-disable comment from the file
  - [ ] Add branch annotations to flagged control flow structures
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "feat(traceability): add branch annotations in [filename]"
- [ ] Verify no src/ files remain with suppressions for this rule

### Rule 6: require-test-traceability (Test File Annotations)
- [ ] Enable `traceability/require-test-traceability` at `error` for `tests/**`
- [ ] Run linter to identify all test files with missing traceability
- [ ] Add `/* eslint-disable traceability/require-test-traceability */` to top of each violating file
- [ ] Commit: "chore(lint): enable require-test-traceability with file suppressions"
- [ ] For each suppressed file (one at a time):
  - [ ] Remove the eslint-disable comment from the file
  - [ ] Run `eslint --fix` to generate @supports templates
  - [ ] Fill in real story/requirement references in templates
  - [ ] Add [REQ-XXX] prefixes to test descriptions
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "feat(traceability): add test annotations in [filename]"
- [ ] Verify no test files remain with suppressions for this rule

### Rule 7: no-redundant-annotation (Quality Rule)
- [ ] Enable `traceability/no-redundant-annotation` at `warn` for all files
- [ ] Run linter to identify files with redundant annotations
- [ ] Review auto-fix suggestions carefully for each file
- [ ] For each file with redundant annotations (one at a time):
  - [ ] Apply auto-fix if safe, or manually remove redundancy
  - [ ] Verify traceability still clear after removal
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "refactor(traceability): remove redundant annotations in [filename]"
- [ ] Consider elevating to `error` once all redundancy cleaned up

### Rule 8: prefer-supports-annotation (Migration Helper)
- [ ] Enable `traceability/prefer-supports-annotation` at `warn` for all files
- [ ] Run linter to identify files using legacy @story/@req format
- [ ] Prioritize migration of multi-story code paths first
- [ ] For each file to migrate (one at a time):
  - [ ] Convert @story/@req pairs to @supports format
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "refactor(traceability): migrate to @supports format in [filename]"
- [ ] Once migration complete, consider making it an error

### Final Cleanup and Documentation
- [ ] Remove all remaining traceability rule suppressions (if any)
- [ ] Switch to using plugin's `configs.recommended` preset directly
- [ ] Update CI pipeline to fail builds on any traceability violations
- [ ] Add traceability coverage metrics to CI reports
- [ ] Document dogfooding findings, plugin bugs fixed, and lessons learned
- [ ] Update user documentation with real-world examples from this codebase
- [ ] Create quarterly audit checklist for ongoing traceability maintenance
