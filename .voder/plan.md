## NOW

- [ ] Add a new repository script at scripts/check-no-tracked-ci-artifacts.js that fails when any files are tracked under ci/ (except files under .voder/ci/), implementing detection and a clear exit code and report.

## NEXT

- [ ] Execute the new scripts/check-no-tracked-ci-artifacts.js (via the project's npm script entrypoint) to list currently-tracked ci/ files so you have a report of files to relocate or untrack.
- [ ] Decide how to handle the reported tracked CI artifacts: either move them into .voder/ci/ (allowed and tracked) or remove/untrack them and add ci/ to .gitignore; implement the chosen approach with a small helper script scripts/move-ci-artifacts-to-voder.js if moving is chosen.
- [ ] Update the CI workflow (.github/workflows/ci-cd.yml) to write future CI artifacts into .voder/ci/ (or an external artifact store) and add a CI step that runs scripts/check-no-tracked-ci-artifacts.js early to fail if any misplaced tracked artifacts remain.
- [ ] Modify scripts/lint-plugin-check.js to prefer source-based validation (attempt to validate ./src/index via a safe analysis or a source-loading path) and only fall back to requiring built artifacts; mark it as CI-only strict guard and call it from CI full checks, not from local pre-push hooks. Add JSDoc @story/@req on the script.
- [ ] Harmonize package.json script names so pre-push calls ci-verify:fast and CI calls ci-verify (same entrypoints but FAST mode via environment variable), and add a short CONTRIBUTING.md/ADR entry documenting the FAST vs full parity decision.
- [ ] Start reducing test duplication incrementally: create tests/utils/shared-fixtures.ts and refactor one heavily duplicated test file to use it (one test file change per commit), repeating until duplication improves.

## LATER

- [ ] Add a CI-enforced policy (via scripts/check-no-tracked-ci-artifacts.js) that blocks PRs/pushes when ci/* files are tracked outside .voder/; optionally add an automated move-to-.voder action for misplaced artifacts.
- [ ] Progressively refactor remaining duplicated test logic into shared helpers or parameterized tests (one focused extraction per commit) until jscpd duplication is below the target threshold.
- [ ] Add a CI-only smoke-test that validates the built package artifact post-build (preserves the safety net but runs only in CI), and document why it is CI-only.
- [ ] Target modules with low branch coverage for additional tests (one module per small commit) to raise branch coverage and reduce execution risk.
- [ ] Re-evaluate pre-push runtime after these changes; if still too slow, introduce deterministic reduced-scope tests or caching for pre-push to guarantee acceptable developer feedback times.
