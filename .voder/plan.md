## NOW
Remove the ESLint override that disables the `complexity` and `max-lines-per-function` rules for `src/rules/**/*.ts` and test files in `eslint.config.js`, so those rules are enforced again.

## NEXT
- Run `npm run lint` to surface all `complexity` and `max-lines-per-function` violations in plugin source and tests.  
- Refactor or split any functions in `src/rules/` and tests that exceed the configured thresholds until the lint run passes with zero violations.  
- Add the “Created autonomously by voder.ai” attribution header to `user-docs/eslint-9-setup-guide.md`.  
- Insert a link to `user-docs/migration-guide.md` in the README under the Documentation section.

## LATER
- Add a CI reporting step or badge for complexity/function-length metrics to track regressions.  
- Audit remaining user-facing docs to ensure all have the required attribution and accurate navigation links.  
- Periodically revisit and tighten the `complexity` and `max-lines-per-function` thresholds if maintainability allows.