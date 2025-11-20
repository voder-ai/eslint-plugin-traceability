<scratchpad>
Goal: implement the NEXT PRIORITY from the assessment: remediate three deficient areas (CODE_QUALITY, DOCUMENTATION traceability, SECURITY). We must make the NOW action the most important single actionable step. The oversized file src/rules/require-story-annotation.ts appears central: it exceeds max-lines rule, houses many missing branch annotations, and refactoring it will directly help code quality and make it easier to add missing @story/@req annotations. Refactor also reduces cognitive size so documentation work is easier. Security work (dry-aged-deps integration, audit capture, spawnSync shell:true removal) is independent but should follow core code quality first because traceability check and lint must pass before CI.

NOW must be exactly one specific action (no multiple commands). So pick: "Refactor the oversized file to split responsibilities so the main file is <= 300 lines and add annotations for moved functions/branches". That is one task. NEXT will contain the step-by-step plan: branch, implement, run local checks, commit message examples, then run traceability-check and fix remaining missing annotations across files, then integrate dry-aged-deps into CI and replace shell:true usage, run npm audit --json, apply safe upgrades or create ADR documenting accepted risk, move heavy checks out of pre-push, enforce check:traceability in CI. After each item: commit, run checks, push, wait for CI run.

We must obey constraints: no interactive instructions, don't touch .voder or prompts. Also must instruct to avoid starting server. Include commit messages using Conventional Commits. Emphasize single-item-at-a-time workflow and CI monitoring.

Be concise but precise.
</scratchpad>

## NOW
Refactor src/rules/require-story-annotation.ts so the file is reduced to <= 300 lines by extracting helper functions / branch-handling logic into one or more new modules under src/rules/helpers/ (or src/utils/), and add the required @story/@req JSDoc annotations for any functions/branches moved during the refactor.

## NEXT
Follow these steps in order. Complete one step, then run the local quality checklist, commit with a Conventional Commit message, push, and wait for CI to pass before moving to the next step.

1. Create a working branch for the refactor
   - git switch -c refactor/split-require-story-annotation

2. Implement the refactor described in NOW
   - Extract focused helpers (parsing, branch inspection, reporting) into new files (e.g., src/rules/helpers/annotation-parsers.ts, src/rules/helpers/annotation-branches.ts).
   - Keep src/rules/require-story-annotation.ts as the high-level coordinator (<300 lines) that imports the helpers.
   - Add comprehensive @story and @req JSDoc annotations to each new function and to the branch blocks you moved, following the project's traceability format.
   - Commit: refactor: split require-story-annotation into smaller modules and add @story/@req annotations

3. Run the local quality-check checklist (before push)
   - npm run build
   - npm run type-check
   - npm run lint -- --max-warnings=0
   - npm test
   - npm run format:check
   - npm run duplication
   - npm run check:traceability
   - If any check fails, fix immediately and recommit. Use targeted fix commits (fix:, style:, test:) as appropriate.

4. Push the branch and monitor CI
   - git push --set-upstream origin refactor/split-require-story-annotation
   - Wait for CI (CI/CD Pipeline) to run. If CI fails, read logs, fix root cause, commit and push again.

5. Complete remaining traceability remediation
   - Run scripts/traceability-check.js and review scripts/traceability-report.md.
   - For each file/function/branch reported as missing annotations (prioritize remaining items in src/rules/require-story-annotation.ts and src/utils/branch-annotation-helpers.ts):
     - Add precise @story and @req annotations referencing the specific story files in prompts/ or docs/stories/.
     - Prefer small, focused commits per file: chore(docs): add @story/@req to src/XYZ.ts
   - After each file commit run the quality-check checklist and push; wait for CI to pass.

6. Integrate dry-aged-deps into CI and capture npm audit output
   - Add an npm script: "safety:deps": "npx dry-aged-deps --format=json > ci/dry-aged-deps.json || true"
   - Add a CI workflow step (quality-and-deploy job) that runs the script and uploads ci/dry-aged-deps.json as an artifact (run if: always()).
   - Commit: chore(ci): add dry-aged-deps check and artifact upload

