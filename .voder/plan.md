## NOW

- [ ] Update the ESLint configuration so that this repository begins dogfooding the next traceability rule (for example the valid-story-reference rule) for its own TypeScript sources, in a way that follows the Acceptance Criteria and Definition of Done in Story 023.0-MAINT-DOGFOODING-VALIDATION.

## NEXT

- [ ] Analyze the impact of the newly enabled traceability rule on the existing TypeScript code and tests to identify exactly which files would violate it and why.
- [ ] Decide for each violation whether to fix the underlying code or annotation, or to introduce a minimal, well-documented eslint-disable suppression that is explicitly tied back to Story 023.0 requirements.
- [ ] Extend the existing dogfooding-validation integration test so it also verifies that the newly enabled traceability rule is present in the configuration and exercised by the ESLint CLI on representative TypeScript input.
- [ ] Update the dogfooding-related development documentation to describe the expanded rule set being enforced on this repository, the rationale for the chosen next rule, and how violations and suppressions for it are managed over time.
- [ ] Revisit Story 023.0-MAINT-DOGFOODING-VALIDATION and its related problem document to record which additional acceptance criteria are now satisfied after enabling the second rule and strengthening the validation tests.

## LATER

- [ ] Continue incrementally enabling further traceability rules or the full recommended preset on this repository, repeating the pattern of enablement, violation analysis, targeted fixes or suppressions, and dogfooding-validation test updates for each rule.
- [ ] Broaden dogfooding validation to include additional representative or synthetic workspaces that cover different project layouts and rule combinations, ensuring the plugin behaves correctly across a wider range of real-world scenarios.
- [ ] Improve the failure output for dogfooding validation (both in tests and in CI) so that maintainers can quickly see which files, rules, and requirement IDs caused a failure and what actions are recommended.
- [ ] Document the overall dogfooding-validation strategy, including rule selection order, suppression lifecycle, and how it will evolve as new stories and rules are introduced, in a dedicated architecture decision record.
