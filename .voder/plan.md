## NOW

- [ ] Change the branch-annotation rule’s automatic fix for inside placement so that, when a branch already has a before-brace traceability annotation, the fix moves that existing annotation into the first line inside the branch block (with correct indentation) instead of adding a duplicate comment, and add or update tests to verify this migration behavior for if/else, loops, try/catch, and switch cases.

## NEXT

- [ ] Extend the function-level traceability rules so that function blocks participate in the same inside-brace placement standard, allowing the annotationPlacement option to control whether function annotations are expected before the function or as the first line inside the function body, and add focused tests to cover both modes.
- [ ] Enhance the branch-annotation and function-annotation error messages so that placement violations explicitly explain the inside-brace rule, mention when before-brace annotations are being ignored under inside mode, and show the expected annotation location, with updated tests asserting on the new messages.
- [ ] Update the main plugin README and any relevant user-facing docs or examples to describe the annotationPlacement option and the inside-brace standard across branch and function blocks, including short before-and-after code snippets that illustrate a safe migration from before-brace to inside-brace annotations.
- [ ] After publishing a release that includes the completed inside-brace placement behavior and updated documentation, close GitHub issue #7 with a comment referencing the release version and update the Story 028.0 story file to mark all acceptance criteria as complete and to reference the key tests that enforce the new behavior.

## LATER

- [ ] Add broader integration tests that lint mixed-mode codebases combining before-brace and inside-brace annotations across multiple files, branch types, and functions under both placement modes, to confirm predictable behavior for partially migrated projects.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates both branch and function annotations from before-brace to inside-brace placement using the same safety rules as the ESLint autofix behavior, and document a recommended workflow for running it on large repositories.
- [ ] Iterate on diagnostic wording and quick-fix suggestions for placement-related violations to optimize the experience in popular editors, ensuring that inline messages, code actions, and documentation tooltips all reinforce the inside-brace standard without overwhelming users.
