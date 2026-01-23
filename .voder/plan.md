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

### Rule 3: valid-req-reference (Requirement ID Validation) ✅ COMPLETE
- [x] Enable `traceability/valid-req-reference` at `error` for `src/**` and `tests/**`
- [x] Run linter to identify all files with malformed requirement IDs
- [x] Add `/* eslint-disable traceability/valid-req-reference */` to top of each violating file (65 files, 441 errors)
- [x] Commit: "chore(lint): enable valid-req-reference with baseline suppressions"

**CRITICAL DOGFOODING PRINCIPLE**: If a plugin bug is discovered during this process:
1. **STOP** suppressing the file
2. **INVESTIGATE** the bug with proper root cause analysis (5 Whys methodology)
3. **FIX** the bug in the plugin code
4. **TEST** the fix thoroughly with new test cases
5. **DOCUMENT** the bug discovery and fix in commit messages
6. **RESUME** cleanup of the file once plugin is working correctly

Bugs are valuable discoveries that improve the plugin - they must be fixed, not worked around.

- [x] **FALSE ALARM RESOLVED**: Initially thought valid-req-reference rule failed with @supports format, but file was already clean and suppression was unused
- [x] For each suppressed file (one at a time, 65/65 complete):
  - [x] src/maintenance/index.ts, batch.ts, utils.ts, cli.ts, report.ts, detect.ts, commands.ts, flags.ts - Fixed REQ-MAINT-* fake IDs (8 files)
  - [x] src/utils/comment-text-helpers.ts - Removed unused suppression
  - [x] src/utils/branch-validation.ts - Fixed REQ-TRACEABILITY-* fake IDs
  - [x] src/utils/reqAnnotationDetection.ts - Removed unused suppression (file was already clean)
  - [x] src/utils/branch-annotation-helpers.ts - Fixed REQ-DUAL-POSITION-DETECTION and removed REQ-TRACEABILITY-FIX-* fake IDs
  - [x] src/utils/branch-annotation-report-helpers.ts - Fixed REQ-DUAL-POSITION-DETECTION suffix
  - [x] src/index.ts - Removed REQ-MAINTENANCE-API-EXPORT, REQ-RULE-LIST, REQ-DYNAMIC-LOADING; fixed REQ-ERROR-HANDLING and REQ-PLUGIN-STRUCTURE story paths; converted multi-story annotation to @supports format
  - [x] src/rules/require-req-annotation.ts - Removed REQ-CREATE-HOOK (ESLint implementation detail)
  - [x] tests/config/eslint-config-validation.test.ts - Removed suppression, replaced fake REQ-CONFIG-VALIDATION with REQ-RULE-OPTIONS
  - [x] tests/plugin-default-export-and-configs.test.ts - Removed suppression and rewrote header to @supports-only with valid REQ IDs
  - [x] tests/integration/catch-annotation-prettier.integration.test.ts - Removed suppression and mapped fake REQ IDs to REQ-DUAL-POSITION-DETECTION / REQ-FALLBACK-LOGIC
  - [x] src/rules/valid-story-reference.ts - Removed suppression; fixed wrong-story and invalid requirement references
  - [x] src/rules/no-redundant-annotation.ts - Removed suppression; fixed invalid Story 027 requirement references
  - [x] src/rules/require-story-annotation.ts - Removed suppression; replaced placeholder requirement IDs with real story-scoped requirements
  - [x] src/rules/valid-req-reference.ts - Removed suppression; aligned rule docs to real requirements (Stories 006/007/010)
- [x] Verify no files remain with suppressions for this rule (confirmed: no `eslint-disable traceability/valid-req-reference` remains)

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

**Result**: Rule 3 complete! All baseline suppressions removed and all `REQ-*` references are now validated against real story requirements.

## NEXT

