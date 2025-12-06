## NOW

- [ ] Review the catch-annotation position story to extract the specific Prettier compatibility acceptance criteria and end-to-end scenarios that still need to be covered by tests.

## NEXT

- [ ] Design one concrete end-to-end test scenario that formats code containing CatchClause annotations with Prettier and then validates it with the plugin, ensuring the annotations remain in a valid position and are recognized correctly.
- [ ] Implement the new end-to-end test using the existing testing patterns, covering at least both before-catch and inside-catch annotation placements after formatting.
- [ ] If needed, add additional end-to-end scenarios to exercise edge cases mentioned in the story, such as empty catch blocks or comments that Prettier may reflow in non-trivial ways.
- [ ] Update the catch-annotation story document to mark the Prettier compatibility and integration-test acceptance criteria as satisfied, linking to the new tests.
- [ ] Review user-facing rule documentation and API docs to ensure they explicitly describe the valid positions for catch annotations and mention their compatibility with common formatters, updating the text where necessary.

## LATER

- [ ] Add similar formatter-integration tests for other branch types covered by related stories (for example, else-if and switch cases) to provide broader evidence of formatter compatibility.
- [ ] Perform a small end-to-end validation pass that runs a full ESLint configuration with the plugin and Prettier on a realistic sample project, confirming that catch-annotation handling and other branch annotations behave correctly together.
- [ ] Revisit the deep validation story to align its higher-level validation pipeline description with the new formatter-aware behavior and any additional integration tests that have been added.
