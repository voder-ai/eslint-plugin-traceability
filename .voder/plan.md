## NOW

- [x] Introduce a configuration option that lets projects specify additional test helper function names to be treated as excluded callbacks in the function-annotation logic, and add unit tests confirming that callbacks passed to these configured helpers are skipped when this option is used.

## NEXT

- [x] Wire the new additional-helper configuration through the require-story-annotation rule’s schema and options so ESLint users can set it in their configs, and add rule-level tests demonstrating the end-to-end behavior.
- [ ] Update the function-annotations story to document the new configuration capability for custom excluded test helpers and mark the corresponding requirement and acceptance-criteria items as satisfied.
- [ ] Amend ADR 013 to describe the new configuration option for custom helper names, including rationale and examples of how teams can use it to align with their own test wrappers.
- [ ] Add an integration test that exercises the unified require-traceability rule in a realistic flat-config setup where custom helper names are configured for exclusion, verifying behavior across both JS and TS files.

## LATER

- [ ] Expand performance-oriented tests around function annotations, including scenarios with many test files and deeply nested suites, and adjust the function-annotations story’s performance-related acceptance criteria to reference concrete timing expectations if necessary.
- [ ] Once maintainers have actually closed the real GitHub issue #5 with a version-referenced comment in the external tracker, update the Issue #5 resolution checklist items in the function-annotations story to mark them complete and, if useful, note the release tag that contained the fix.