7. Replace shell:true usage and make audit reproducible
   - Update scripts/generate-dev-deps-audit.js to call spawnSync without shell (spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' })) and make the script write JSON to ci/npm-audit.json.
   - Commit: fix(security): remove shell:true from generate-dev-deps-audit and output json to ci/npm-audit.json
   - Run node scripts/generate-dev-deps-audit.js locally to produce ci/npm-audit.json, review contents.

8. Run npm audit --json (locally or in CI) and reconcile vulnerabilities
   - Locally: npm audit --json > ci/npm-audit.json
   - Inspect ci/npm-audit.json and the dry-aged-deps output to determine if dry-aged-deps lists safe upgrades.
     - If dry-aged-deps suggests safe updates, apply them (one package per commit), run quality-check, commit with chore(deps): upgrade X per dry-aged-deps, push, and verify CI.
     - If no safe upgrade exists, create an ADR documenting why the vulnerability is accepted and mitigation plan and commit it under docs/decisions/ (docs/decisions/adr-xxxx-accept-dev-dep-risk.md).
       - Commit: docs: ADR accept dev-dep vulnerability GHSA-xxxx - rationale & mitigation

9. Remove heavy/slow checks from pre-push and keep them in CI
   - Modify .husky/pre-push to remove or shorten heavy checks (npm audit, long duplication runs) and leave fast checks (build, type-check, tests, lint).
   - Ensure CI still runs the full heavy checks.
   - Commit: chore(ci): move heavy checks out of pre-push into CI to speed developer workflow

10. Finalize traceability and code-quality policy enforcement
    - Ensure npm run check:traceability is included and enforced in CI (already added earlier; confirm).
    - Re-run scripts/traceability-check.js; when it reports zero missing functions and branches, commit the regenerated scripts/traceability-report.md.
    - Commit: chore: regenerate traceability-report after completing annotations

## LATER
After the NEXT items are complete and CI is stable, perform longer-term hardening and automation:

- Enforce max-lines in CI as a blocking rule (eslint rule already present — create a CI job that fails on max-lines violations if not already enforced).
  - Commit: chore(ci): enforce eslint max-lines rule in CI

- Add a scheduled dry-aged-deps job in .github/workflows to run daily/weekly and automatically open PRs (or report) when safe updates are available.
  - Commit: chore(ci): schedule dry-aged-deps run weekly and upload report

- Add CONTRIBUTING.md snippet with exact @story/@req annotation examples and the local reproduction commands (include the NOW reproduction command), so future contributors add annotations correctly.
  - Commit: docs: add traceability annotation guidance to CONTRIBUTING.md

- Add a small npm script test:ci:debug that runs the exact CI-reproducible test command and writes outputs to ci/ (for developer convenience).
  - Commit: chore(scripts): add test:ci:debug to package.json

- Periodically review pre-push hook contents and keep it fast (<2 minutes). If needed, add an opt-in heavier-check script developers can run pre-push manually.

Notes / Process rules to follow while executing the plan
- Single-change principle: make each change small and focused. After finishing each item:
  1) Run the full quality-check checklist locally (build, type-check, lint, tests, format:check, duplication, check:traceability)
  2) Commit using Conventional Commits
  3) Push and wait for CI to run and pass
  4) Only then move to the next item
- Never modify files in .voder/ or prompts/ directories.
- Do not introduce interactive steps; all scripts must be non-interactive and write artifacts to ci/.
- Use ADRs (docs/decisions/) to document any security acceptance decisions or deviations from standard upgrade flow.

If you want, I can:
- produce a concrete split suggestion (file outlines and example function extractions) for src/rules/require-story-annotation.ts to accelerate the refactor, or
- create the branch and make the initial extraction commit (small change), run the local checks, and open a PR for review.

Which do you want me to do next: generate the concrete extraction plan (file-by-file outline) or create the initial refactor commit?