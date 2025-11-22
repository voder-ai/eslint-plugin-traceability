## NOW

- [ ] Update the rule documentation for branch and requirement annotations so that the require-branch-annotation examples use the fully qualified traceability rule name and the require-req-annotation docs accurately describe which function kinds are actually enforced (excluding arrow functions unless and until the implementation changes).

## NEXT

- [ ] Review all rule documentation files to ensure every configuration example uses the namespaced traceability/<rule-name> syntax and that option examples match the current rule schemas and default behaviors.
- [ ] Align the API reference and any related user-facing guides with the corrected rule docs, ensuring descriptions of rule scope, options, and presets match the current implementation and exported configurations.
- [ ] Add a brief clarification in the main README or ESLint 9 setup guide explaining when to use ESM versus CommonJS style ESLint configuration, so users can choose the correct example for their project type.

## LATER

- [ ] Once the documentation updates are in place, re-evaluate overall functionality against the documented stories to confirm that behavior, tests, and user docs are fully aligned and that a functionality assessment can proceed confidently.
- [ ] If any subtle documentation gaps or redundancies are discovered (for example, overlapping explanations of configuration presets), plan a small follow-up cleanup to streamline user-facing docs without changing behavior.
