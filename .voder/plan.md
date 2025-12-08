## NOW

- [ ] Implement the unified `require-traceability` rule so that it fully satisfies the function-annotations story’s requirements, including all aliasing behavior and backward compatibility.
- [ ] Refactor the existing `require-story-annotation` and `require-req-annotation` rule implementations so they delegate to `require-traceability` without changing their option shapes or diagnostics.
- [ ] Wire up all three rule names (`require-traceability`, `require-story-annotation`, `require-req-annotation`) in the plugin’s export surface (rule registry and shared configurations) according to the story’s expectations.
- [ ] Add and update unit tests to exercise the unified rule under all three names, confirming identical behavior, configuration handling, and error-message requirements.
- [ ] Update the function-annotations story and any relevant rule documentation to describe `require-traceability` as the canonical rule and the other two as aliases, and mark the associated acceptance criteria as satisfied.

## NEXT

- [ ] Perform a pass over the new and refactored rule code to simplify internal helpers, remove duplication between legacy and unified implementations, and ensure the behavior is easy to reason about.
- [ ] Add additional focused tests for edge configurations (e.g., mixed use of aliases in a single ESLint config, legacy options with the new rule name) to guard against regressions in alias and configuration behavior.
- [ ] Run the test suite and linting locally with multiple ESLint versions (within our supported range) to confirm the unified rule behaves consistently and does not introduce compatibility issues.
- [ ] Draft a brief migration note (changelog entry or upgrade guide snippet) explaining the introduction of `require-traceability`, how it relates to the legacy rules, and recommended usage going forward.

## LATER

- [ ] Extend integration tests to run the ESLint plugin using the new `require-traceability` rule name in representative configurations to verify end-to-end behavior in real-world-style setups.
- [ ] Review performance and complexity of the unified rule implementation on large projects and, if necessary, refactor internal helpers to keep the function-annotation logic simple and maintainable.
- [ ] Add targeted regression tests around edge cases covered by the story (such as unusual function syntaxes or mixed annotation styles) to prevent future changes from breaking the unified rule’s guarantees.