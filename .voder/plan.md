## NOW

- [ ] Design and add focused tests that exercise the currently uncovered conditional branches in the req-annotation detection utility so those specific paths in its logic are executed and verified.

## NEXT

- [ ] Review the new tests to ensure they clearly document the intended behavior of those branches, include proper story and requirement traceability annotations, and fit the existing test structure and naming conventions.
- [ ] Run the surrounding higher-level tests that rely on req-annotation detection to confirm that the added coverage did not change observable behavior and that the new tests meaningfully increase branch coverage for that module.

## LATER

- [ ] Identify any remaining low-coverage conditions in the annotation-detection utilities and add small, focused tests for them to further strengthen confidence in edge-case handling.
- [ ] Revisit the story and decision documents that define req-annotation behavior to ensure they explicitly reference these edge-case branches and, if helpful, add implementation links to the new tests.