### Rule 4: require-traceability (Function-Level Annotations) ✅ COMPLETE
- [x] Enable `traceability/require-traceability` at `error` for `src/**` only (exclude tests)
- [x] Run linter to identify all source files with missing function annotations
- [x] Add `/* eslint-disable traceability/require-traceability */` to top of each violating file (baseline)
- [x] Commit: "chore(lint): enable require-traceability for src/ with file suppressions"
- [x] Ratchet down suppressed files (one at a time, one commit per file):
  - [x] src/utils/branch-annotation-catch-helpers.ts
  - [x] src/utils/branch-annotation-story-fix-helpers.ts
  - [x] src/rules/require-traceability.ts
  - [x] src/rules/require-req-annotation.ts
  - [x] src/rules/require-story-annotation.ts
  - [x] src/rules/helpers/prefer-implements-inline.ts
  - [x] src/utils/annotation-checker.ts
  - [x] src/rules/helpers/require-story-visitors.ts
  - [x] src/utils/branch-annotation-if-helpers.ts
  - [x] src/utils/branch-annotation-indent-helpers.ts
  - [x] src/utils/branch-annotation-report-helpers.ts
  - [x] src/utils/branch-annotation-helpers.ts
  - [x] src/rules/helpers/require-story-core.ts
  - [x] src/rules/valid-story-reference.ts
  - [x] src/rules/valid-annotation-format.ts
  - [x] src/index.ts
  - [x] Remaining suppressed src/** files: 0

**Result**: Rule 4 complete for `src/**` with the full pre-push pipeline green. One follow-up fix commit was required to restore TypeScript narrowing for the alias wiring after the initial `src/index.ts` ratchet push was blocked by `npm run build`.

**Workflow constraints**:
- One file per commit
- Run targeted ESLint + targeted Jest before commit
- NEVER invent REQ IDs (only link to existing story requirements)
- `.voder/plan.md` stays uncommitted

### Rule 4: require-traceability (Function-Level Annotations) — tests/** ✅ COMPLETE
- **Progress**: 32 ratcheted files complete; 71 total `tests/**` JS/TS files; 0 suppressed files remaining.
- [x] Extend `traceability/require-traceability` to `tests/**` in `eslint.config.js`
- [x] Baseline failing test files with file-level suppressions to keep lint green
- [x] Push baseline and confirm full pre-push CI-equivalent pipeline is green
- [x] Ratchet down suppressed test files (one at a time, one commit per file):
  - [x] tests/integration/require-traceability-aliases.integration.test.ts
  - [x] tests/utils/ts-language-options.ts
  - [x] tests/utils/fsTestHelpers.ts
  - [x] tests/integration/prettier-test-helpers.ts
  - [x] tests/utils/ioTestHelpers.ts
  - [x] tests/utils/require-story-core-test-helpers.ts
  - [x] tests/utils/branch-annotation-catch-position.test.ts
  - [x] tests/utils/branch-annotation-else-if-position.test.ts
  - [x] tests/utils/annotation-checker.test.ts
  - [x] tests/config/flat-config-presets-integration.test.ts
  - [x] tests/integration/no-redundant-annotation.integration.test.ts
  - [x] tests/integration/else-if-annotation-prettier.integration.test.ts
  - [x] tests/integration/catch-annotation-prettier.integration.test.ts
  - [x] tests/integration/annotation-placement-inside-prettier.integration.test.ts
  - [x] tests/integration/require-traceability-test-callbacks.integration.test.ts
  - [x] tests/integration/cli-integration.test.ts
  - [x] tests/rules/error-reporting.test.ts
  - [x] tests/utils/req-annotation-detection.test.ts
  - [x] tests/rules/no-redundant-annotation.test.ts
  - [x] tests/rules/require-story-visitors-edgecases.test.ts
  - [x] tests/rules/require-story-io.edgecases.test.ts
  - [x] tests/rules/require-story-io-behavior.test.ts
  - [x] tests/rules/require-story-core.test.ts
  - [x] tests/rules/require-story-core.autofix.test.ts
  - [x] tests/rules/require-story-helpers.test.ts
  - [x] tests/rules/require-story-helpers-edgecases.test.ts
  - [x] tests/rules/valid-story-reference.test.ts
  - [x] tests/rules/valid-annotation-format.test.ts
  - [x] tests/perf/valid-annotation-format-large-file.test.ts
  - [x] tests/perf/maintenance-large-workspace.test.ts
  - [x] tests/perf/maintenance-cli-large-workspace.test.ts
  - [x] tests/perf/require-branch-annotation-large-file.test.ts
  - [x] Continue through remaining suppressed `tests/**` files (0 remaining)

### Next recommended work
- [x] Continue the tests/** ratchet until all `traceability/require-traceability` suppressions are removed.
- [ ] After Rule 4 is clean for tests/**, begin Rule 6 (test-level traceability) one test file at a time.

### Rule 5: require-branch-annotation (Branch-Level Annotations)
- **Scope**: `src/**/*.{ts,tsx}` only (tests unaffected)
- **Baseline**: 52 violating files were suppressed to keep lint green.
- **Placement default**: `annotationPlacement` now defaults to `"inside"` (first contiguous comment-only lines inside the branch block body). `"before"` remains supported as a legacy opt-in.
- **Ratchet progress**: 20/52 files cleaned; 32 suppressed files remaining.

- [x] Enable `traceability/require-branch-annotation` at `error` for `src/**` only
- [x] Run linter to identify all source files with missing branch annotations
- [x] Add `/* eslint-disable traceability/require-branch-annotation */` to top of each violating file (baseline)
- [x] Commit and push baseline suppressions (keep CI green)
- [x] Make `"inside"` placement the default and push (required for removing per-file overrides and aligning with formatter behavior)

- [ ] Ratchet down suppressed files (one at a time, one commit per file):
  - [x] src/utils/branch-annotation-story-fix-helpers.ts
  - [x] src/utils/branch-annotation-loop-helpers.ts
  - [x] src/rules/helpers/valid-annotation-utils.ts
  - [x] src/rules/helpers/valid-story-reference-helpers.ts
  - [x] src/utils/comment-text-helpers.ts
  - [x] src/utils/reqAnnotationDetection.ts
  - [x] src/maintenance/storyParser.ts
  - [x] src/maintenance/report.ts
  - [x] src/maintenance/utils.ts
  - [x] src/maintenance/batch.ts
  - [x] src/maintenance/cli.ts
  - [x] src/maintenance/update.ts
  - [x] src/rules/helpers/require-story-name-extraction.ts
  - [x] src/rules/helpers/require-story-comment-detection.ts
  - [x] src/rules/helpers/require-story-node-utils.ts
  - [x] src/maintenance/detect.ts
  - [x] src/maintenance/commands.ts
  - [x] src/utils/annotation-checker.ts
  - [x] src/rules/helpers/require-story-utils.ts
  - [x] src/rules/helpers/require-story-io.ts
  - [ ] Remaining suppressed src/** files: 32

**Workflow constraints**:
- One file per commit
- Prefer inside-block placement: `@supports docs/stories/... REQ-...` as the first contiguous comment-only lines inside the branch block body
- Run `npm run lint -- --max-warnings=0` and at least a focused Jest suite before commit; push to run full CI-equivalent pipeline
- Keep `.voder/**` changes uncommitted

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
