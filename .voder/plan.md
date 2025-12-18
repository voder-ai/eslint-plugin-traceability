## NOW

- [ ] Make try and finally branches in the branch-annotation rule honor the annotationPlacement option by enforcing first-line-inside-block annotations when inside placement is selected, while preserving current before-brace behavior for the default mode, and add focused unit and rule tests that cover valid and invalid try/finally patterns under both placement modes.

## NEXT

- [ ] Extend switch-case handling in the branch-annotation helpers and rule so that switch cases and default branches support the inside-brace placement standard when inside placement is selected, including tests for single cases, grouped fallthrough, and default branches under both placement modes.
- [ ] Refine the branch-annotation rule’s autofix behavior in inside placement mode so that, for supported branch types, existing before-brace annotations are moved into the first line inside the block instead of duplicated, with tests confirming correct indentation and that ambiguous situations are reported without automatic migration.
- [ ] Augment the no-redundant-annotation rule’s tests and behavior so that branch annotations placed inside blocks under inside placement are explicitly treated as non-redundant where intended and do not introduce new false positives across existing redundancy scenarios.
- [ ] Add integration tests that run the plugin with annotationPlacement set to inside on code formatted by Prettier for catch, else-if, loop, try/finally, and switch constructs, confirming that inside-brace annotations remain valid and that lint results match the placement rules after formatting.
- [ ] Update the user-facing API reference, examples, and migration guide to document the annotationPlacement option, the inside-brace standard across branch types, and a recommended migration path with before/after code samples for if/else, try/catch/finally, loops, and switch blocks.
- [ ] Once the release containing the completed inside-brace placement standard is published, close GitHub issue #7 with a comment referencing that release version and update Story 028.0’s story file to mark all acceptance criteria as completed and link to the key tests.

## LATER

- [ ] Add broader integration tests that lint mixed-mode codebases combining before-brace and inside-brace annotations across multiple files and branch types under both placement modes, ensuring predictable behavior for partially migrated projects.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates branch annotations from before-brace to inside-brace placement based on the same rules as the ESLint autofix behavior, and document a safe workflow for running it on large repositories.
- [ ] Refine diagnostic messages and quick-fix suggestions for placement violations so that editor integrations present clear guidance explaining the inside-brace rule, explicitly mention when before-brace annotations are ignored in inside mode, and show exactly where annotations should be moved.
