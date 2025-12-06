## NOW

- [ ] Review the Story 025.0 catch-annotation-position story and update its acceptance criteria, definition of done, and implementation links so they accurately reflect the current CatchClause annotation behavior and tests that were recently added.

## NEXT

- [ ] Confirm that the existing CatchClause annotation helpers and tests fully cover all acceptance criteria in Story 025.0, and add or adjust tests if any edge cases or branches are still unverified.
- [ ] Run the existing traceability and rule-level validation logic conceptually against the CatchClause helpers to ensure all new code paths are correctly annotated with the right story and requirement IDs.
- [ ] Scan the remaining story files for any other items that might still be partially implemented or lacking implementation links, and align their status and references with the current code and tests.

## LATER

- [ ] Refine the deprecation messaging and user-facing guidance around the `prefer-implements-annotation` alias based on Story 010.3, ensuring documentation clearly explains the migration path and expected sunset behavior.
- [ ] Add a concise migration example to the user documentation showing how a real project can move from `prefer-implements-annotation` to `prefer-supports-annotation` while relying on the alias during the transition.
- [ ] Review other rules and stories for any similar aliasing or naming-evolution requirements to maintain consistent patterns for deprecations and backward-compatible rule keys across the plugin.
