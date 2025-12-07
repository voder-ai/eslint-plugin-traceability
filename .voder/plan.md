## NOW

- [ ] Review the req-annotation detection helper around the identified lines to understand which specific branch conditions are currently untested and what observable behaviors those branches are supposed to produce.

## NEXT

- [ ] Design a couple of minimal, behavior-focused Jest test cases that exercise the currently uncovered branch paths in the req-annotation detection helper, using the existing mocking and helper utilities as a model.
- [ ] Add the new tests to the appropriate req-annotation detection test file, including file-level and test-level traceability annotations that reference the correct story and requirement IDs.
- [ ] Review the updated coverage information for the req-annotation detection helper to confirm that the branches around those lines are now exercised by tests.
- [ ] If coverage still shows any remaining uncovered logic at those lines, refine or add additional small tests until all meaningful paths through that branch are covered.
- [ ] Update the corresponding story document (and any linked requirement descriptions) to note that these edge-case detection paths are now backed by explicit tests, keeping the story’s acceptance criteria in sync with the implementation.

## LATER

- [ ] Scan coverage reports for other minor uncovered branches in core helper modules and plan similar small test additions to close those gaps incrementally.
- [ ] Standardize the use of @supports annotations in any remaining legacy test files that still only use @story/@req, aligning them with the preferred traceability format.
- [ ] Revisit the else-if single-line annotation support story to design and implement the missing behavior and tests once the current req-annotation detection coverage work is complete.
