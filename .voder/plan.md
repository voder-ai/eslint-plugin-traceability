## NOW

- [ ] Modify .husky/pre-push so it invokes a new fast-local verification script (ci-verify:fast) that enforces a developer-friendly parity subset (type-check, lint with plugin enforcement, check:traceability, duplication, and a targeted fast unit test subset) instead of the current slimmed checks.

## NEXT

- [ ] Add canonical npm script 'ci-verify' that composes CI steps (build, type-check, lint --max-warnings=0, check:traceability, duplication, test (full), format:check) implemented as composable scripts for reuse.
- [ ] Add npm script 'ci-verify:fast' that runs the fast-local subset: type-check, lint (with plugin loaded from src), check:traceability, duplication, and a targeted jest subset (e.g., --testPathPattern=tests/unit --runInBand).
- [ ] Change ESLint plugin loading to prefer source during development (require('./src/index') when present or NODE_ENV !== 'production') and add a lint-time guard that throws a clear error if plugin rules are missing.
- [ ] Replace eval usage in scripts/smoke-test.sh with a safe direct invocation or Node wrapper that spawns npm install without shell expansion, preserving existing behavior.
- [ ] Run the traceability scanner to confirm zero missing annotations; if flags remain, add per-function/branch JSDoc at the exact locations reported.
- [ ] Extract uncovered branch ranges from latest coverage JSON and produce a concise checklist mapping file -> branch line ranges for src/rules/helpers/*.
- [ ] Create focused Jest tests (one per logical branch group) to cover the uncovered branches in require-story-helpers.ts, require-story-io.ts and require-story-visitors.ts; ensure each test has @story/@req JSDoc header and tests one behavior per test.
- [ ] Re-run coverage; when helper module branch coverage meets policy, restore stricter global branch coverage threshold in jest.config.js and commit.
- [ ] Update CONTRIBUTING.md documenting ci-verify and ci-verify:fast usage, pre-push vs CI parity rationale, and when to run full ci-verify locally.

## LATER

- [ ] Add a scheduled weekly workflow that runs dry-aged-deps and opens informative PRs or uploads artifacts when safe updates are available.
- [ ] Add a coverage-delta PR check that warns when branch coverage drops more than a small threshold (e.g., >1%).
- [ ] Gate debug logging behind NODE_ENV=test or a DEBUG env var to reduce CI noise.
- [ ] Enforce ESLint max-file/max-lines as blocking checks in CI after helper tests and parity fixes.
- [ ] If any dev-dep vulnerabilities remain accepted, document ADRs with owners and reassessment dates and add audit-filter configuration only if 'disputed' incidents appear.
