## NOW
In `cli-integration.js`, remove the file-wide `/* eslint-disable */` comment and replace it with precise `// eslint-disable-next-line <rule>` comments only for the specific rules that truly cannot pass, so that the rest of the file is fully linted.

## NEXT
- Write Jest unit tests targeting each compiled rule in `lib/src/rules` (require-story-annotation, require-req-annotation, require-branch-annotation) using ESLint’s RuleTester to exercise the built output and drive coverage toward 100%.  
- Update all `describe(…)` blocks in both `tests/` and `lib/tests/` to include the associated story ID and title (e.g. “(Story 003.0-DEV-FUNCTION-ANNOTATIONS)”) for full traceability.  
- Scaffold initial test suites for the upcoming validation rules (annotation-format in story 005, file-reference in 006, error-reporting in 007, and auto-fix in 008) under `tests/rules` and `lib/tests/rules` so that coverage gates can be met as soon as those rules are implemented.

## LATER
- Incrementally enable and configure additional ESLint maintainability rules (e.g. `max-lines`, `max-params`) with a ratcheting plan.  
- Add performance and memory benchmarks for large codebases (particularly markdown parsing) and integrate them into CI.  
- Develop and test maintenance-tooling scripts for story file renames and deep-validation logic (stories 009 and 010), adding corresponding integration tests and documentation.