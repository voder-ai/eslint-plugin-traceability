## NOW

- [ ] Clarify the exact desired behaviors for idempotent auto-fix and single-application of fixes in the auto-fix story by reviewing the Story 008.0 specification and the existing auto-fix behavior tests, and sketching concrete before/after examples that these requirements must satisfy.

## NEXT

- [ ] Design additional test cases that exercise running the relevant auto-fix rules multiple times on the same source file to prove idempotency and to ensure that a single violation cannot produce multiple placeholder annotations, then add these tests to the existing auto-fix behavior test suite for the story.
- [ ] Update the auto-fix implementations in the affected rules and helper utilities so that they satisfy the new idempotency and no-duplicate-fix requirements while preserving all currently tested behavior for other auto-fix scenarios.
- [ ] Refine the new and existing auto-fix tests, if needed, to ensure they clearly document the intended behavior, remain deterministic, and explicitly reference the REQ-AUTOFIX-IDEMPOTENT and REQ-AUTOFIX-SINGLE-APPLICATION requirements from the story.
- [ ] Once the behavior and tests are stable, update the Story 008.0 document to tick the remaining acceptance-criteria checkboxes, add brief implementation notes for the new requirements, and confirm that the Definition of Done is fully met for this story.

## LATER

- [ ] Identify any other stories still marked as incomplete in the functionality assessment and, one by one, repeat the pattern of clarifying remaining requirements, adding focused tests, and adjusting implementations until each story’s Definition of Done is satisfied.
- [ ] After all outstanding stories are completed, perform a cross-check between all story requirements, traceability annotations in the code and tests, and the user-facing documentation to verify that each documented behavior has both an implementation and test coverage, and that no implemented behavior is missing a story reference.
