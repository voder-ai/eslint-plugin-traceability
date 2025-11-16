## NOW
Write comprehensive Jest RuleTester unit tests for each compiled rule in `lib/src/rules` (require-story-annotation, require-req-annotation, require-branch-annotation) to exercise the built plugin and drive overall coverage above 90%.

## NEXT
- Update every `describe(…)` block in `tests/` to include the associated story ID and title (e.g. “Require Story Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)”) for full traceability.
- Refactor the CLI integration tests in `cli-integration.js` to use Jest’s `test.each` API, add story IDs to each test name, and consolidate rule invocations.
- Scaffold empty `tests/rules/` (and `lib/tests/rules/`) suites for annotation-format (story 005), file-reference (story 006), error-reporting (story 007), and auto-fix (story 008) so coverage gates are met as soon as those rules ship.

## LATER
- Implement and test the annotation-format validation rule (story 005) and file-reference validation rule (story 006).
- Develop and test the error-reporting rule (story 007) and auto-fix rule (story 008), then deep-validation (story 010).
- Incrementally enable ESLint maintainability rules (e.g. `max-lines`, `max-params`) with a ratcheting plan and add performance/memory benchmarks (markdown parsing, file-system caching) into CI.