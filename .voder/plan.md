## NOW

- [ ] Review the `traceability/require-test-traceability` rule and its user-facing documentation to align the described behavior (especially how test files are detected) with the actual implementation, updating either the docs or the rule so that there is no mismatch between what users read and what the rule enforces.

## NEXT

- [ ] Identify all helper functions and significant branches in the `prefer-implements-annotation` rule and related helper modules that currently lack explicit traceability annotations, and add appropriate `@supports` or `@story`/`@req` comments so every piece of logic is tied back to its documented story and requirements.
- [ ] Revisit the user-facing examples and API reference sections for the `traceability/require-test-traceability` rule to ensure they clearly document the final semantics, including how test files are recognized, what a valid `@supports` line looks like, and how `[REQ-...]` prefixes should be used in test names.
- [ ] Do a focused sweep of other rule helper and utility files to catch any remaining missing or outdated traceability annotations, updating them to the canonical `@supports` format so that implementation and story documentation remain in full sync.

## LATER

- [ ] Perform a short holistic review of all user-facing rule documentation to confirm that option defaults, examples, and edge-case descriptions match the current behavior of the codebase, adjusting wording where necessary for precision and consistency.
- [ ] Extend the documentation around test traceability into a small thematic guide that shows how `require-test-traceability` works together with core rules such as `require-story-annotation` and `require-req-annotation` in a typical project layout.
- [ ] Once documentation and traceability are fully aligned, trigger or request a renewed functionality assessment to validate that the project’s features are now considered complete against their stories.
