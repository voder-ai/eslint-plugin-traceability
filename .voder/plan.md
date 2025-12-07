## NOW

- [ ] Review the existing branch-annotation helper code around the duplicated else-if and catch comment-scanning logic to understand exactly what behavior is shared and decide on a small helper extraction that will remove the duplication without changing observable behavior.

## NEXT

- [ ] Introduce a new focused helper function in the branch-annotation helpers module that encapsulates the shared comment-scanning behavior and update the existing else-if and catch paths to delegate to this helper while preserving all current rules and traceability annotations.
- [ ] Adjust or extend the existing unit tests for branch-annotation helpers and related rules to cover the refactored paths and confirm that behavior remains identical after the duplication is removed.
- [ ] Re-run the internal duplication analysis mentally against the updated helper code to ensure the previously reported duplicated region is eliminated and that the refactor did not introduce new overlapping logic elsewhere.

## LATER

- [ ] Revisit the remaining minor uncovered branches in core helper modules and design similarly small, focused tests to close those coverage gaps.
- [ ] Standardize the use of @supports traceability annotations in any remaining legacy test files that still rely only on @story and @req so they align with the preferred format.
- [ ] Return to the else-if single-line annotation support story and plan the implementation and tests needed to fully satisfy that requirement once the helper refactors and small quality improvements are complete.
