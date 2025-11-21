## NOW

- [ ] Use read_file to open `docs/stories/007.0-DEV-ERROR-REPORTING.story.md` to refresh the exact error-reporting requirements and acceptance criteria.

## NEXT

- [ ] Use read_file on `tests/rules/error-reporting.test.ts` and `src/rules/require-req-annotation.ts` to understand the current error-message behavior and how it differs from the 007.0 story requirements.
- [ ] Analyze `src/index.ts` exported rule configs (recommended/strict) and any rule meta to see how severity levels are currently applied vs. what 007.0 expects (e.g., errors for missing annotations, warnings for format issues).
- [ ] Design concrete changes to `require-req-annotation` (and, if necessary, other rules or configs) so that all rules covered by 007.0 provide specific, context-rich error messages and appropriate severities while staying backward compatible where possible.
- [ ] Modify `src/rules/require-req-annotation.ts` (and any other directly impacted rule or config files) to implement the new error messages, suggestions, and severity behavior defined in the design.
- [ ] Update or extend Jest tests in `tests/rules/error-reporting.test.ts` and `tests/rules/require-req-annotation.test.ts` to cover the new error-reporting behavior, including function-name context, suggestion descriptions, and severity expectations where applicable.
- [ ] Update `docs/stories/007.0-DEV-ERROR-REPORTING.story.md` and any relevant rule or user docs to reflect the finalized error-message formats, examples, and severity semantics, ensuring REQ IDs and examples match the implementation and tests.
- [ ] Review the functionality assessment (or rerun the relevant tooling if available) to confirm that Story 007.0 now passes and identify the next failing story to tackle.

## LATER

- [ ] For each remaining failing story identified in the functionality assessment, repeat the inspect–design–implement–test–doc-align cycle used for 007.0 until all stories reach the required alignment threshold.
- [ ] After all currently failing stories are addressed, review cross-cutting behaviors in error handling and annotation logic across rules for small, safe refactors (e.g., shared error-message helpers) to reduce duplication without changing behavior.
- [ ] Once functional coverage is complete and stable, consider adding a few additional characterization tests for complex or rare error-reporting edge cases to guard future refactors.
