## NOW

- [ ] Add a new no-redundant-annotation test case that encodes the try/if/else-if/catch scenario from story 027.0 and verifies that the catch block’s traceability annotation is not reported as redundant, tagging the test with the appropriate story and requirement IDs.

## NEXT

- [ ] If the new test fails, adjust the redundant-annotation rule and its scope-analysis helpers so that catch blocks are treated as separate execution paths and the test passes without introducing false negatives for other redundancy scenarios.
- [ ] Update the story file for 027.0-DEV-REDUNDANT-ANNOTATION-DETECTION to mark the catch-block handling acceptance criterion and any related Definition of Done items as complete, explicitly referencing the new test as evidence.
- [ ] Add an integration-level scenario that runs the redundant-annotation rule over a small file containing the same try/if/else-if/catch pattern and confirms no redundantAnnotation diagnostics are produced in that full-file context.

## LATER

- [ ] Review the redundant-annotation tests to see if there are other complex control-flow patterns (e.g., nested try/finally or multiple catch clauses) that should be covered explicitly to prevent similar regressions.
- [ ] Consider adding a short note to the migration guide or rule documentation clarifying that catch blocks are treated as separate execution paths and will not have their annotations stripped as redundant when they intentionally repeat a requirement for error handling paths.
