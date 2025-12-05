## NOW

- [ ] Carefully study the test-annotation auto-fix story to derive a precise checklist of required auto-fix behaviors, templates, safety constraints, and configuration options that must be added to the existing test traceability rule.

## NEXT

- [ ] Design how the existing test traceability rule will implement these auto-fix behaviors, including what placeholder @supports template it inserts, how it recognizes and normalizes malformed requirement prefixes in test names, and how it avoids guessing or overwriting real requirement IDs.
- [ ] Extend the test traceability rule implementation to declare itself fixable and add fix logic that performs the safe, template-based insertions and prefix normalizations defined by the story.
- [ ] Create and refine a dedicated test suite for the auto-fix behavior that exercises all story requirements, including insertion of the file-level template, normalization of various malformed prefixes, and verification that already-correct annotations and names are preserved.
- [ ] Update user-facing documentation to describe the new auto-fix capabilities of the test traceability rule, including examples of before-and-after code and any configuration that controls when fixes are applied.
- [ ] Review the story’s Definition of Done and confirm that the implemented rule behavior and tests fully satisfy each auto-fix requirement, adjusting the implementation or tests if any gaps remain.

## LATER

- [ ] Scan the remaining story files to identify any other incomplete stories beyond the test-annotation auto-fix story and create similar focused implementation plans for them if needed.
- [ ] Look for opportunities to share auto-fix helpers and utilities between the test traceability rule and existing annotation-related rules, keeping the implementation consistent and maintainable.
- [ ] Gather feedback from real-world usage of the test auto-fix behavior and iteratively refine defaults, templates, or additional configuration options if the stories allow for such evolution.
