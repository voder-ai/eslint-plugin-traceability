## NOW

- [ ] Use read_file to open `src/utils/storyReferenceUtils.ts` to analyze current story path existence and error-handling logic for file validation.

## NEXT

- [ ] Design and implement improved error-handling in `storyExists`/`normalizeStoryPath` (e.g., wrap fs calls in try/catch to gracefully handle EACCES and other IO errors, returning a safe result and possibly a distinct status for the rule to interpret).
- [ ] Update `src/rules/valid-story-reference.ts` so it interprets new status codes from the utils (e.g., distinguishing between not-found vs. fs-error) and reports a clear, user-facing ESLint diagnostic that satisfies the story’s "Error Handling" acceptance criterion.
- [ ] Add or extend Jest tests in `tests/rules/valid-story-reference.test.ts` (or a new focused test file) to simulate permission-denied / fs error scenarios via Jest mocking, verifying that linting does not crash and that users see the expected error messages.
- [ ] Ensure new/updated functions and branches have correct `@story` and `@req` annotations referencing `docs/stories/006.0-DEV-FILE-VALIDATION.story.md` and the relevant requirement IDs, updating the story file if needed to align IDs with behavior.
- [ ] Re-run the implementation assessment (or equivalent test/story-mapping scripts if present) to confirm docs/stories/006.0-DEV-FILE-VALIDATION.story.md now passes and functional coverage has increased, then identify the next failing story and repeat a similar implement-and-test cycle.

## LATER

- [ ] Extend validation logic to enforce that configured `storyDirectories` cannot silently point outside the project root (project-boundary requirement), adding tests for misconfigured directories and documenting the behavior.
- [ ] Review the other three failed stories from the assessment, one by one, and for each: inspect current implementation, fill behavior gaps, add tests, and update traceability until their acceptance criteria are fully met.
- [ ] Once all stories are green and functional coverage ≥ 90%, consider small refactors to centralize any duplicated path/FS handling helpers and keep error-handling behavior consistent across current and future rules.
