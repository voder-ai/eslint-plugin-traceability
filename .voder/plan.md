## NOW

- [ ] Add focused unit tests for the else-if branch annotation helpers that exercise both before-else and between-condition annotation positions, their precedence, and the else-if-specific auto-fix insertion behavior, with clear traceability back to the else-if story and its requirement IDs.

## NEXT

- [ ] Refine the else-if Prettier integration tests so they match the actual formatted code patterns in this environment and can run by default without experimental gating while still validating the supported annotation positions.
- [ ] Reconcile the documented acceptance criteria in the else-if story with the behavior currently implemented (including any known limitations), then update the story document to mark satisfied criteria, note any remaining gaps, and add links to the relevant helper, rule, and test files.
- [ ] Update the internal rule documentation and user-facing API reference if needed to reflect any refinements made while tightening tests and story alignment, ensuring there are no discrepancies between docs and actual behavior.

## LATER

- [ ] Broaden formatter-focused integration coverage to other branch types (plain else, nested if/else chains, switch cases) to ensure their annotation positions remain stable under common formatters.
- [ ] Review all branch-annotation stories together (if/else-if/else, catch, switch) to confirm their described behavior is consistent and complete across branch types, adjusting stories or docs where necessary.
- [ ] Add or expand a short developer-oriented guide summarizing the intended annotation positions and autofix behavior for all supported branch types, including how the rule is expected to interact with formatters like Prettier.
- [ ] Once else-if behavior and tests are fully stable, perform a small refactoring pass over the branch-annotation helpers to keep them readable and maintainable, without changing observable behavior.
