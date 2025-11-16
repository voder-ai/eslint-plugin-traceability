## NOW
Modify the `.husky/pre-commit` hook script to run `npm run format` followed by `npm run lint -- --max-warnings=0`.

## NEXT
- Align the `.husky/pre-push` hook to exactly mirror the CI “quality-checks” job by running `npm run build`, `npm run type-check`, `npm run lint -- --max-warnings=0`, `npm test`, `npm run format:check`, and `npm run duplication`.
- Update the usage example in `README.md` to demonstrate the ESLint v9 flat‐config (`eslint.config.js`) approach for installing and configuring the traceability plugin.
- Add JSDoc `@story` and `@req` annotations to internal helper functions and significant code branches in `src/` to satisfy the project’s traceability guidelines.

## LATER
- Document the `cli-integration.js` script and its commands in the `docs/` folder and update any related setup guides.
- Review and update `docs/rules/` for stories not yet implemented (annotation format, file validation, auto-fix, maintenance tools, deep validation), adding placeholders or migration notes.
- Record an ADR capturing the chosen documentation conventions and complexity standards, and outline a process for keeping examples and helper docs in sync with flat-config and traceability requirements.