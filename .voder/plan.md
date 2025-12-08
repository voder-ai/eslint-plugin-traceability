## NOW

- [ ] Implement the next concrete behavior from the migrate-to-supports story by updating the traceability rule logic so that it fully respects @supports-based annotations for branch and scope analysis as described in that story’s Implementation Notes.

## NEXT

- [ ] Add or adjust unit-level tests for the updated traceability rules to cover scenarios with @supports annotations, including mixed @story/@supports usage and preservation of branch position context.
- [ ] Introduce or extend integration tests that run the ESLint plugin against representative files to verify that @supports-based annotations are treated as canonical and that legacy @story/@req annotations continue to behave correctly during migration.
- [ ] Update the user-facing API and rule documentation to describe the new @supports-focused behavior, including any migration notes, and ensure that the migrate-to-supports story’s acceptance criteria and Definition of Done items are marked as satisfied where appropriate.

## LATER

- [ ] Evaluate the impact of @supports-focused processing on performance for large codebases and optimize any hot paths in comment parsing or branch analysis if needed.
- [ ] Identify and refactor any remaining code paths, tests, or docs that still assume @story/@req as primary, consolidating them around @supports while keeping backward compatibility as required by the story.
- [ ] Augment user documentation with additional examples and troubleshooting guidance that illustrate common migration patterns from @story/@req blocks to @supports-based annotations.
