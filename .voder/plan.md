## NOW

- [ ] Align the existing ESLint configuration with the first explicit step in the Implementation Notes of the 002.0-DEV-ESLINT-CONFIG story so that the config structure and options fully satisfy that initial requirement.

## NEXT

- [ ] Review the remaining acceptance criteria and Implementation Notes in the 002.0-DEV-ESLINT-CONFIG story to identify which aspects of the ESLint configuration are still missing or partially implemented compared to the current eslint.config.js and related tooling.
- [ ] Implement any additional ESLint configuration changes required by the 002.0-DEV-ESLINT-CONFIG story (such as presets, overrides, or rule groups) so that all of its configuration-related requirements are met without regressing existing behavior.
- [ ] Add or refine automated tests that validate the ESLint configuration against the 002.0-DEV-ESLINT-CONFIG story requirements, including both unit-level config validation tests and, if applicable, integration tests that exercise ESLint using the configured setup.
- [ ] Update the 002.0-DEV-ESLINT-CONFIG story document to mark the now-satisfied acceptance criteria as complete and link them to the concrete configuration and test artifacts that implement them.
- [ ] Review any related ADRs or internal documentation that describe ESLint configuration decisions and adjust them so they accurately reflect the finalized configuration and its alignment with the 002.0-DEV-ESLINT-CONFIG story.

## LATER

- [ ] Extend the ESLint configuration to cover any additional file types, test patterns, or future rule sets that are out of scope for the 002.0-DEV-ESLINT-CONFIG story but align with the project’s longer-term linting strategy.
- [ ] Look for opportunities to simplify or refactor eslint.config.js and its associated helper scripts or presets while preserving all behavior required by both the ESLint configuration story and the dogfooding validation story.
- [ ] Align the dogfooding plan for enabling additional traceability rules with the finalized ESLint configuration so that future rule enablement steps build cleanly on top of the completed 002.0-DEV-ESLINT-CONFIG work.
