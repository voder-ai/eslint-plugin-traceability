## NOW

- [ ] Use read_file to open `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` to fully refresh the exact requirements and acceptance criteria for function annotations.

## NEXT

- [ ] Use read_file on `src/rules/require-story-annotation.ts` to compare the current rule behavior (node types, messages, locations) against the story’s requirements.
- [ ] Use read_file on `src/rules/helpers/require-story-core.ts` and `src/rules/helpers/require-story-visitors.ts` to see how function-like nodes (including arrow functions) are currently detected and reported.
- [ ] Use read_file on `tests/rules/require-story-annotation.test.ts` (and any related helper tests) to understand the current tested behavior for arrow functions and error messages/locations.
- [ ] Design a minimal change set to align behavior with the story by: (a) excluding ArrowFunctionExpression from the default enforced scope, and (b) changing reporting so the primary diagnostic is attached to the function name identifier and includes the function name in the message text.
- [ ] Modify `require-story-core` / visitor helpers so the default scope excludes arrow functions per the story, while keeping types/tests compiling, and adjust any tests that assume arrow functions are enforced by default.
- [ ] Update the reporting helpers and rule meta messages so the main `missing @story` diagnostic includes the function’s name and uses the identifier location, then update/add Jest tests to assert on message content and error location.
- [ ] Run the existing traceability check and story tests to ensure all `@story` / `req` annotations and the 003.0 story doc remain aligned with the new behavior, updating the story markdown if specific requirement IDs or wording need small tweaks to match the implementation.

## LATER

- [ ] Re-evaluate whether the story’s “single core rule for @story and @req” requirement demands combining `require-story-annotation` and `require-req-annotation` into one rule, or whether the current split is acceptable with clarified documentation; if needed, plan a safe expand–migrate–contract refactor.
- [ ] Once Story 003.0 passes, repeat the same inspect–design–implement–test cycle for the remaining failing stories, one at a time, using traceability and Jest tests to drive each to green.
- [ ] After all stories are passing and functional coverage ≥ 90%, consider small refactors to further simplify the function-annotation helpers (e.g., extracting shared reporter utilities) without changing external behavior.
