## NOW

- [ ] Expand the test-callback exclusion logic so that all anonymous arrow callbacks passed to the broader set of test framework functions described in the function-annotations story (including Jest lifecycle hooks, Mocha’s `suite`/`context`/`specify`/`before`/`after`, and Vitest’s `bench` and lifecycle hooks) are excluded by default, with updated helper-level tests that confirm each of these names is handled correctly.

## NEXT

- [ ] Add additional rule-level test cases that exercise Mocha-style and Vitest-style test callbacks, confirming that anonymous callbacks are exempt from annotation checks by default and are enforced when the exclusion option is disabled.
- [ ] Align the user-facing documentation and the ADR describing test callback exclusion so that the documented list of supported test framework functions exactly matches the implemented behavior and clearly explains any limitations.
- [ ] Ensure the function-annotations story explicitly calls out the expanded list of supported test framework callbacks in its requirements and that all technical acceptance criteria related to callback exclusion are accurately checked off based on the new implementation and tests.

## LATER

- [ ] Once the external GitHub issue related to test callback exclusion has actually been closed in the real tracker, update the function-annotations story’s Issue #5 resolution checklist items to reflect that completion.
- [ ] Add edge-case tests for nested and custom-wrapped test callbacks (for example, callbacks passed through helper functions that wrap `it` or `describe`) to document and verify how the exclusion logic behaves in less common patterns.
- [ ] Consider adding configuration support for custom test function name lists so projects using non-standard test helpers can opt into the same exclusion behavior without modifying the core rule.
