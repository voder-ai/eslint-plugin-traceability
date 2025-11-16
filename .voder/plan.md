## NOW
Create a new Jest RuleTester unit test file for the first core rule: scaffold `tests/rules/require-story-annotation.test.ts` using ESLint’s `RuleTester` to validate that functions without `@story` annotations produce the correct error message.

## NEXT
- Implement Jest RuleTester tests for each additional rule:
  - `require-req-annotation` (functions missing `@req`)
  - `require-branch-annotation` (if/else, loops, try/catch)
  - `annotation-format` (malformed `@story`/`@req` syntax)
  - `valid-story-reference` (missing or invalid `.story.md` paths)
  - `valid-req-reference` (requirements not found in story files)
- For each rule test file:
  - Write `valid` and `invalid` code snippets with `errors` expectations
  - Use `ts-jest` parser configuration matching `jest.config.js`
  - Cover edge cases (anonymous functions, nested branches, path traversal)
- Commit tests and verify coverage increases; aim for ≥ 90% rule logic coverage.

## LATER
- Add integration tests that load `eslint.config.js` and lint sample code files to assert combined rule behavior and auto-fixes.
- Introduce snapshot tests for auto-fix scenarios (before/after code comparisons).
- Enforce coverage thresholds in CI (e.g., `jest --coverage --coverageThreshold`) to prevent regressions.