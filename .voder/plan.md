## NOW

- [ ] Close GitHub issue #7 by adding a comment that explicitly states which released version includes the completed inside-brace placement behavior and then marking the issue as closed.

## NEXT

- [ ] Update the story file docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md to mark all acceptance criteria as satisfied, including the GitHub issue resolution, and add a short list of the key tests that enforce the inside-brace placement behavior for branches and functions.
- [ ] Adjust the wording in the README section that still describes inside-brace placement for functions as a future enhancement so that it accurately reflects the current implementation and configuration options for function-level rules.

## LATER

- [ ] Add broader integration tests that lint mixed projects containing both before-brace and inside-brace annotations across multiple files, branch types, and functions under both placement modes to ensure predictable behavior during partial migrations.
- [ ] Introduce an optional maintenance CLI subcommand that bulk-migrates both branch and function annotations from before-brace to inside-brace placement using the same safety rules as the ESLint autofix behavior, and document a recommended workflow for running it on large repositories.
- [ ] Iterate on the wording and editor-facing quick-fix suggestions for placement violations so that inline messages, code actions, and tooltips encourage the inside-brace standard without overwhelming users in common IDEs.
