## NOW

- [ ] Review the else-if annotation positioning story to extract its exact requirements and acceptance criteria for how annotations around else-if branches must be detected, prioritized, auto-fixed, and behave under formatters like Prettier.

## NEXT

- [ ] Translate the story’s requirements into a small set of concrete code scenarios for else-if branches, including both before-else and after-condition annotation positions, mixed-position precedence, and expected auto-fix insertion points.
- [ ] Inspect the existing branch-annotation helper and rule implementation to see how they currently treat IfStatement and else-if branches, and identify the minimal changes needed to support the new else-if annotation positions without affecting other branch types.
- [ ] Extend the branch-annotation helper logic to recognize annotations that appear between the else-if condition and the body, including a clear precedence rule when both before-else and after-condition annotations are present.
- [ ] Update the auto-fix logic for else-if branches so that when annotations are missing, they are inserted in the position required by the story (for example, immediately after the else-if condition or at a consistent, formatter-friendly location).
- [ ] Add focused unit tests for the helper logic that cover all required else-if annotation positions, precedence rules, and auto-fix behaviors, with clear traceability back to the else-if story and its requirement IDs.
- [ ] Add one or more end-to-end tests that run the rule against realistic else-if code samples, including code formatted by Prettier, to confirm that annotations remain valid and the rule behaves correctly after formatting.
- [ ] Update the rule documentation and user-facing API reference to describe the supported else-if annotation positions, precedence rules, and any formatter-related behavior, referencing the new tests where appropriate.
- [ ] Revisit the else-if story document to mark the newly satisfied acceptance criteria and Definition of Done items, and add links to the relevant implementation and test files.

## LATER

- [ ] Extend formatter-focused integration coverage to other branch types mentioned in related stories (such as else-only branches and switch cases), ensuring their annotation positioning is also stable under common formatters.
- [ ] Review all branch-annotation stories (including the catch and else-if ones) together to ensure their documented behavior is consistent, without contradictions or gaps across different branch types.
- [ ] Consider adding a short developer-focused guide section that summarizes branch annotation positions for if/else-if/else, catch, and switch, highlighting how the rule is designed to cooperate with formatters like Prettier.
- [ ] After the else-if story is fully implemented and stable, perform a small refactoring pass on the branch-annotation helpers to keep them readable and maintainable as they grow in complexity, without changing observable behavior.
