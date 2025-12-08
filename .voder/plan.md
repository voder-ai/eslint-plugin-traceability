## NOW

- [ ] Align the documentation for the no-redundant-annotation rule with its actual behavior in the recommended and strict presets so that users see an accurate description of whether it is enabled by default and at what severity.

## NEXT

- [ ] Update the migration guide text about inline @story and @req line comments so that it accurately reflects the current implementation and autofix behavior of the prefer-supports-annotation rule, including simple line-comment migration cases.
- [ ] Review the test suite for named helper functions that lack @supports traceability annotations and add minimal JSDoc traceability blocks to bring tests in line with the strict traceability standard.
- [ ] Refine user-facing preset documentation (README and traceability overview) to include a concise summary of which rules and severities are active in the recommended and strict configs, noting explicitly whether strict currently differs from recommended.
- [ ] Tighten test isolation by restoring any modified environment variables or global state (for example, NODE_PATH in CLI error-handling tests) after each suite runs, ensuring no hidden cross-test coupling.

## LATER

- [ ] Extend internal development documentation (ADRs and relevant docs/stories) to describe the unified require-traceability rule, its legacy aliases, and the @supports-first migration model so future maintainers can safely evolve them.
- [ ] Incrementally enable this plugin’s own traceability rules in its ESLint configuration for src and tests, adding targeted suppressions where necessary, so the project fully dogfoods the traceability enforcement it provides to users.
- [ ] Periodically revisit and refine user-facing docs as new traceability features or rules are added, keeping the README, API reference, examples, migration guide, and overview in sync with current behavior and presets.
- [ ] Optionally adjust performance-test timing thresholds or scenarios if future CI runs show they are close to the limits, keeping tests both fast and robust across different CI environments.
