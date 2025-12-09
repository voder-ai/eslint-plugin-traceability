## NOW

- [ ] Analyze the redundant-annotation rule and its existing tests to design specific scenarios that will exercise the currently uncovered decision branches in the redundant-annotation helpers, especially around scope pair collection and statement redundancy decisions.

## NEXT

- [ ] Add new focused test cases to the redundant-annotation rule’s test suite that cover the designed scenarios, ensuring each test is tied to the relevant stories and requirement IDs via annotations and descriptive test names.
- [ ] Verify that the new tests actually exercise the previously uncovered branches in the redundant-annotation helpers and adjust the test inputs or assertions as needed until those branches are fully covered.
- [ ] Review the behavior enforced by the new tests to confirm it still matches the documented semantics for redundant annotations and, if any mismatch is discovered, update either the tests or the documentation so they are aligned.
- [ ] Once the redundant-annotation coverage gaps are closed, quickly scan other recently refactored helper modules for any similarly small uncovered branches that can be addressed with a few targeted tests, and, where appropriate, plan analogous coverage improvements.

## LATER

- [ ] Document a brief internal guideline on how to close coverage gaps safely after refactors, using the redundant-annotation helpers as an example of adding targeted tests without changing behavior.
- [ ] Revisit the no-redundant-annotation rule and its documentation periodically to see whether additional examples, clarifying comments, or minor structural refactors would make its behavior easier to understand for new contributors while keeping tests comprehensive.
- [ ] Add a short section to the main user-facing documentation explaining the overall documentation structure, clearly indicating which files are for end users and which are internal development references, once the current coverage-focused work is complete.
