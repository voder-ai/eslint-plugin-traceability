## NOW

- [ ] Analyze the behavior of the logic around the currently uncovered branches in the annotation scope analyzer so you can determine exactly what scenarios and inputs new tests need to cover for those code paths.

## NEXT

- [ ] Design concrete test cases that exercise each of the identified scenarios for the uncovered branches, focusing on observable behavior and edge conditions rather than internal implementation details.
- [ ] Add the new tests to the existing test suite that covers the annotation scope analyzer, ensuring they follow the project’s traceability conventions with appropriate @supports annotations and requirement IDs in test names.
- [ ] Review the new tests to confirm they are behavior-focused and independent, and that together they exercise all previously uncovered branches in the targeted section of the annotation scope analyzer.
- [ ] Adjust or extend the tests if any branches remain uncovered for legitimate behavioral paths, and explicitly document in code comments where remaining branches are purely defensive guards that are intentionally left untested.

## LATER

- [ ] Look for any other small remaining gaps in coverage for the annotation scope analyzer or closely related helpers and plan similar targeted tests to close them.
- [ ] Document in an internal note or ADR comment how branch coverage for the annotation scope analyzer is validated, so future contributors understand which behaviors are intentionally tested and which guards are intentionally untested.
- [ ] Consider minor refactorings to simplify any overly complex conditional logic in the analyzer once coverage is strong, keeping behavior and existing tests intact while improving readability and maintainability.
