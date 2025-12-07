## NOW

- [ ] Review the duplicated logic in the branch-annotation helper module around the catch and else-if comment-gathering functions to understand exactly which behaviors are repeated and which are safe candidates for extraction into a shared helper.

## NEXT

- [ ] Identify a minimal, behavior-preserving helper or small set of helpers that can replace the duplicated logic while keeping the existing catch and else-if annotation semantics intact, and sketch how call sites would use them.
- [ ] Refactor the branch-annotation helper module to introduce the new shared helper functionality and update all relevant callers so that the previous duplicated code paths are removed without changing external behavior.
- [ ] Verify that the existing unit, rule, and formatter-integration tests for catch and else-if branch annotations still fully pass and, if needed, add a focused test to cover any subtle branch that was previously only exercised through the duplicated code paths.
- [ ] Confirm that the overall duplication level reported for the helpers has decreased and that the resulting code remains readable and easy to maintain.

## LATER

- [ ] Look for any similar small duplication patterns in other rule helper modules and, where it clearly improves clarity, apply the same style of small, behavior-preserving extractions.
- [ ] Revisit the internal development documentation for branch annotation handling to ensure any newly introduced helpers and their responsibilities are described, making future changes to catch and else-if behavior easier to reason about.
- [ ] As new stories refine or extend branch-annotation behavior, keep duplication in check by preferring small, focused helpers for shared comment-scanning or annotation-detection patterns rather than inlining similar logic in multiple places.
