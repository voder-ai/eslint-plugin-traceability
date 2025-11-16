## NOW
Update README.md to add the required “Attribution” section (“Created autonomously by voder.ai” linking to https://voder.ai), plus installation steps, a quick-start example, and direct links to docs/eslint-9-setup-guide.md and docs/eslint-plugin-development-guide.md.

## NEXT
- Add a `coverageThreshold` section to jest.config.js (e.g. enforce 100% statements, branches, functions, and lines) so CI will fail on low coverage.  
- Refactor the Husky pre-commit hook to use lint-staged for fast, staged-file linting/formatting, and extend the pre-push hook to run `npm audit --audit-level=high` to mirror CI security checks.  
- Expand tests in tests/rules/require-branch-annotation.test.ts to include SwitchCase, TryStatement, CatchClause, WhileStatement, DoWhileStatement, ForInStatement, and ForOfStatement cases so branch coverage reaches 100%.

## LATER
- Create a lint-staged configuration file and update package.json scripts accordingly.  
- Once format-validation (005) and file-validation (006) rules are implemented, write their unit tests to raise overall test coverage.  
- Add end-to-end integration tests invoking the ESLint CLI (with both recommended and strict configs) against fixture projects to verify rule enforcement and `--fix` behavior.  
- Implement a GitHub Actions workflow to automate npm package publishing on tagged releases and document the release process in the repository.