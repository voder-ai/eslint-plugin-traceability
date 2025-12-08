## NOW

- [ ] Design and add new unit tests that exercise the currently uncovered branches in the annotation scope analyzer utility so that the logic around scope pair computation for those cases is fully covered.

## NEXT

- [ ] Review the updated tests alongside the annotation scope analyzer implementation to confirm that each previously uncovered branch now has a clear, behavior-focused test scenario associated with it.
- [ ] Align the new tests with the relevant development story by adding appropriate traceability annotations and ensuring test names clearly describe the requirements they validate.
- [ ] Run through the existing coverage information conceptually to identify any remaining low-coverage logic in the annotation scope analyzer and add additional targeted tests if necessary to close those gaps.

## LATER

- [ ] Evaluate whether the annotation scope analyzer’s internal structure can be simplified or better modularized now that coverage is stronger, performing small, safe refactors without changing behavior.
- [ ] Look for similar partially covered helpers or utilities in the rules codebase and plan incremental test additions to raise their branch coverage as well.
- [ ] Consider adding a brief note in the internal docs describing the annotation scope analyzer’s responsibilities and the key edge cases covered by tests, to guide future contributors.
