## NOW
Create a new failing test spec for story 007.0-DEV-ERROR-REPORTING by adding `tests/rules/error-reporting.test.ts` that captures the acceptance criteria (clear contextual error messages with actionable suggestions) and references `docs/stories/007.0-DEV-ERROR-REPORTING.story.md`.

## NEXT
- Implement the enhanced error‐reporting in the affected ESLint rules:
  - Add new `messageId`s in each rule’s `meta.messages` for context and suggestion.
  - Update `context.report()` calls to use those messages and include the expected file path, code location, and fix suggestion text from the story.
- Run the new tests and iterate until they pass.
- Add unit tests for any helper functions you introduce to format or generate the suggestion text.

## LATER
- Audit all other rules to ensure they emit similarly rich error reports and update their tests.
- Document the error‐reporting design and patterns in an ADR under `docs/decisions/`.
- Consider publishing a “verbose errors” configuration option exposing or suppressing the additional context.