## NOW

- [ ] Review the redundant-annotation detection story document to extract its acceptance criteria and any explicit “First Action” steps that must guide the implementation of the new rule and utilities.

## NEXT

- [ ] Define the precise behavior and configuration surface of the redundant-annotation detection rule based on the story, including how it should interpret scopes, what counts as redundancy, and how autofix should behave.
- [ ] Add new failing tests that describe the desired behavior for the redundant-annotation detection rule, including unit tests for the rule, tests for the shared annotation-scope utility, and at least one end-to-end integration test that exercises cleanup across multiple files.
- [ ] Introduce a minimal implementation of the redundant-annotation detection rule and its supporting annotation-scope utility that targets the simplest acceptance criteria first, just enough to make the new tests for the basic cases pass.
- [ ] Integrate the new rule into the plugin’s public surface (rule map and any recommended configs), ensuring it is discoverable and behaves consistently with existing traceability rules.
- [ ] Expand the implementation to cover remaining edge cases and acceptance criteria from the story (such as overlaps between file-level and function-level annotations, mixed @story/@supports/@req combinations, and formatter-affected layouts), adjusting tests or adding new ones as needed.
- [ ] Update user-facing and internal documentation to describe the new rule, its options, examples, and limitations, and then mark the story’s DoD/acceptance criteria as satisfied in the story file.

## LATER

- [ ] Assess the performance of redundant-annotation detection on large projects and, if necessary, optimize the annotation-scope utility to avoid repeated traversals or redundant work.
- [ ] Look for opportunities to share or refactor common logic between the new redundant-annotation rule and existing annotation-detection helpers to reduce duplication while keeping the code easy to understand.
- [ ] Add additional examples and troubleshooting notes to the user documentation based on early usage of the new rule, such as clarifying how it behaves with legacy annotations or partially migrated code.
