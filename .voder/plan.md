## NOW
Add `test-results.json` to the `.prettierignore` file.

## NEXT
- Add `test-results.json` to `.gitignore` and run `npm run format:check` to clear formatting errors.
- Refactor `src/rules/require-branch-annotation.ts` to remove the file-wide `eslint-disable max-lines-per-function` suppression—either split the large function into smaller helpers or narrow the disable to the specific block.
- Create unit tests for `src/maintenance/index.ts` in `tests/maintenance/index.test.ts` to cover all exports and edge cases, raising branch coverage above 90%.
- Refactor existing tests to eliminate imperative loops (replace `forEach` with `test.each` or separate `it()` calls) and swap generic data (`foo`, `bar`) for descriptive fixtures.

## LATER
- Configure CI to enforce 90% coverage thresholds for statements, branches, and functions, failing the build if they drop below target.
- Audit other ESLint rules for complexity or function-length violations and refactor as needed.
- Expand integration and end-to-end tests to validate rule configurability via CLI presets and real-world sample repositories.
- Establish a monitoring workflow for code-quality and coverage metrics over time and document regressions or improvements.