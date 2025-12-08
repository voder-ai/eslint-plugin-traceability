## NOW

- [ ] Identify the specific conditional branches and error-handling paths in the traceability annotation helper logic that are not yet exercised by existing tests so we know exactly which behaviors need additional coverage.

## NEXT

- [ ] Design new focused tests that trigger each of the uncovered branches in the annotation helper logic (for example, different missing-annotation scenarios and option combinations) using the existing rules as entry points.
- [ ] Implement the new tests in the appropriate test suite so that each identified branch and error path in the annotation helper is executed and its behavior asserted.
- [ ] Review coverage results conceptually to ensure the mid-section of the annotation helper is now fully covered and that the new tests accurately reflect the documented stories and requirements.

## LATER

- [ ] Refine and, if helpful, lightly refactor the annotation helper to reduce internal duplication or complexity now that its behavior is well covered by tests.
- [ ] Expand similar branch-coverage reviews to other shared helper modules to ensure critical utility logic across the plugin has strong, explicitly tested edge-case coverage.
- [ ] Consider adding a small internal guideline or checklist for future helper functions to ensure new branches are always accompanied by dedicated tests when introduced.
