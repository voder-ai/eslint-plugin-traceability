## NOW
Extract the duplicated annotation‐checking logic in `src/rules/require-req-annotation.ts` into a new helper function in `src/utils/annotationChecker.ts` and update the rule file to import and call that helper, removing all duplicate code blocks.

## NEXT
- In `package.json`, add a new npm script (e.g. `"lint:fast"`) that runs only ESLint on `src/**/*.{ts,js}` without triggering the build step.
- Update the Husky pre-commit hook (`.husky/pre-commit`) to invoke `npm run lint:fast` (or direct `npx eslint ...`) instead of the existing lint script.
- Run the pre-commit hook locally to confirm it finishes in under 10 seconds and only blocks on lint/format/type errors.
- Commit and push these changes, then verify the CI pipeline still passes.

## LATER
- Integrate the jscpd duplication check into the CI/CD workflow as a blocking quality gate.
- Audit other custom rule files for similar DRY violations and refactor where needed.
- Add performance monitoring or timing logs for pre-commit/pre-push hooks to catch regressions.
- Document the new `annotationChecker` helper in the internal developer docs (`docs/decisions/`) so future contributors understand the shared logic.