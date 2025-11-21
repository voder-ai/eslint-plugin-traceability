## NOW

- [ ] Use read_file to open `docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md` to refresh the exact requirements (especially REQ-MULTILINE-SUPPORT and REQ-ERROR-SPECIFICITY) and examples for annotation validation.

## NEXT

- [ ] Use read_file on `src/rules/valid-annotation-format.ts` to re-verify the current implementation against the refreshed 005.0 story requirements.
- [ ] Use read_file on `tests/rules/valid-annotation-format.test.ts` to understand existing test coverage and pinpoint missing cases for multi-line annotations and specific error messages.
- [ ] Design the concrete parsing and reporting behavior needed in `valid-annotation-format` to support multi-line annotations and more granular error categories while remaining backward compatible with existing single-line annotations.
- [ ] Modify `src/rules/valid-annotation-format.ts` to implement the new behavior (multi-line support and more specific messageIds/messages) according to the design, keeping changes as small and focused as possible.
- [ ] Extend `tests/rules/valid-annotation-format.test.ts` with new test cases that cover multi-line annotations, various specific failure modes, and assert on the new, more specific error messages and messageIds.
- [ ] Update `docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md` (and any relevant rule doc under `docs/rules/`) so that REQ IDs, described behavior, and examples match the updated implementation and tests.

## LATER

- [ ] Identify the other three failing stories from the functionality assessment and, one at a time, repeat the inspect–design–implement–doc-align cycle used for Story 005.0 until each reaches 90%+ alignment.
- [ ] Once all currently failing stories pass, review cross-cutting behaviors (e.g., how annotation parsing is shared between rules) for small refactors that reduce duplication while preserving behavior.
- [ ] After functional coverage across all stories is ≥ 90%, consider adding a small number of characterization tests around complex annotation edge cases to protect future refactors of the validation logic.
