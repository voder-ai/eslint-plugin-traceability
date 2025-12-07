## NOW

- [ ] Revise the internal rule documentation for branch annotations so that the else-if section clearly describes all supported annotation positions, their precedence, and how auto-fix behaves, matching the current else-if implementation and Story 026.0 requirements.

## NEXT

- [ ] Update the user-facing API reference for the branch-annotation rule so that it explains the else-if behavior in user-friendly terms, including the supported annotation positions and Prettier-friendly layout, without exposing internal implementation details.
- [ ] Review the migration guide and add a concise note describing how existing projects should adapt their else-if annotations, if at all, to benefit from the new behavior while avoiding surprises.
- [ ] Revisit the else-if story document to ensure its documentation-related acceptance criteria and Definition of Done items accurately reflect the updated rule docs and migration guidance.

## LATER

- [ ] Expand formatter-focused integration tests to cover additional branch types such as plain else blocks, nested if/else chains, and switch cases to verify annotation stability under common formatters.
- [ ] Review all branch-annotation-related stories together (if/else-if/else, catch, switch) to confirm consistent, complete behavior descriptions across branch types and adjust stories or docs where inconsistencies appear.
- [ ] Create or extend a developer-oriented guide that summarizes intended annotation positions and auto-fix behavior for all supported branch types, including how those behaviors interact with formatters like Prettier.
- [ ] Once else-if and other branch behaviors are fully documented and stable, perform a focused refactoring pass over the branch-annotation helper utilities to keep them small, clear, and easy to maintain without changing observable behavior.
