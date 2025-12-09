## NOW

- [ ] Refactor the most complex helper in the redundant-annotation rule so that its logic is split into smaller, well-named internal functions without changing the rule’s external behavior.

## NEXT

- [ ] Refactor the remaining complex helper in the redundant-annotation rule to use similarly small, focused internal functions while preserving all existing semantics and diagnostics.
- [ ] Review the redundant-annotation rule and its unit tests together to ensure the new helper structure is easy to follow and that each major behavior still has clear, focused test coverage.
- [ ] Identify any gaps in test coverage introduced or revealed by the refactor and add small, targeted tests to cover those specific code paths if needed.

## LATER

- [ ] Apply the same small-step refactoring approach to other oversized rule and utility modules so that long functions and large files are gradually decomposed into clearer helpers.
- [ ] Once the key hotspots are simplified, consider tightening the project’s maximum-lines-per-function or related complexity thresholds to lock in the improvement.
- [ ] Add a short internal documentation note describing the responsibilities of the redundant-annotation rule and its main helpers, including how it uses scope analysis, to guide future contributors working on this area.
