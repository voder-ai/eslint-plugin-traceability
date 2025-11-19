## NOW

Add a package.json script named "check:traceability" with the command: node scripts/traceability-check.js

## NEXT

1. Add the new script into CI as a fail-fast quality gate:
   - Modify .github/workflows/ci-cd.yml to run npm run check:traceability as the very first step in the quality job (before build/test/lint). Commit with: chore: add check:traceability CI step.
2. Run the traceability check locally and remediate results incrementally:
   - Locally run npm run check:traceability.
   - For each reported file, add the required JSDoc @story/@req annotations (one or a small group of files per commit).
   - After each commit run the full local quality suite before pushing:
     - npm run build
     - npm run type-check
     - npm test
     - npm run lint -- --max-warnings=0
     - npm run format:check
   - Push and monitor the CI run; if CI fails, fix only the failing step, repeat local checks, commit and push.
3. Make the traceability-check visible to reviewers:
   - Persist scripts/traceability-report.md as a CI artifact on failure so reviewers can see details without running locally. Commit with: chore: upload traceability report on CI failure.

## LATER

1. Enforce traceability via lint/tests:
   - Implement or enable an ESLint rule (or extend existing plugin) that enforces per-function/@branch @story/@req annotations and run it in CI.
   - Add a unit test validating scripts/traceability-check.js against representative fixture files.
2. Improve developer ergonomics & docs:
   - Add a CONTRIBUTING.md section describing the traceability annotation format, how to run npm run check:traceability, and the local pre-push checklist.
   - Add a pre-push hook (husky) or lint-staged config to run npm run check:traceability locally before pushing large changes (keep hooks fast and incremental).
3. Cleanup & follow-ups:
   - Replace any remaining file-level suppressions (e.g., // @ts-nocheck) with targeted // @ts-expect-error and an issue reference where unavoidable.
   - Rename any test files that violate naming policy and adjust tests accordingly.
   - Once traceability is enforced and CI is stable, request a full functionality assessment to continue roadmap work.

Constraints/Notes
- Follow the incremental commit → local checks → push → monitor CI flow for all changes.
- Do not modify prompts/, prompt-assets/, or .voder/.
- Use non-interactive commands only and Conventional Commits (chore: for infra, style: for formatting).