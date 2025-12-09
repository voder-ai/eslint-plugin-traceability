## NOW

- [ ] Rename the test file that currently uses the term "branches" to a behavior-focused name that describes what aspect of the annotation checker it verifies, without changing any of the test cases inside the file.

## NEXT

- [ ] Adjust the performance-oriented maintenance test suites so that each test case operates on its own independently created and cleaned-up workspace, eliminating shared state between tests in the same file.
- [ ] Strengthen the permission-focused test in the maintenance isolation suite so it uses a platform-tolerant assertion pattern that still validates the intended error-handling behavior without depending on fragile filesystem permission semantics.
- [ ] Refactor any non-performance tests that rely on loops or complex conditional logic into smaller, clearer test cases or parameterized test tables so that each test checks a single behavior with minimal internal logic.

## LATER

- [ ] Add a short developer-facing guide that documents the different layers of tests in the project (unit, integration, maintenance CLI, performance) and how to extend them, keeping it aligned with the actual Jest configuration and scripts.
- [ ] Introduce additional targeted tests around edge-case behaviors in the unified traceability rule and maintenance tools if future changes reveal untested branches or error paths.
- [ ] Periodically review new or modified tests to ensure they follow the established patterns of isolation, minimal internal logic, and clear traceability annotations so that the overall quality of the test suite remains high as the project evolves.
