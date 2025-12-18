## NOW

- [ ] Extend the branch-annotation rule configuration so it accepts an `annotationPlacement` option (with allowed values and a default matching current behavior) and propagate that option into the internal branch-annotation helper functions without yet changing how annotations are located, so the rule’s runtime behavior remains the same while exposing the new configuration surface required by the story.

## NEXT

- [ ] Add new rule-level tests for the branch-annotation rule that configure `annotationPlacement` with both the default and the new value, verifying that the option is accepted, validated, and wired through without breaking existing annotation detection behavior.
- [ ] Implement the first slice of inside-brace placement behavior for simple `if`/`else` blocks, using the `annotationPlacement` option to require annotations on the first executable line inside the block when set to the new mode, and adjust or add tests to confirm both modes behave as specified in the story.
- [ ] Extend the inside-brace placement behavior to `catch` clauses, `else-if` chains, and loop constructs so that all branch types covered by the story follow the standardized placement rules when `annotationPlacement` selects the new mode, including appropriate error messages that mention the expected placement.
- [ ] Introduce autofix logic that, when `annotationPlacement` requires inside-brace placement, moves annotations from the legacy before-brace location into the correct first-line-inside-brace position for supported branch types, and add tests that verify both the transformed code and that unsupported or ambiguous cases are left unchanged with clear diagnostics.
- [ ] Update the redundant-annotation rule’s behavior and tests, if required by the story, so that it interprets annotations according to the new placement semantics, ensuring that inside-brace annotations on branches are treated consistently and do not reintroduce redundant-annotation false positives.
- [ ] Update user-facing documentation (API reference, examples, migration guide) to describe the `annotationPlacement` option, its defaults, the new standardized inside-brace placement, and the recommended migration path from legacy before-brace annotations, including at least one concrete before/after example for a branch and a catch block.
- [ ] Once the feature is released, close GitHub issue #7 with a comment referencing the release version that implements the standardized annotation placement, then update story 028.0 to mark the relevant acceptance criteria and Definition of Done items as completed, citing the implemented tests as evidence.

## LATER

- [ ] Add additional integration tests that run the ESLint plugin over multi-file projects using both annotation placement modes to ensure there are no regressions in mixed or partially migrated codebases.
- [ ] Consider adding a dedicated maintenance CLI subcommand or option to help projects bulk-migrate existing branch annotations from before-brace to inside-brace placement using the same rules as the autofix logic, and document how to use it safely.
- [ ] Refine diagnostic messages and quick-fix suggestions for placement violations to make them more discoverable in common editor integrations, and incorporate any developer feedback from early adopters of the new placement mode.
