## NOW

- [ ] Carefully review the test-annotation validation story to extract a concrete list of required behaviors, error conditions, and configuration options for the new test traceability rule and summarize them as an implementation checklist.

## NEXT

- [ ] Design the new test traceability rule’s public API and overall approach, including how it detects test files, how it maps to different test frameworks, and what conditions it enforces for file-level annotations, describe blocks, and test names.
- [ ] Introduce a minimal initial implementation of the test traceability rule and a corresponding test suite that validates a simple, single-framework happy path (for example, Jest tests with correct @supports file header, describe story reference, and [REQ-XXX] test name prefixes).
- [ ] Incrementally extend the rule and its tests to cover all remaining acceptance criteria from the story, including nested describe structures, multiple supported test frameworks, error messaging details, and handling of edge cases such as missing or malformed annotations.
- [ ] Integrate the new rule into the plugin’s exported rules and recommended or strict configurations as described by the story so that it can be enabled consistently in consuming projects.
- [ ] Update rule-specific and user-facing documentation to describe the new test traceability rule, including its purpose, configuration options, examples, and how it relates to the existing annotation and validation rules.
- [ ] Verify that the implemented behavior and tests fully satisfy every requirement and Definition of Done item from the test-annotation validation story, adjusting the rule or tests where any gaps are found.

## LATER

- [ ] Assess whether any other stories besides the test-annotation validation story remain incomplete and, if so, create similar focused implementation plans for them.
- [ ] Refine the new test traceability rule based on real-world usage patterns, potentially adding configuration switches or framework-specific presets if the story allows for such evolution.
- [ ] Look for opportunities to share logic between the new test traceability rule and existing annotation validation helpers to keep the codebase consistent and maintainable.
