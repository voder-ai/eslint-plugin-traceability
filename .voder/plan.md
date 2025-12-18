## NOW

- [ ] Implement inside-brace placement support in the function-level story-annotation rule so that, when configured for inside placement, it considers the first comment-only lines inside function and method bodies as satisfying the required story annotation while preserving the existing before-function behavior as the default, and add unit tests that prove both placement modes work for functions and methods in that rule.

## NEXT

- [ ] Extend the unified traceability rule so that, when configured to use inside placement, it applies the same inside-brace semantics to function and method bodies via the function-level rules, and add integration tests showing consistent behavior across branches and functions.
- [ ] Update the main plugin README, API reference, and migration guide to document the unified annotation placement behavior for both branches and functions, including before-versus-inside examples for functions and a recommended migration path.
- [ ] Enhance the diagnostics for placement-related violations in the branch and function rules so that, when inside placement is enabled and only before-brace annotations are present, the messages explicitly explain that those annotations are being ignored and indicate that the annotation must move to the first comment-only line inside the block or function body, with updated tests asserting on the new wording.
- [ ] After releasing a version that includes the completed inside-brace placement behavior and updated documentation, close GitHub issue #7 with a comment referencing the release version that delivered the fix and update Story 028.0 to mark all acceptance criteria as complete and to list the key tests that enforce the new behavior.

## LATER

- [ ] Add broader integration tests that lint mixed projects containing both before-brace and inside-brace annotations across multiple files, branch types, and functions under both placement modes to ensure predictable behavior during partial migrations.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates both branch and function annotations from before-brace to inside-brace placement using the same safety rules as the ESLint autofix behavior, and document a recommended workflow for running it on large repositories.
- [ ] Iterate on the wording and editor-facing quick-fix suggestions for placement violations so that inline messages, code actions, and tooltips encourage the inside-brace standard without overwhelming users in common IDEs.
