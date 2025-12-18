## NOW

- [x] Extend the inside-brace placement mode to catch clauses by updating the branch-annotation helpers and rule so that, when inside placement is selected, catch blocks require their annotations on the first comment line inside the catch block (ignoring before-catch annotations), auto-fixes insert missing annotations at that inside position, and new unit tests verify both valid and invalid catch-block scenarios under inside placement.

## NEXT

- [ ] Apply the inside-brace placement semantics to loop constructs (for, for-in, for-of, while, do-while) so that, under inside placement, loop annotations must be on the first comment line inside the loop body, with before-loop annotations treated as mis-placed and covered by rule and helper tests.
- [ ] Unify else-if and related branch types (else blocks, try/finally, and switch cases where applicable) under the inside-brace placement standard so that all supported branch forms honor the annotationPlacement option consistently, with clear error messages for mis-placed annotations and comprehensive rule tests for each branch type.
- [ ] Enhance the branch-annotation rule’s autofix behavior in inside placement mode so that, for supported branch types, existing before-brace annotations are migrated into the correct first-line-inside-brace position rather than duplicated, with targeted tests confirming the transformed code and ensuring ambiguous patterns are only reported, not auto-moved.
- [ ] Expand the no-redundant-annotation rule’s tests (and any needed logic) to cover inside-brace branch annotations explicitly, confirming that these annotations are treated as non-redundant in the intended cases and that no new false positives are introduced across the existing scenarios.
- [ ] Add integration tests that run the plugin with annotationPlacement set to inside on representative code samples formatted by Prettier (including catch, else-if, and loop patterns), verifying that the standardized inside-brace placement remains stable and that lint results match the story’s expectations.
- [ ] Update user-facing documentation (API reference, examples, migration guide) to describe the annotationPlacement option, the inside-brace standard across branch types, and a recommended migration path with before/after examples for if/else, catch, and loop blocks.
- [ ] After the release that delivers the completed inside-brace standard, close GitHub issue #7 with a comment referencing that release version and update story 028.0 to mark all acceptance criteria and Definition of Done items as completed with links to the implemented tests.

## LATER

- [ ] Add broader integration tests that lint mixed-mode codebases (combining before-brace and inside-brace annotations across multiple files and branch types) under both placement modes, ensuring predictable behavior in partially migrated projects.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates branch annotations from before-brace to inside-brace placement according to the same rules as the ESLint autofix logic, and document how to run it safely on large repositories.
- [ ] Refine diagnostic messages and quick-fix suggestions for placement violations to be especially clear in common editor integrations, using feedback from early adopters of the inside placement mode to polish wording and guidance.