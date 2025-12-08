## NOW

- [ ] Review the annotation-checker helper implementation to identify small, safe refactoring opportunities that reduce duplication or complexity without changing its externally observed behavior.

## NEXT

- [ ] Apply a minimal refactor to the annotation-checker helper based on the review, ensuring its behavior remains identical and the existing focused tests still fully pass.
- [ ] Select another shared helper module involved in traceability checks and perform the same kind of branch-coverage review to identify any untested branches or error paths.
- [ ] Design and add targeted tests for the newly identified branches in that helper so its behavior is explicitly covered and easier to maintain.

## LATER

- [ ] Perform a light refactor pass over additional shared helper modules once their behavior is well covered by tests, keeping changes small and behavior-preserving.
- [ ] Draft a short internal guideline or checklist for future helper functions that requires new branches and error paths to be accompanied by dedicated tests when they are introduced.
- [ ] Periodically re-evaluate branch coverage reports for core helpers to ensure that newly added logic remains thoroughly and explicitly tested.
