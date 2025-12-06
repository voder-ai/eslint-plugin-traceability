## NOW

- [ ] Design and add focused unit tests for the catch-annotation position helper so that all currently uncovered branches around CatchClause detection and position priority are executed and their behavior is verified against the Story 025 requirements.

## NEXT

- [ ] Review the new catch-annotation position tests to ensure they clearly express the intended CatchClause behavior, include the correct story and requirement traceability annotations, and follow the existing test naming and structure conventions.
- [ ] Compare the actual behavior exercised by the new tests with the acceptance criteria in the CatchClause story and, if any mismatches are found, refine the helper implementation to align with the dual-position and fallback rules without breaking existing branch-annotation behavior.
- [ ] Re-run the broader branch-annotation rule tests conceptually to confirm that the updated helper and tests preserve existing semantics for other branch types while improving CatchClause support.

## LATER

- [ ] Extend or update the branch-annotation rule documentation to describe the supported CatchClause annotation positions, including how they interact with formatters like Prettier, and link to the new tests as implementation references in the story file.
- [ ] Identify any remaining low-coverage or untested edge cases in the catch-annotation position helper and related branch-annotation utilities and add small, focused tests to cover them.
- [ ] Once the implementation and tests are stable, update the CatchClause story’s acceptance criteria and Definition of Done sections to mark them as satisfied and to document the relevant helper and test files.
