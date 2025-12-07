## NOW

- [ ] Review the else-if annotation position story’s Definition of Done (including any First Action steps) to pinpoint the exact behavior and test gaps for single-line else-if support and formatter compatibility that must be implemented to mark the story as complete.

## NEXT

- [ ] Update the branch-annotation helper logic so that annotations on single-line else-if branches without braces are detected and prioritized according to the story’s specified rules, while keeping existing BlockStatement behavior intact.
- [ ] Extend the unit tests for branch-annotation helpers and the require-branch-annotation rule to cover the new single-line else-if scenarios, including both valid annotated cases and missing-annotation cases with correct autofix placement.
- [ ] Adjust or expand the else-if Prettier integration tests so that they are exercised in the regular test flow (or under a clearly documented, acceptable gating condition) and verify that code formatted by Prettier continues to satisfy the updated else-if annotation rules.
- [ ] Re-run the story’s acceptance criteria and Definition of Done checklist, updating the story document to mark the single-line else-if support and Prettier compatibility items as complete once the behavior and tests are in place.

## LATER

- [ ] Refactor the branch-annotation helper module into smaller, responsibility-focused utilities (e.g., generic comment scanning, catch-specific logic, else-if–specific logic) while preserving behavior and traceability annotations.
- [ ] Revisit and, where safe, tighten the linting thresholds for maximum lines per file and per function in the rules and helpers to continue gradually ratcheting code-quality constraints.
- [ ] Identify any remaining untested defensive branches or rare error paths in the core helper modules (including the updated else-if logic) and add targeted characterization tests to lock in their behavior before making further structural refactors.
