## NOW

Run the full test suite locally in a CI-reproducible way and capture verbose/structured Jest output so we can diagnose environment-specific or flaky failures.

Run this single command from the repository root (creates a ci/ folder with logs):
- mkdir -p ci && npm ci && npm run build && npm test -- --runInBand --detectOpenHandles --verbose --json --outputFile=ci/jest-output.json 2>&1 | tee ci/jest-full.log

(Exactly one action: reproduce the CI test run locally with verbose JSON output and save logs.)

## NEXT

After you have the captured logs (ci/jest-output.json and ci/jest-full.log), follow these steps in order until test execution stabilizes and the execution score rises to >= 90%:

1. Inspect the captured logs
   - Open ci/jest-full.log for the human-readable trace and ci/jest-output.json for structured results.
   - Look for:
     - tests that timed out or hang (no completion), open handles, or long-running child processes
     - failing tests and stack traces
     - environment-specific errors (ENOENT, permission, path differences)
     - deprecation or CLI warnings reported by Jest
   - Note test names (suite & test) and line numbers for failing or flaky entries.

2. Reproduce individual failures in isolation
   - For each failing/flaky test, run it locally with focused flags to capture more detail:
     - npm test -- --runInBand --testNamePattern="Exact test name or RegExp" --detectOpenHandles --verbose
   - If a test times out or has open handles, add --runInBand --detectOpenHandles --logHeapUsage to capture memory traces.

3. Fix the root cause(s), one fix per commit
   - For each failing/flaky test, apply the minimal change needed:
     - Fix environment assumptions (paths, temp dir usage) to use OS temp directories (os.tmpdir()).
     - Ensure tests clean up (close servers, clear timers, close file handles) in finally/afterAll.
     - Replace non-deterministic timing with deterministic mocks or use seeded randomness.
     - Avoid long-running child processes in tests; mock external calls or use short timeouts.
     - If a real concurrency issue exists, convert to single-threaded execution in the test or refactor the code under test.
   - Before committing each fix, run the local quality-check checklist:
     - npm run build
     - npm run type-check
     - npm test
     - npm run lint -- --max-warnings=0
     - npm run format:check
     - npm run check:traceability
   - Commit using Conventional Commits, e.g.:
     - fix(test): ensure temp-dir cleanup in X.test.ts
     - fix(test): close server in before/after hooks for Y.test.ts
   - Push and wait for CI to run.

4. If a failure cannot be quickly fixed, gather detailed diagnostic evidence and create a temporary, reversible mitigation
   - Add increased test timeout (only as a short-term measure) or skip an obviously flaky integration test with a tracked TODO and issue reference:
     - test.skip(...) with a link to an issue, or add a short-lived feature-flag in the test to run only locally.
   - Use Conventional Commit messages for these changes and include the issue reference:
     - chore(test): skip flaky X.test.ts — tracked in GH-1234
   - Immediately open an issue to permanently fix the skipped test and assign an owner.

5. Improve CI observability (one small change, commit when ready)
   - Add CI steps to upload artifacts so future runs surface the same logs automatically:
     - Upload ci/jest-output.json and ci/jest-full.log as job artifacts in .github/workflows/ci-cd.yml (use actions/upload-artifact@v4).
     - Use a Conventional Commit for this CI change: chore(ci): upload jest logs/artifacts for debugging
   - If CI uses multiple matrix jobs that can collide on artifact names, include matrix identifiers in artifact names.

6. Re-run full quality gates locally and in CI
   - After fixes, re-run the initial NOW command to regenerate ci/jest-output.json and ci/jest-full.log.
   - Push changes and verify CI run completes with tests passing and artifacts uploaded.
   - Track execution metric: repeat until CI job(s) run cleanly and the execution assessment target (>= 90%) is reached.

7. Validate environment parity
   - Confirm local Node/npm versions match CI (check package.json engines and CI setup).
   - If mismatch found, update CI or local dev setup (nvm, actions/setup-node) so both run the same Node version.

## LATER

Once execution is consistently stable and passing in CI (execution >= 90%), harden the test and CI environment to prevent regressions:

1. Add permanent diagnostics and automation
   - Add an npm script test:ci:debug that runs the command used in NOW and writes logs to ci/.
   - Add a CI artifact upload step (if not already added) for each test run to collect logs and coverage artifacts.

2. Reduce flakiness systematically
   - Convert integration tests that are flaky into faster, deterministic unit tests where feasible.
   - Introduce a test retry policy for known non-deterministic external tests (use jest-circus retry or a controlled wrapper) but only for a short timeframe while root-cause fixes are scheduled.

3. CI test configuration improvements
   - Align Jest timeouts and resource limits between local and CI (jest.config.js testTimeout).
   - Consider adding a short smoke-test step that runs a small deterministic test suite to give fast feedback before longer tests run.
   - Optionally add a nightly CI job that runs the full test matrix to detect flakiness early.

4. Add monitoring and alerts
   - Add a scheduled job to run the test suite weekly and open an issue/PR when failures arise.
   - Record flaky test history (simple JSON under .voder/ or docs) for trend analysis and prioritization.

5. Make fixes discoverable and maintainable
   - Document debugging steps and the "How to reproduce CI locally" command in CONTRIBUTING.md (include the exact NOW command).
   - Add a short checklist for triaging test failures so future engineers follow the same reproducible process.

Why this plan matches the NEXT PRIORITY
- The NOW action directly reproduces the CI test run locally with verbose/structured output so we can diagnose flakes and environment-specific failures.
- NEXT lists focused, incremental remediation steps (inspect logs, isolate failures, fix one at a time, validate locally and in CI, and ensure logs are uploaded) and preserves the project's quality-first workflow (run full local checks before committing and use Conventional Commits).
- LATER hardens CI & tests to prevent regressions and ensures long-term execution stability so the functionality assessment can be completed.

If you want, I can:
- Convert the diagnostic commands into a small npm script and commit the recommended CI artifact upload change (one file change per commit, with the required checks), or
- Continue with the next step after you run the NOW command and share ci/jest-full.log and ci/jest-output.json.