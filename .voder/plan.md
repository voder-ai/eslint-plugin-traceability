## NOW

- [ ] Make else-if and else branches in the branch-annotation rule honor the annotationPlacement option by requiring inside-block annotations when inside placement is selected, treating before-else annotations as missing in that mode, and adding unit and rule tests that confirm both valid and invalid else-if/else scenarios under inside and default placement.

## NEXT

- [ ] Extend the branch-annotation helpers and rule so that try and finally blocks participate in the annotationPlacement option, enforcing inside-brace annotations in inside mode while preserving existing behavior in the default mode, with dedicated tests for try/finally patterns.
- [ ] Update switch-case handling in the branch-annotation helpers and rule to support the inside-brace placement standard for cases where a block body exists, including tests that cover single cases, grouped fallthrough, and default branches under both placement modes.
- [ ] Refine the branch-annotation rule’s autofix logic in inside placement mode so that, for supported branch types, existing before-brace annotations are relocated to the first line inside the block rather than duplicated, with tests verifying correct indentation and that ambiguous or risky patterns are reported without auto-migration.
- [ ] Augment the no-redundant-annotation rule’s tests and implementation so that branch annotations placed inside blocks under inside placement are explicitly treated as non-redundant where intended and do not introduce new false positives across existing redundancy scenarios.
- [ ] Add integration tests that run the plugin with annotationPlacement set to inside on code formatted by Prettier for catch, else-if, loop, and switch constructs, confirming that inside-brace annotations remain valid and that lint results match the placement rules.
- [ ] Update the user-facing API reference, examples, and migration guide to document the annotationPlacement option, the inside-brace standard across branch types, and a recommended migration path with before/after code samples for if/else, catch, loop, and switch blocks.
- [ ] After releasing the version that fully delivers the inside-brace placement standard, close GitHub issue #7 with a comment referencing that release version and update Story 028.0’s story file to mark all acceptance criteria as completed and link to the key tests.

## LATER

- [ ] Add broader integration tests that lint mixed-mode codebases combining before-brace and inside-brace annotations across multiple files and branch types under both placement modes, ensuring predictable behavior for partially migrated projects.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates branch annotations from before-brace to inside-brace placement based on the same rules as the ESLint autofix behavior, and document a safe workflow for running it on large repositories.
- [ ] Refine diagnostic messages and quick-fix suggestions for placement violations so that editor integrations present clear guidance explaining the inside-brace rule and showing exactly where annotations should be moved under inside placement.
