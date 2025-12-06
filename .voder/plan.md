## NOW

- [ ] Review the annotation validation story’s acceptance criteria to identify which specific behaviors and edge cases in that story are still unimplemented or insufficiently covered by existing annotation-validation rules and tests.

## NEXT

- [ ] Map each uncovered or incomplete acceptance criterion from the annotation validation story to the existing rules and helpers, deciding whether they need new logic, configuration, or only additional tests.
- [ ] Implement any missing or incomplete validation behavior in the relevant annotation-validation rule helpers so they fully satisfy the story’s specified requirements and edge cases.
- [ ] Extend or adjust the unit and integration tests for the annotation-validation rules so that each acceptance criterion from the story is explicitly exercised and verified.
- [ ] Update traceability annotations in the affected source and test files to reference the annotation validation story and its requirement IDs, ensuring the new or changed behavior is clearly linked to the documented requirements.
- [ ] Revise the annotation validation story document to mark the now-completed acceptance criteria and definition-of-done items as satisfied, adding implementation links to the relevant code and test files.

## LATER

- [ ] Perform a cross-story review of all annotation-related stories to ensure their validation behaviors are consistent and no conflicting requirements exist between them.
- [ ] Add higher-level integration tests that run the full set of annotation-validation rules together on representative example projects to detect any unexpected interactions or gaps.
- [ ] Consider adding developer-facing documentation that explains how the various annotation-validation rules work together, including examples that align directly with the annotation validation story’s requirements.
