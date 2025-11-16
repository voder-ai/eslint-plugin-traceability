## NOW  
Create a top-level `CHANGELOG.md` outlining the initial release (0.1.0) with user-visible feature, fix, and documentation entries.

## NEXT  
- Add missing rule docs: create `docs/rules/valid-annotation-format.md` and `docs/rules/valid-story-reference.md` (with @story, @req tags, examples, and links to their story files), and update the README’s “Available Rules” and `docs/config-presets.md` to reference them.  
- Harden the pre-commit hook: modify `.husky/pre-commit` to run `npm run format` and `npm run lint -- --max-warnings=0` (or use lint-staged) on staged files to enforce formatting and linting locally before each commit.

## LATER  
- Introduce stricter code-quality rules in `eslint.config.js` (e.g. `max-lines`, `max-lines-per-function`, lower `complexity` threshold) and refactor code to comply.  
- Add a CI check (e.g. a Markdown linter) to verify every ESLint rule has a corresponding `.md` doc in `docs/rules/`.  
- Reorganize user-facing documentation into a dedicated `user-docs/` directory and add a documentation link-checker step in CI.