## NOW

- [ ] Review the configurable patterns story specification and the existing valid-annotation-format rule implementation and tests to extract the exact required behaviors, defaults, and error-message expectations for configurable story and requirement patterns.

## NEXT

- [ ] Refactor the valid-annotation-format rule to derive its story and requirement validation regexes from optional configuration while preserving the current hardcoded defaults when no options are provided.
- [ ] Extend the rule metadata to define a JSON-schema-style options object that supports story and requirement pattern and example fields, and add runtime validation that reports clear ESLint configuration errors when invalid regex strings are supplied.
- [ ] Add or update unit tests for the valid-annotation-format rule to cover default behavior, custom patterns, example-based error messages, and invalid configuration scenarios, ensuring they reference the configurable patterns story and its requirements.
- [ ] Update the rule documentation and any relevant user-facing guides to describe the new configuration options, including examples that match the implemented defaults and behaviors, and verify that the docs stay consistent with the code.

## LATER

- [ ] Review other rules and utilities that assume fixed annotation formats to ensure they remain consistent with, or explicitly document differences from, the newly configurable patterns.
- [ ] Enhance higher-level documentation to include a dedicated section on configuring annotation patterns across a project, with recommended conventions and migration advice for teams adopting custom story and requirement naming schemes.
