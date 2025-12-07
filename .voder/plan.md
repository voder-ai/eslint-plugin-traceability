## NOW

- [ ] Review the dogfooding validation integration test file to understand which specific branches around the targeted lines are currently untested and what behaviors those branches are intended to handle.

## NEXT

- [ ] Identify concrete dogfooding scenarios that will exercise each currently uncovered branch, such as different rule enablement combinations or error conditions, and sketch the corresponding test cases in terms of inputs and expected outcomes.
- [ ] Extend the dogfooding validation integration test with new test cases that cover those scenarios, making sure each new test clearly documents the requirement it supports and keeps existing behavior unchanged.
- [ ] Run the full test suite conceptually against the updated tests to verify that all new scenarios pass and that the previously uncovered branches are now exercised without introducing regressions.
- [ ] Refine any supporting fixtures or helper utilities used by the dogfooding tests if needed to keep them simple, deterministic, and aligned with the documented dogfooding requirements.

## LATER

- [ ] Perform a brief coverage-oriented review of the test suite to confirm that the new dogfooding tests have meaningfully increased branch coverage and to spot any remaining high-value gaps.
- [ ] Update internal development documentation, if appropriate, to note the strengthened dogfooding coverage and describe the patterns used to add integration tests for new requirements.
- [ ] Look for other complex integration paths related to dogfooding or traceability enforcement where similarly targeted tests could further improve confidence and observable behavior coverage.
