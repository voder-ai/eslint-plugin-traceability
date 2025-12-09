## NOW

- [ ] Implement the excludeTestCallbacks configuration option in the unified function-annotation traceability rule so that, when enabled by default, anonymous callback functions passed to common test framework APIs are exempt from annotation requirements while preserving existing behavior for all other functions.

## NEXT

- [ ] Add or extend unit and integration tests that cover functions used as callbacks in test framework APIs, verifying that anonymous callbacks are exempt from annotation checks when excludeTestCallbacks is enabled and are enforced when the option is disabled or when the callbacks fall outside the recognized patterns.
- [ ] Update user-facing documentation and configuration examples to describe the excludeTestCallbacks option, its default behavior, and how users can adjust it for their own test frameworks.
- [ ] Update the function-annotations story document to mark the technical requirements related to excludeTestCallbacks as complete and to clearly state the current status of the GitHub issue #5 resolution requirement based on what has actually been done in the repository.

## LATER

- [ ] Add additional edge-case tests for the excludeTestCallbacks behavior, including nested test callbacks, less common test-framework helpers, and custom wrapper functions to ensure they are handled or documented appropriately.
- [ ] Finalize or create an architecture decision record that captures the rationale, configuration shape, and consequences of excluding test framework callbacks from function-level traceability checks.
- [ ] Review nearby stories for similar non-technical acceptance criteria tied to external issue tracking or release coordination and adjust their acceptance checklists so that their completion status matches the evidence available in the repository.
