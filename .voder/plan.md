## NOW

- [ ] Review the redundant-annotation detection story to extract the specific documentation and migration-guide requirements for how users should clean up redundant traceability annotations.

## NEXT

- [ ] Review the existing no-redundant-annotation rule implementation and its tests to confirm the precise behaviors, options, and edge cases that must be accurately described in the migration guide.
- [ ] Draft and insert a dedicated section in the migration guide that explains redundancy cleanup during migration, including when and how to enable the no-redundant-annotation rule, what kinds of duplicate or overlapping annotations it flags, and recommended workflows for safely applying fixes.
- [ ] Refine the new migration-guide content to ensure it uses clear user-facing language, references the unified rule and @supports-first approach consistently, and aligns with the acceptance criteria in the redundant-annotation story.
- [ ] Update the redundant-annotation story to mark the migration-guide documentation criterion as satisfied and adjust any narrative text so it accurately reflects the new guidance and the current implementation state.

## LATER

- [ ] Cross-check other user-facing docs (API reference, examples, traceability overview) to ensure they consistently mention redundancy cleanup where appropriate and link users toward the migration-guide recommendations.
- [ ] Identify any additional real-world patterns of redundant annotations (for example, mixed @supports and legacy annotations on the same function) that could be highlighted with examples in future documentation iterations.
- [ ] Consider whether additional integration tests or end-to-end scenarios are needed to validate common redundancy-cleanup workflows that users might follow based on the new migration-guide guidance.
