## NOW
Update the pre-push Git hook so it runs the exact same traceability check as CI: edit .husky/pre-push to invoke `npm run check:traceability` as the very first command (before any build/test/lint steps), commit the change with "chore: run check:traceability in pre-push for parity".

## NEXT
1. Remediate missing traceability annotations incrementally, one small file (or closely-related file group) per commit:
   - Pick the next highest-impact file(s) from scripts/traceability-report.md (suggested priority: src/rules/require-story-annotation.ts, src/utils/branch-annotation-helpers.ts, src/utils/storyReferenceUtils.ts).
   - Edit the file(s) to add JSDoc-style `@story` and `@req` tags for every function and for each significant branch (if/else, switch, loops, try/catch) reported in scripts/traceability-report.md. Follow the project's exact annotation format.
   - After editing a small batch (1 file or a cohesive small group) run the full local quality suite in this order:
     - npm run build
     - npm run type-check
     - npm test
     - npm run lint -- --max-warnings=0
     - npm run format:check
   - Commit each small, passing change with a Conventional Commit message like:
     - chore: add @story/@req annotations to src/rules/require-story-annotation.ts
   - Push and monitor CI. If CI fails, fix only the failing step locally, re-run the local suite, commit and push again.
   - Repeat this cycle until scripts/traceability-report.md reports zero missing functions/branches.

2. Make traceability output visible to reviewers in CI:
   - Add a CI step that uploads scripts/traceability-report.md as a workflow artifact whenever the traceability check runs (and especially on failure), to avoid forcing reviewers to run checks locally.
   - Commit with: chore: upload traceability report artifact on CI run.

3. Harden local/CI parity (complementing NOW):
   - Verify .husky/pre-push contains the identical command(s) and arguments used by the CI traceability step (exact `npm run check:traceability`) and that the CI runs the same node/npm version.
   - Commit with: chore: ensure pre-push and CI use identical traceability command.

4. Update CI triggers & publishing behavior to meet continuous-deployment policy:
   - Modify .github/workflows/ci-cd.yml so publishing/deployment runs automatically in the same workflow that performed the quality gates and only on push to main:
     - Remove or split non-publish triggers (remove `pull_request` and scheduled `cron` triggers from the publish/complete workflow or ensure publish steps are conditional on `github.ref == 'refs/heads/main'` and `github.event_name == 'push'`).
     - Add a publish step that runs immediately after successful quality gates and that performs automatic publishing/deployment (for npm packages: `npm publish --access public` or a controlled publish step using the project's existing release tooling) using the repo's NPM_TOKEN. Ensure this step runs without manual approval.
   - If using semantic-release and it prevents publishing every commit, either:
     - Temporarily add an unconditional publish step (as above) to satisfy the "publish on every main push" requirement, or
     - Reconfigure release tooling so it performs automated publish on every successful push-to-main (document trade-offs).
   - Commit with: chore: restrict CI triggers to push:main and add automatic publish step after quality gates.
   - Test by pushing a no-op commit (e.g., docs change) to main and monitoring the workflow to confirm the publish step runs automatically when quality gates pass.

5. Operational rules for remediation work:
   - Always make small commits (one file or small group) and run the full local quality suite before pushing.
   - Use Conventional Commits for every change; prefer `chore:` or `refactor:` for annotation work.
   - Do not remove or modify prompts/, prompt-assets/, or .voder/ directories during this work.

## LATER
1. Enforce traceability programmatically:
   - Implement/enable an ESLint rule (or extend the existing plugin) that enforces per-function and per-branch `@story`/`@req` annotations and run it in CI. Add unit tests for the rule.
   - Add a fast unit/integration test that runs scripts/traceability-check.js against representative fixtures to catch regressions.

2. Developer ergonomics & documentation:
   - Add CONTRIBUTING.md section and examples showing the required annotation format and the local remediation checklist (how to run `npm run check:traceability`, what to annotate, how to name commit messages).
   - Add a small helper script or code action snippets (placeholders only, no external tools) to speed up adding JSDoc annotations.

3. Pre-commit/pre-push performance & safety:
   - Keep pre-commit hooks fast (Prettier + lint-staged). Keep heavy checks (full type-check, full test suite) in pre-push.
   - Add a parity-check CI job that compares the commands run by .husky/pre-push and CI and fails if they diverge.

4. Cleanups and policy items:
   - Replace any remaining file-wide `// @ts-nocheck` with targeted `// @ts-expect-error` and document each exception.
   - Once traceability is fully remediated and enforced, remove scripts/traceability-report.md from source if you prefer and rely on CI artifacts instead, or keep it regenerated by CI as an artifact.

Notes / Constraints
- Every code change must be small, tested locally (build/type-check/test/lint/format), and pushed only when CI is green.
- All commands are non-interactive. Do not modify files under prompts/ or .voder/.
- Use Conventional Commit messages and ensure pre-push hooks and CI remain synchronized.