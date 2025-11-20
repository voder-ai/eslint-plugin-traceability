## NOW

- [ ] Edit .github/workflows/ci-cd.yml to remove continue-on-error: true from the dependency safety and CI audit steps so high/critical audit findings fail the pipeline (make these audit steps blocking for severe findings).

## NEXT

- [ ] Add a CI guard step that verifies the built plugin exports rules before lint runs (e.g., run node -e "const p=require('./lib'); if(!p||!p.rules){console.error('plugin missing'); process.exit(1);} ") and ensure the CI lint step runs after the build step with NODE_ENV=ci.
- [ ] Create an npm script lint-plugin-check that builds the project and runs the node guard; call this script from CI (before lint) and document its local use in CONTRIBUTING.md as lint:require-built-plugin.
- [ ] Restore the intended global Jest branch coverage threshold in jest.config.js, extract uncovered branch ranges from the latest coverage JSON for src/rules/helpers/*, and produce a concise checklist mapping files to branch ranges to target with tests.
- [ ] Add focused Jest tests to cover uncovered branches in require-story-helpers.ts, require-story-io.ts and require-story-visitors.ts. Each test file must include @story/@req JSDoc headers and test one behavior per test.
- [ ] Update .husky/pre-push to invoke ci-verify:fast (developer-friendly subset) that includes lint-plugin-check, type-check, check:traceability, duplication, and a targeted jest subset to ensure parity of commands/configuration with CI (but optimized for developer runtime).

## LATER

- [ ] Add a scheduled weekly workflow that runs dry-aged-deps and opens informative PRs or uploads artifacts when safe updates are available.
- [ ] Add a coverage-delta PR check that warns or blocks when branch coverage drops beyond a small configurable threshold.
- [ ] Gate debug logging behind NODE_ENV/DEBUG to reduce CI noise and improve signal-to-noise in CI/test logs.
- [ ] Enforce ESLint max-file/max-lines as blocking checks in CI after helper tests and parity fixes are in place (split large files if needed).
- [ ] Write an ADR documenting the 'audit-enforcement' and 'build-before-lint' decisions and update CONTRIBUTING.md with exact developer instructions for running lint with the built plugin locally.
