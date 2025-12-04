## NOW

- [ ] Re-read the multi-story support story and its related architectural decision record(s) to understand the intended behavior, naming, and requirements for multi-story annotations and to identify precisely how the current @implements-based implementation diverges from that specification.

## NEXT

- [ ] Decide, based on the story and relevant architectural decisions, whether the canonical multi-story annotation in the codebase should be @supports, @implements, or both, and document this decision in terms of required behavior and compatibility expectations.
- [ ] Update the core annotation parsing and validation helpers so they correctly implement the story’s specified multi-story annotation semantics (including token structure, story-path and requirement-ID patterns, and coexistence with @story and @req), while preserving existing working behavior where required.
- [ ] Adjust the ESLint rules that enforce story and requirement annotations so they treat the story’s multi-story annotation (e.g., @supports or @implements) as a first-class way to associate requirements with stories, in line with each requirement in the multi-story support story.
- [ ] Extend and update the test suite to cover all behaviors described in the multi-story support story, including parsing, format validation, deep requirement existence checks across multiple stories, mixed usage with @story/@req, and error-reporting edge cases, with each test mapped to the correct requirement IDs from that story.
- [ ] Review and fix traceability annotations in the modified source and test files so that they reference the appropriate requirements from docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md rather than only the older @implements-centric requirement IDs.
- [ ] Compare the final behavior against every example and edge case in the multi-story support story to confirm full alignment, and adjust any remaining discrepancies between the implementation and the documented requirements.

## LATER

- [ ] Design and document a clear migration strategy between any legacy annotation name (such as @implements) and the finalized multi-story annotation (such as @supports), including whether legacy forms remain supported indefinitely, are aliased, or will be deprecated over time.
- [ ] Update internal development documentation and user-facing guides (such as the API reference and migration guide) to describe the finalized multi-story annotation format, its interaction with per-story requirement scoping, and recommended usage patterns for new and existing projects.
- [ ] Look for additional rules or stories that can share the multi-story annotation handling logic, and plan incremental refactors to centralize or simplify annotation parsing and validation where that improves maintainability without changing user-visible behavior.
