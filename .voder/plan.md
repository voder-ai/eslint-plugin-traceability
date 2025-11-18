## NOW
Remove the `prelint` hook and update the `lint` script in package.json so that it no longer runs `npm run build` but simply invokes ESLint on your source files (e.g. `eslint "src/**/*.{ts,js}"`), decoupling linting from compilation.

## NEXT
- Re-enable and enforce strict ESLint rules (complexity, max-lines per file/function, etc.) in eslint.config.js so they error rather than warn.  
- Update Husky’s pre-commit hook to call the decoupled `lint` script.  
- Migrate your bespoke CLI integration runner into a Jest test under tests/integration/cli-integration.test.ts and remove the standalone cli-integration.js.  
- In jest.config.js, uncomment and set `coverageThreshold.global` to require ≥ 90% for branches, lines, functions, and statements.  
- Run `npm run lint` and `npm test` to verify strict linting and coverage enforcement pass.

## LATER
- Integrate the jscpd duplication check as a blocking gate in your CI/CD workflow.  
- Audit other custom rule files for DRY violations and refactor into shared utilities.  
- Add timing or performance metrics to your Husky hooks to detect regressions.  
- Document the new annotationChecker helper in docs/decisions/ for future contributors.