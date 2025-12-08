## NOW

- [ ] Refactor the legacy function-annotation rules so that the `require-story-annotation` and `require-req-annotation` rule names truly act as aliases that share the same underlying implementation as the unified `require-traceability` rule, while preserving their existing option shapes and diagnostics.

## NEXT

- [ ] Add or adjust targeted tests to verify that configuring any of the three rule names (`require-traceability`, `require-story-annotation`, `require-req-annotation`) produces equivalent behavior for in-scope functions, including options such as scope and exportPriority and all relevant error messages.
- [ ] Review the function-annotations story’s Definition of Done against the refactored implementation and update the story text only where necessary to accurately describe the finalized aliasing model and mark its acceptance criteria as satisfied based on the new behavior.
- [ ] Perform a focused cleanup pass on the unified function-annotation implementation and its helpers to remove any duplication introduced by the alias refactor and ensure the code remains easy to understand and maintain.

## LATER

- [ ] Extend configuration-level and integration tests to cover mixed usage of the unified and legacy rule names in realistic ESLint flat-config setups, confirming consistent behavior in real-world scenarios.
- [ ] Evaluate the performance and complexity of the unified function-annotation logic on larger synthetic projects and, if needed, refine internal helper structure to keep analysis fast and maintainable.
- [ ] Add targeted regression tests for tricky function shapes or annotation patterns mentioned in the function-annotations story, ensuring that future changes cannot silently break the unified rule or its aliases.
