## NOW

- [ ] Edit package.json to update the ci-verify:fast npm script so it no longer invokes the build-producing 'lint-plugin-check' and instead runs the non-building guard 'lint:require-built-plugin' (so pre-push no longer triggers a build).

## NEXT

- [ ] If 'lint:require-built-plugin' currently executes a build, refactor scripts into two: scripts/lint-plugin-check.js (CI-only: build + guard) and scripts/lint-plugin-guard.js (pre-push-only: require built lib and validate plugin.rules). Wire package.json so 'lint-plugin-check' remains CI-only and 'lint:require-built-plugin' invokes the guard-only script.
- [ ] Update .github/workflows/ci-cd.yml to ensure the CI lint step explicitly runs 'npm run lint-plugin-check' (CI-only build+guard) before running ESLint, so CI retains the full verification while pre-push remains fast. Add a short named step for the guard so CI logs show it separately.
- [ ] Refactor large helper file src/rules/helpers/require-story-helpers.ts by extracting cohesive helper groups into smaller modules (one new file per helper group). Add JSDoc @story/@req tags for each new function module. Run tests after each small extraction to keep trunk green and incremental.
- [ ] Audit and fix tests for process-global mutations: find tests that set process.env (e.g., NODE_PATH), change them to save/restore original values in beforeEach/afterEach or run in isolated modules (jest.resetModules). Replace filenames containing '.branches.' with behavior-focused names and ensure each test file includes @story JSDoc headers.
- [ ] Add small unit tests for the newly extracted helper modules (one behavior per test) with @story/@req headers to increase branch coverage. Keep these tests fast so they can be included in ci-verify:fast where relevant.
- [ ] Update CONTRIBUTING.md to document that pre-push runs 'npm run ci-verify:fast' (non-building checks) and CI runs 'npm run lint-plugin-check' (build+guard), and include the local commands to run the full CI verification when needed.

## LATER

- [ ] After helper files are reduced below the max-lines threshold and complexity lowered, enable ESLint max-file/max-lines as blocking checks in CI and adjust rules incrementally if needed.
- [ ] Add a CI check or lightweight script that detects tests mutating process globals and flags missing restore code to prevent regressions.
- [ ] Gate debug logging behind NODE_ENV/DEBUG by introducing a small logger wrapper and suppressing debug output in CI builds to reduce noise (do this incrementally).
- [ ] Implement the coverage-delta PR check and scheduled dry-aged-deps workflow from earlier LATER tasks once parity and test isolation are stable.
- [ ] Write an ADR documenting the decision: pre-push runs non-building fast checks; CI runs the full build+guard; include rationale and the guard script responsibilities.
