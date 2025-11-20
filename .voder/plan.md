## NOW
Refactor src/rules/require-story-annotation.ts so the file is reduced to ≤ 300 logical lines by extracting helper functions and branch-handling logic into one or more new modules under src/rules/helpers/ (or src/utils/) and add the appropriate @story and @req JSDoc annotations to every function and branch moved during that refactor.

## NEXT
(Tasks to perform after the NOW refactor is applied; each item is a focused file/CI/documentation change)

1. Finish traceability remediation
   - Run the repository traceability scanner (scripts/traceability-check.js) and update all remaining missing @story/@req annotations reported (priority: files under src/rules/ and src/utils/).
   - For each fixed file add concise, parseable JSDoc @story and @req tags at function-level and for any conditional branches that implement requirements.

2. Add targeted unit tests for uncovered branches
   - Create new Jest tests that exercise the conditional branches introduced by the refactor (helpers and coordinator). Focus on the branch cases that previously had low coverage so branch coverage rises above project thresholds.

3. Make dependency-audit output reproducible and CI-friendly
   - Add an npm script (package.json) named safety:deps that runs dry-aged-deps producing ci/dry-aged-deps.json (non-failing).
   - Add an npm script audit:ci that runs npm audit --json and writes ci/npm-audit.json (non-interactive JSON output).

4. Remove shell:true usage and reliably capture dev-audit JSON
   - Update scripts/generate-dev-deps-audit.js (or equivalent) to call child_process.spawnSync without shell:true, capture stdout/stderr as UTF-8, and write JSON to ci/npm-audit.json. Add JSDoc traceability annotations to the script.

5. Integrate dependency reports into CI artifacts
   - Add steps to the CI workflow to run the new safety:deps and audit:ci scripts and upload ci/dry-aged-deps.json and ci/npm-audit.json as artifacts for triage. Ensure the steps are non-interactive and produce artifacts even on partial failures so triage data is preserved.

6. Triage audit results and follow policy
   - If dry-aged-deps suggests safe upgrades, apply those upgrades one package at a time (small commits) following the project's dependency policy.
   - If no safe upgrade exists for a reported high-severity issue, author an ADR under docs/decisions/ (e.g., docs/decisions/adr-accept-dev-dep-risk-<id>.md) documenting:
     - the vulnerability id(s), rationale for acceptance, owner, and reassessment schedule
     - mitigations (runtime/workaround or CI gating) and the plan to remove the risk when upstream fixes exist

7. Shorten developer pre-push hooks
   - Replace or slim the heavy checks in .husky/pre-push (move long-running tasks such as full audit, long duplication scans, and full-duplication reports into CI). Leave quick developer checks (lint-staged, quick type-check) in pre-push to keep local hooks fast.

8. Regenerate and commit traceability report
   - After all annotation changes and tests are added, regenerate scripts/traceability-report.md and commit it so the repo reflects zero outstanding missing-function/missing-branch entries.

## LATER
(Improvements to stabilize and automate ongoing maintenance)

- Make dependency maintenance automatic
  - Add a scheduled workflow that runs safety:deps daily (or weekly) and opens informative PRs (or at least uploads reports) when dry-aged-deps finds safe updates.

- Enforce max-lines and file-size limits in CI as blocking checks
  - Ensure ESLint max-lines is enforced in a CI job (fail the run on violations) so future oversized files are prevented.

- Harden release-time dev-dependency handling
  - Evaluate semantic-release's bundled dev deps and, if needed, pin or replace packages to avoid bundling known-vulnerable transitive tooling; record any agreed residual risk in an ADR and re-evaluate each upstream patch.

- Add CONTRIBUTING guidance for traceability
  - Add a short CONTRIBUTING.md section with example @story/@req JSDoc snippets, branch/annotation conventions, and how to run the local traceability scanner.

- Secret handling follow-up
  - Rotate any exposed local API key found in ignored .env and update repository docs to require using a secret manager (CI secrets or local keyring). Add a short note in CONTRIBUTING to not place secrets in .env.example.

Notes / constraints respected
- This plan focuses on the NEXT PRIORITY from the assessment (code-quality and security remediation) and keeps the NOW step a single, highest-priority action.
- No branches are proposed (trunk-based flow), no interactive commands, no edits to .voder/ or prompts/, and no instructions to run CI/commit/push (those are handled automatically by your process).