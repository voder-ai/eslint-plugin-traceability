## NOW

- [ ] Implement inside-brace placement semantics for simple if/else blocks when the branch-annotation rule is configured with the new inside placement mode, so that annotations must appear as the first line inside the block (before any executable code), code with only before-brace annotations is reported as mis-placed for this mode, and unit tests for the branch-annotation helpers and rule are updated to verify both the legacy before-brace behavior and the new inside-only behavior for these simple blocks.

## NEXT

- [ ] Extend the inside-brace placement semantics from simple if/else blocks to catch clauses, else-if chains, and loop constructs, ensuring that all supported branch types enforce annotations on the first line inside their blocks when inside placement is selected and that appropriate error messages describe the expected placement.
- [ ] Add autofix behavior for the branch-annotation rule under inside placement so that existing before-brace annotations on supported branch types are automatically moved to the correct first-line-inside-brace position, with targeted tests verifying correct transformed code and that ambiguous or unsupported patterns are left unchanged but diagnosed clearly.
- [ ] Adjust the redundant-annotation rule so that it treats branch annotations placed as the first line inside a block under the inside placement semantics as non-redundant in the intended cases, and extend its unit and integration tests to cover these scenarios without reintroducing false positives.
- [ ] Add integration and formatting-compatibility tests that run the plugin with the inside placement mode over representative code samples (including catch and else-if patterns) formatted by Prettier, to confirm that the new placement standard remains stable and behaves correctly in real-world formatting setups.
- [ ] Update user-facing documentation (API reference, examples, migration guide) to describe the annotationPlacement option, the default and inside modes, the standardized inside-brace placement rule, and a recommended migration path with clear before/after examples for both branches and catch blocks.
- [ ] After the feature is released, close GitHub issue #7 with a comment referencing the release version that delivers the standardized annotation placement, and update story 028.0 to mark the relevant acceptance criteria and Definition of Done items as completed with links to the implemented tests.

## LATER

- [ ] Add broader integration tests that lint multi-file projects using a mix of before-brace and inside-brace annotations under both placement modes, ensuring the system behaves sensibly in partially migrated codebases.
- [ ] Introduce an optional maintenance CLI capability to bulk-migrate branch annotations from before-brace to inside-brace placement using the same rules as the autofix logic, and document how to run it safely on large repositories.
- [ ] Refine and polish diagnostic messages and quick-fix hints for placement violations so they are especially clear and actionable in common editor integrations, incorporating feedback from developers who adopt the inside placement mode.
