## NOW

- [ ] Extend the function-level traceability rules so they honor an annotationPlacement option that, when set to "inside", treats the first comment-only lines inside a function body as the required annotation (while keeping the current before-function behavior as the default), and add focused tests proving both placement modes work for functions and integrated require-traceability presets.

## NEXT

- [ ] Update the main plugin README and the relevant user-facing docs (such as the API reference and migration guide) so they describe the unified annotationPlacement behavior across both branch and function blocks, including before/inside examples for functions and a clear migration path.
- [ ] Enhance the diagnostics for placement-related violations in the branch and function rules so that, under inside mode, messages explicitly say that before-brace annotations are being ignored and indicate the expected inside-brace location, with updated tests asserting on the new wording.
- [ ] After releasing a version that includes the completed inside-brace placement behavior and updated documentation, close GitHub issue #7 with a comment referencing that release and update Story 028.0 to mark all acceptance criteria as complete and to list the key tests that enforce the new behavior.

## LATER

- [ ] Add broader integration tests that lint mixed-mode projects combining before-brace and inside-brace annotations across multiple files, branch types, and functions under both placement modes to ensure predictable behavior during staged migrations.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates both branch and function annotations from before-brace to inside-brace placement, using the same safety rules as the ESLint autofix behavior, and document a recommended workflow for running it on large repositories.
- [ ] Iterate on the wording and editor-facing quick-fix suggestions for placement violations so that inline messages, code actions, and tooltips reinforce the inside-brace standard without overwhelming users, especially in popular IDEs.
