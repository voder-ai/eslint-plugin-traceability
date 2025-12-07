## NOW

- [ ] Design and add new formatter-focused integration tests that exercise else branches and nested if/else chains under a real formatter so that branch annotations for these patterns remain stable and valid after formatting.

## NEXT

- [ ] Review the catch and else-if branch stories together with the new integration tests to confirm they fully describe the intended formatter-aware behavior across if/else/else-if chains and update any story text where gaps or inconsistencies appear.
- [ ] Extend formatter-focused coverage to any remaining branch patterns that interact meaningfully with formatters (such as selected switch-case shapes), ensuring that annotations stay attached to the correct branches after formatting.
- [ ] Create or extend a developer-facing guide that summarizes intended annotation positions and auto-fix behavior for all supported branch types, explicitly calling out how those behaviors interact with common formatters like Prettier.
- [ ] Once the new integration coverage and documentation are in place, perform a focused refactoring pass over the branch-annotation helper utilities to simplify their structure and keep them easy to maintain without altering observable behavior.

## LATER

- [ ] Revisit all branch-annotation-related stories (if/else-if/else, catch, switch, and any loops covered by the rule) as a set to ensure they describe a coherent, complete formatter-aware model, adjusting acceptance criteria or adding implementation links where needed.
- [ ] Assess whether additional edge-case formatter scenarios (for example, very long conditions or unusual code styles produced by other formatters) warrant dedicated tests, and, if so, add minimal targeted cases that keep the suite fast while improving confidence.
- [ ] Periodically re-check the interaction between new formatter versions and the branch-annotation rule to see if formatter changes require updates to test fixtures, documentation, or helper logic, keeping the behavior aligned with real-world tooling.
