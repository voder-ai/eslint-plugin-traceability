## NOW

- [ ] Review the 010.3 multi-story migration story in detail and extract a precise checklist of behaviors and configuration requirements for the new migration-focused rule so its implementation can align exactly with the specified acceptance criteria.

## NEXT

- [ ] Design the API and configuration shape for the new migration rule (including its name, default-off behavior, and severity options) and outline how it will coexist with existing rules without changing current validation semantics.
- [ ] Implement an initial version of the new migration rule that detects legacy `@story` and `@req` annotations in candidate locations, emits appropriate diagnostics without auto-fixing, and is wired into the plugin’s exports while remaining disabled by default.
- [ ] Create a dedicated test suite for the new migration rule that exercises configuration handling, basic detection scenarios, and ensures the rule is fully backward compatible when turned off.
- [ ] Extend the migration rule to perform safe auto-fix transformations for supported single-story cases, leaving multi-story or ambiguous situations as diagnostics only, and update tests to cover these fix behaviors thoroughly.
- [ ] Update the user and rule documentation, along with story 010.3’s acceptance criteria and Definition of Done, to describe the new migration rule, its configuration, auto-fix capabilities, and recommended usage patterns, ensuring the docs match the implemented and tested behavior.

## LATER

- [ ] Add more advanced migration examples and recipes that show how teams can adopt the migration rule across large or complex codebases, including staged rollouts and integration with existing lint configurations.
- [ ] Evaluate whether maintenance utilities or CLI commands should offer automated assistance for bulk-converting `@story`/`@req` annotations to `@implements`, and if appropriate, design a follow-on story and implementation plan for that tooling.
