## NOW

- [ ] Implement backtick-aware filtering in the shared comment normalization function so that inline code segments wrapped in backticks are stripped and replaced with spaces before annotation detection, as required by the inline-code ignore story.

## NEXT

- [ ] Create focused unit tests for the comment normalization helper that cover backtick-wrapped annotation tokens, mixed inline-code and real annotations, and multi-line comment scenarios, and annotate these tests with the inline-code ignore story and requirement IDs.
- [ ] Run the existing rule-level tests for annotation parsing and, if necessary, extend them to verify that backtick-wrapped @story/@req/@supports references are ignored while real annotations without backticks are still detected correctly.
- [ ] Update the inline-code ignore story document to mark the relevant acceptance criteria and Definition of Done items as complete, and add a short implementation links section pointing to the normalization helper and its tests.

## LATER

- [ ] Review related user and developer documentation to decide whether to mention inline-code/backtick filtering behavior explicitly and, if so, add a brief explanation and example that matches the implemented behavior.
- [ ] Consider additional edge cases for inline-code handling (such as multiple backtick segments on one line or unusual spacing) and, if they are in scope for the story, extend the normalization logic and tests accordingly.
