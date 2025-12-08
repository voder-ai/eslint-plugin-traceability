## NOW

- [x] Create or update an internal architecture decision record that clearly documents the unified require-traceability rule, how the legacy alias rule names map to it, and the @supports-first annotation model so future maintainers understand the intended design and migration path.

## NEXT

- [x] Review the existing development story files related to function annotations and supports migration, and add or update a story that narrates the unified rule plus legacy aliases from a feature perspective, including acceptance criteria for how they should behave together.
- [x] Adjust the ESLint configuration for this repository to start dogfooding one of the core traceability rules on src and tests, introducing the rule with targeted suppressions where necessary so that linting still passes while the rule begins enforcing structure.
- [ ] Scan the test and source code for any remaining named functions or significant branches that lack @supports traceability annotations, and add minimal, focused annotations to bring them in line with the stricter standard before enabling further self-dogfooding.
- [ ] Refine the traceability overview and API reference user docs as needed to ensure they stay aligned with the newly formalized ADR and stories, especially around how consumers should choose between unified and legacy rule keys.

## LATER

- [ ] Gradually expand the set of enabled traceability rules in this project’s own ESLint configuration, removing temporary suppressions as violations are fixed so the codebase fully self-enforces its traceability conventions.
- [ ] Periodically review and update user-facing documentation (README, API reference, examples, migration guide, overview) whenever new traceability behaviors or rules are added, keeping them tightly synchronized with actual presets and rule semantics.
- [ ] Monitor performance and stability of the large-workspace maintenance and CLI tests over time, and adjust timing thresholds or scenario sizes if future environments show they are close to the limits while still reliably catching regressions.
- [ ] Document any future changes to the unified rule’s behavior, presets, or aliasing strategy in follow-up architecture decision records so the decision history around traceability enforcement remains clear and discoverable.