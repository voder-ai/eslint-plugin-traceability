## NOW

- [ ] Review the unified-function-rule story’s implementation notes and acceptance criteria to extract the exact integration test scenarios and expectations for `require-traceability` and its legacy aliases.

## NEXT

- [ ] Design a small set of representative ESLint configurations and code fixtures that exercise function-level traceability with `@supports` and legacy `@story`/`@req` annotations, ensuring they can be reused across all three rule keys.
- [ ] Add or extend an integration-level Jest test suite that runs ESLint against the shared fixtures using each of the three rule names (`require-traceability`, `require-story-annotation`, and `require-req-annotation`) and asserts that the reported diagnostics and behaviors are consistent with the story’s requirements.
- [ ] Refine the new integration tests to also cover the behavior when using the recommended and strict presets, confirming that enabling presets produces the expected diagnostics for unified and alias rule keys.
- [ ] Update the unified-function-rule story to mark the integration-test acceptance criteria as satisfied and adjust any narrative text so it accurately reflects the new test coverage.

## LATER

- [ ] Review related architecture decisions about the unified rule and aliasing to ensure they reference the existence and purpose of the new integration tests.
- [ ] Look for additional edge cases or real-world patterns (such as nested functions, callbacks, and mixed annotation forms) that could benefit from future integration tests, and note them for a follow-up enhancement.
- [ ] Once the integration tests have been stable for some time, consider simplifying or removing any redundant lower-level tests that duplicate the new end-to-end coverage, while keeping overall traceability and behavior well tested.
