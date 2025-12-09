## NOW

- [ ] Update the function-annotations story file so that it precisely lists the supported test framework callbacks matching the implemented exclusion behavior (including that Vitest bench callbacks are not excluded), and mark all acceptance-criteria and Definition of Done items related to test callback exclusion as completed while leaving the Issue #5 resolution checklist items unchecked.

## NEXT

- [ ] Clarify directly in the function-annotations story that closing the external GitHub issue is an out-of-repo action which must be performed in the real tracker, and that the story’s Issue #5 checklist items should only be marked complete after that external closure has happened.
- [ ] Add a brief note in the function-annotations story summarizing how the excludeTestCallbacks option interacts with the test callback list (default-on behavior, ability to turn it off, and relationship to the separate test-traceability rule).
- [ ] Introduce additional test cases for nested and helper-wrapped test callbacks (for example, callbacks passed through local wrapper functions around it or describe) to document and verify how the exclusion logic behaves in these less common patterns.
- [ ] Extend the function-annotations story’s requirements to cover nested and custom-wrapped callbacks explicitly, and update its acceptance criteria to reference the new tests once they are in place.

## LATER

- [ ] Design and implement configuration support that lets projects supply their own additional test helper names to be treated as excluded callbacks, reflecting this capability in the function-annotations story and ADR 013 once it exists.
- [ ] Expand performance-oriented tests in the function-annotation area (including scenarios with many test files and nested suites) and, if needed, adjust the story’s performance-related acceptance criteria to reflect concrete timing budgets.
- [ ] Once the maintainers have actually closed the real GitHub issue #5 with a version-referenced comment in the external tracker, update the function-annotations story’s Issue #5 resolution checklist items to mark them complete and, if appropriate, add a short note linking the story to the release tag that contained the fix.
