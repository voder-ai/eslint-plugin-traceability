## NOW
Implement the auto-fixer for missing `@story` annotations in the `require-story-annotation` rule (Story 008.0) by adding a `fix` function in `src/rules/require-story-annotation.ts` that inserts a JSDoc stub (`/** @story <story-file>.story.md */`) immediately above any function declaration missing the annotation.

## NEXT
- Extend the `require-req-annotation` rule with a similar auto-fixer that inserts a JSDoc stub with `@req <REQ-ID>` above functions lacking the requirement annotation.
- Add auto-fix capability to the `require-branch-annotation` rule to insert inline comment stubs with both `@story` and `@req` before significant branches.
- Create RuleTester unit tests in `tests/rules/` to verify each fixer’s before/after output for missing annotations.

## LATER
- Implement auto-fix strategies for common format violations in the `valid-annotation-format` rule (spacing, casing, syntax).
- Introduce configuration options allowing teams to enable/disable specific fixer behaviors and customize annotation templates.
- Document `--fix` usage and auto-fix examples in the README, config-presets guide, and CLI integration documentation.
- Add CI checks or metrics to monitor auto-fix coverage and validate that fixes apply correctly in large codebases.