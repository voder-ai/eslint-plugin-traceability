## NOW
Add a new CLI integration test for the `require-req-annotation` rule in `tests/integration/plugin-validation.test.ts` by extending the `cliTests` array with a case named “Require Req Annotation CLI (Story 003.0-DEV-FUNCTION-ANNOTATIONS)” that runs ESLint on a file with a function missing `@req` and asserts the nonzero exit code and the expected error message.

## NEXT
- Add a similar CLI integration test for the `require-branch-annotation` rule in the same file (Story 004.0-DEV-BRANCH-ANNOTATIONS).
- Write targeted unit tests in `tests/rules/require-branch-annotation.test.ts` covering `for`/`while` loops and `try/catch` branches that lack annotations to close branch‐coverage gaps.
- Update all RuleTester valid/invalid cases across rule test suites to include descriptive `name` properties for clearer test reporting.

## LATER
- Scaffold and implement unit and integration tests for the upcoming annotation‐format (005.0), file‐reference (006.0), error‐reporting (007.0), and auto‐fix (008.0) rules.
- Develop and test the deep‐validation rule (010.0) with markdown parsing and requirement‐existence checks.
- Gradually ratchet up maintainability rules (e.g. `max‐lines`, `max‐params`) and add performance benchmarks for file‐system caching and markdown parsing.