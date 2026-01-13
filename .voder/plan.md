## NOW

### Rule 1: valid-annotation-format (Format Validation)
- [x] Enable `traceability/valid-annotation-format` at `error` for `src/**` and `tests/**`
- [x] Run linter to identify all files with format violations
- [x] Add `/* eslint-disable traceability/valid-annotation-format */` to top of each violating file (baseline)
- [x] Commit and push baseline + plugin fixes (completed in `fix(rules): harden valid-annotation-format parsing`)
- [x] Fix annotation concatenation bug (discovered during dogfooding)
- [x] Remove 14 unused suppressions after bug fix
- [ ] For each remaining suppressed file (one at a time, one commit per file):
  - [ ] Remove the `/* eslint-disable traceability/valid-annotation-format */` comment from the file
  - [ ] Fix all `traceability/valid-annotation-format` violations by:
    - Adding story paths to malformed `@supports` annotations (e.g., `@supports REQ-XXX` → `@supports docs/stories/X.story.md REQ-XXX`)
    - Wrapping `@story`/`@req`/`@supports` keywords in prose with backticks
    - Fixing or removing incorrectly parsed annotations
  - [ ] Run `npm run lint` (and optionally `npm test` if the file is non-trivial)
  - [ ] Commit: "chore(lint): remove valid-annotation-format suppression in [filename]"
- [ ] Verify no files remain with suppressions for this rule

**Note**: Files with broken story references (non-existent files) will be addressed in Rule 2 (valid-story-reference), as valid-annotation-format only checks format/syntax, not file existence.

### Rule 2: valid-story-reference (Story File Validation)
- [ ] Enable `traceability/valid-story-reference` at `error` for `src/**` and `tests/**`
- [ ] Run linter to identify all files with broken story references
- [ ] Add `/* eslint-disable traceability/valid-story-reference */` to top of each violating file
- [ ] Commit: "chore(lint): enable valid-story-reference with file suppressions"
- [ ] For each suppressed file (one at a time):
  - [ ] Remove the eslint-disable comment from the file
  - [ ] Fix broken story references (update paths, restore missing files, or fix plugin bugs)
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "chore(lint): correct story references in [filename]"
- [ ] Verify no files remain with suppressions for this rule

### Rule 3: valid-req-reference (Requirement ID Validation)
- [ ] Enable `traceability/valid-req-reference` at `error` for `src/**` and `tests/**`
- [ ] Run linter to identify all files with malformed requirement IDs
- [ ] Add `/* eslint-disable traceability/valid-req-reference */` to top of each violating file
- [ ] Commit: "chore(lint): enable valid-req-reference with file suppressions"
- [ ] For each suppressed file (one at a time):
  - [ ] Remove the eslint-disable comment from the file
  - [ ] Fix malformed requirement IDs (correct format/typos, or fix plugin bugs)
  - [ ] Run linter to verify file now passes
  - [ ] Run all tests to ensure no breakage
  - [ ] Commit: "chore(lint): correct requirement IDs in [filename]"
- [ ] Verify no files remain with suppressions for this rule

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
