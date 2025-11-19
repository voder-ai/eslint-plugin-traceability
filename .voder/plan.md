The previous plan was not correct — it proposed adding annotations to src/rules/require-story-annotation.ts even though that file was already included in earlier mass-annotation work. I’ve corrected the plan so it does not repeat completed work and so the NOW action directly addresses one of the four NEXT PRIORITY remediation areas from the assessment (version-control cleanliness). Here is the corrected plan:

## NOW

Remove the generated test output file from version control and ignore it: git rm --cached jest-output.json; add 'jest-output.json' to .gitignore; commit the single change with the message:
chore: remove generated jest-output.json from git and add to .gitignore

(Do exactly this one specific repository change now.)

## NEXT

After the NOW commit is pushed and CI passes, proceed with these incremental remediation steps (one small change per commit; run full local quality suite before each commit; push and wait for CI to pass before the next):

1) Resume incremental traceability remediation (primary priority)
   - Use scripts/traceability-report.md to pick the next file flagged (one file or a very small cohesive group).
   - Suggested next targets (choose the highest-impact file currently reported missing in the report):
     - src/utils/branch-annotation-helpers.ts
     - src/utils/storyReferenceUtils.ts
     - then remaining src/rules/* files as reported
   - For each file:
     - Add JSDoc @story and @req to every exported/public function and to branches flagged by the report.
     - Keep changes minimal (one file per commit).
     - Run full local quality suite and commit with a Conventional Commit (e.g., chore: add @story/@req annotations to src/utils/branch-annotation-helpers.ts).
     - Push and verify CI passes before moving on.

2) Restore test guarantees and coverage visibility (secondary priority)
   - Fix tests that may leave temp resources:
     - Wrap temp dir setup/teardown in try/finally or afterEach/afterAll (start with tests/maintenance/detect-isolated.test.ts).
     - Commit each test fix separately (fix(test): ensure temp-dir cleanup in tests/maintenance/detect-isolated.test.ts).
   - Enable and publish coverage:
     - Ensure CI runs Jest with coverage and uploads coverage artifacts.
     - Locally generate coverage and raise tests where thresholds fail.
     - Commit CI change as ci: enable coverage reporting.

3) Remove/rotate local secrets and add secret-scan (security priority)
   - Replace real secrets in local .env with placeholders and rotate exposed tokens (do not commit real secrets).
   - Commit .env.example or placeholder changes: security: replace local .env secrets with placeholders and document rotation.
   - Add a lightweight secret-scan to CI/pre-push (e.g., trufflehog-lite or git-secrets) and commit: chore: add secret-scan to CI.

4) Continue VCS cleanups (version-control priority)
   - After removing jest-output.json, search for any other generated artifacts that are tracked and remove/ignore them (one file per commit).
   - Commit each: chore: remove <filename> from git and add to .gitignore.

5) Re-run traceability report and verify progress
   - After a set of annotation commits run npm run check:traceability, commit or upload the generated scripts/traceability-report.md per project policy.
   - Continue until the report shows the missing items reduced to target (aim for zero).

Local quality-check checklist to run before every commit
- npm run build
- npm run type-check
- npm test
- npm run lint -- --max-warnings=0
- npm run format:check
- npm run check:traceability

Operational rules while executing NEXT steps
- One small focused change per commit (one file or tightly related pair).
- Use Conventional Commits.
- Push and wait for CI to pass before starting next item.
- Do not modify prompts/, prompt-assets/, or .voder/.
- Do not commit real secrets.

## LATER

Once the four deficient areas reach acceptable levels, perform systemic improvements:

1) Enforce traceability automatically
   - Implement/enable an ESLint rule enforcing per-function and per-branch @story/@req annotations and add unit tests for it; make it a blocking CI step.

2) Documentation & contributor ergonomics
   - Add CONTRIBUTING.md Traceability remediation checklist and editor snippets/templates for inserting @story/@req JSDoc.

3) CI safety & observability
   - Ensure CI uploads traceability and coverage artifacts for reviewers and add a scheduled job to run npx dry-aged-deps for safe upgrades.

4) Secrets & security hardening
   - Make secret-scan mandatory in CI/pre-push, add secret-rotation docs, and require token rotation if secrets were exposed.

5) Housekeeping
   - Schedule periodic runs of scripts/traceability-check.js to detect regressions and document policy for scripts/traceability-report.md (artifact-only or tracked).

If you want me to make the NOW change (remove jest-output.json from git and add to .gitignore) now, confirm and I will perform that single change.