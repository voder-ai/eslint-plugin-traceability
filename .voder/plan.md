## NOW
Generate and register the skeleton for the branch-annotation rule by creating `src/rules/require-branch-annotation.ts` with a stubbed create function and adding `"require-branch-annotation": requireBranchAnnotation` to the `rules` export in `src/index.ts`.

## NEXT
- Create `tests/rules/require-branch-annotation.test.ts` using RuleTester and reference `docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md` with valid and invalid branch examples.
- Flesh out `require-branch-annotation.ts` to detect `IfStatement`, `SwitchCase`, `TryStatement`, and loop nodes and report missing `@story`/`@req` annotations.
- Add JSDoc traceability tags (`@story`/`@req`) in the new rule source file linking to story 004.0.
- Run `npm run build && npm run type-check && npm test && npm run lint && npm run format:check` to verify the new rule and tests pass.

## LATER
- Implement and test annotation-format validation (005.0), story file existence checks (006.0), clear error messaging (007.0), auto-fixers (008.0), maintenance tools (009.0), and deep-validation (010.0).
- Write ESLint CLI integration tests on fixture projects to ensure end-to-end rule enforcement and auto-fix behavior.
- Update `README.md` with “Getting Started” instructions, link to `docs/eslint-9-setup-guide.md` and `docs/eslint-plugin-development-guide.md`, and document all rules and configs.
- Commit any outstanding lockfile changes, add an automated publish workflow for npm, and configure CI to enforce coverage, complexity, and duplication checks.