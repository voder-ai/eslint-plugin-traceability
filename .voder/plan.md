## NOW

- [ ] Identify the most important uncovered or weakly covered branches in the core rules and helper modules, using the existing branch coverage analysis guidance, and select a small set of concrete branch cases to target for additional tests.

## NEXT

- [ ] Design and add focused tests that exercise the selected uncovered branches in the rules and helpers, ensuring each new test clearly documents the behavior it covers and aligns with the existing traceability conventions.
- [ ] Refine or slightly extend the existing branch coverage analysis helper or its associated documentation so it is easy for maintainers to rerun and interpret branch coverage checks when evolving the rules and helpers.
- [ ] Review the updated coverage results to confirm that the targeted branches are now covered and that overall branch coverage in the rules-and-helpers slice is trending upward without introducing brittle or over-specified tests.
- [ ] Identify one or two safe, incremental opportunities to tighten an existing code-quality or tooling check (such as a modest reduction in allowed cyclomatic complexity for new or recently touched code) that the current codebase already satisfies, and document the change in the relevant decision record.

## LATER

- [ ] Systematically extend branch-coverage improvements beyond the initial rules-and-helpers focus into other important parts of the codebase, such as maintenance and CLI modules, while keeping tests fast and behavior-focused.
- [ ] Introduce lightweight automation or guidance that helps prevent future regressions in branch coverage on critical modules, for example by documenting minimum expectations in internal quality guides or by expanding existing maintenance scripts to highlight newly uncovered hot paths.
- [ ] Revisit the linting and code-quality configuration after these improvements to consider further, carefully justified tightening of thresholds or additional rules, always validating that the existing code passes before adopting any stricter settings. 
