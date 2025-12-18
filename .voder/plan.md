## NOW

- [ ] Extend switch-case handling in the branch-annotation helpers and rule so that when inside placement is selected, switch cases and default branches use first-line-inside-block annotations for validation while preserving existing before-branch behavior in the default mode, and add focused unit and rule tests that cover single cases, grouped fallthrough, and default branches under both placement modes.

## NEXT

- [ ] Refine the branch-annotation rule’s autofix behavior in inside placement mode so that, for supported branch types including switch cases, safe scenarios move existing before-brace annotations into the first line inside the block instead of duplicating them, with tests confirming correct indentation and that ambiguous situations are reported without automatic migration.
- [ ] Expand the no-redundant-annotation rule’s tests and, if needed, behavior so that branch annotations placed inside blocks under inside placement are always treated as non-redundant for the intended scopes and do not introduce new false positives across existing redundancy scenarios, including switch and try/catch patterns.
- [ ] Update the user-facing examples and migration guide to document the annotationPlacement option and the inside-brace standard across branch types, adding before-and-after code samples for if/else, try/catch/finally, loops, and switch blocks that show a safe migration path from before-brace to inside-brace annotations.
- [ ] After a release that includes the completed inside-brace placement behavior and documentation, close GitHub issue #7 with a comment referencing the release version and update the Story 028.0 story file to mark all acceptance criteria as completed and link to the key tests that verify the new behavior.

## LATER

- [ ] Add broader integration tests that lint mixed-mode codebases combining before-brace and inside-brace annotations across multiple files and branch types under both placement modes, to confirm predictable behavior for partially migrated projects.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates branch annotations from before-brace to inside-brace placement using the same rules and safety checks as the ESLint autofix behavior, and document a recommended workflow for running it on large repositories.
- [ ] Refine diagnostic messages and quick-fix suggestions for placement violations so that editor integrations clearly explain the inside-brace rule, explicitly mention when before-brace annotations are being ignored in inside mode, and show exactly where annotations should be moved or added.
