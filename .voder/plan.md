## NOW
Extract the branch‐type validation logic out of `src/rules/require-branch-annotation.ts#create(context)` into a new helper function `validateBranchTypes` in `src/utils/branch-annotation-helpers.ts`, and add JSDoc `@story` and `@req` annotations to it.

## NEXT
- Split the remaining blocks in `create(context)` (e.g. missing‐annotation reporting, unexpected‐annotation reporting) into separate helper functions in `src/utils/branch-annotation-helpers.ts`, each with proper `@story`/`@req` JSDoc.
- Update `src/rules/require-branch-annotation.ts` to call these helpers and remove the inline `eslint-disable-next-line max-lines-per-function`.
- Add unit tests for each new helper in `tests/utils/branch-annotation-helpers.test.ts` covering all edge cases.

## LATER
- Ensure the main `create(context)` stays under the max‐lines threshold; remove any remaining `eslint-disable max-lines-per-function` comments.
- Review cyclomatic complexity for the refactored file and adjust helper boundaries if necessary.
- Document the refactoring approach in an ADR to guide future splits and complexity rules.