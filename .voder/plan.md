## NOW

- [ ] Revise the core traceability rules’ error messages and auto-fix suggestions so that they present `@supports` as the preferred annotation format while still accepting legacy `@story`/`@req`, aligning the user-facing UX with the migrate-to-supports story requirements.

## NEXT

- [ ] Extend and adjust unit tests for the core traceability rules to assert the updated error messages and suggestion texts that favor `@supports`, ensuring all existing option combinations and edge cases are covered.
- [ ] Update user-facing documentation (README, API reference, and the migrate-to-supports guide) so that examples and narrative treat `@supports` as the primary, recommended annotation style and clearly describe legacy `@story`/`@req` as backward-compatible.
- [ ] Revisit the migrate-to-supports story’s acceptance criteria and Definition of Done, confirm each criterion is now satisfied by implementation and tests, and mark the story as fully complete in the story file.

## LATER

- [ ] Add richer end-to-end examples showing a full workflow for migrating an existing codebase from `@story`/`@req` to `@supports`, including before/after code samples and recommended rule configurations.
- [ ] Introduce additional regression tests for complex or mixed annotation patterns (multiple stories, partial migrations, and multi-line inline comments) to ensure the updated UX and migration behavior remain stable over time.
- [ ] Review other rules and docs in the plugin for any remaining references that implicitly prefer `@story`/`@req` and align them with the `@supports`-first model as long as it does not conflict with backward compatibility guarantees.
