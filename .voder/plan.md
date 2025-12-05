## NOW

- [ ] Update the user-facing rule documentation so that the documented default patterns and options for annotation format and test traceability exactly match the current implementation, including the precise default story path regex and the default describe pattern used for test files.

## NEXT

- [ ] Review all examples in the user-facing documentation that demonstrate story annotations and test traceability to ensure they either conform to the actual default patterns or clearly indicate any required configuration overrides, and adjust the examples where needed.
- [ ] Add concise clarification sections to the user-facing rule documentation explaining how to customize the story path pattern and test traceability patterns, including describe labels and test name prefixes, so users understand why certain violations might be reported and how to adapt the rules to their own conventions.
- [ ] Update any internal development documentation that talks about default annotation or test-traceability patterns so that it reflects the stricter, implementation-accurate defaults, helping future maintainers keep code and docs in sync when changing these patterns.
- [ ] Do a light pass over the codebase to spot any other small documentation or comment inconsistencies around defaults or examples for the traceability rules and bring them into alignment without changing behavior.

## LATER

- [ ] Evaluate whether to further tighten code-quality limits such as maximum function length or cyclomatic complexity in small increments, and plan targeted refactors where needed to stay within any new limits.
- [ ] Consider refactoring the remaining small duplicated logic in helper modules into shared internal functions to further reduce even minor duplication while keeping public interfaces unchanged.
- [ ] Extend the contributor documentation with a short checklist for updating documentation whenever rule defaults or options change, ensuring future behavior and docs stay aligned.
- [ ] After these refinements, revisit the overall code-quality and documentation assessments to confirm all previously noted minor nits have been addressed.
