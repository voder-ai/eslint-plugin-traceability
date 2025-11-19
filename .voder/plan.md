## NOW
Create and run a traceability-check script that scans the src/ tree and produces a report of every function and significant branch missing JSDoc @story and @req annotations (write output to scripts/traceability-report.md).

## NEXT
1. Triage the generated traceability report and prioritize files by impact. Start with the key files noted in the assessment:
   - src/rules/require-story-annotation.ts
   - src/utils/annotation-checker.ts
   - src/utils/storyReferenceUtils.ts
   - src/index.ts
   - src/maintenance/* and other src/utils/* files flagged by the report
2. For each file in priority order:
   - Add parseable JSDoc @story and @req annotations to every exported function and to significant branches per the project's traceability format (use exact story file paths from prompts/ or docs/stories/ and a short requirement description).
   - Commit each file change individually using the Conventional Commit format, e.g.:
     - chore: add @story/@req annotations to src/utils/annotation-checker.ts
   - After each commit, run the full local quality checks before pushing:
     - npm run build
     - npm test
     - npm run lint -- --max-warnings=0
     - npm run type-check
     - npm run format:check
   - Push the commit and monitor the CI workflow run. If CI fails, fix the specific failing step and repeat the local checks, commit and push.
3. After annotating all priority files, run the traceability-check script again and resolve any remaining missing annotations until the report is clean (no @story/@req omissions).
4. Re-run the full local quality suite and ensure code-quality and testing metrics rise above 90%. If code-quality or tests remain under 90%, address the specific issues reported by lint/test/coverage tools (for example: remove or justify @ts-nocheck in tests, fix ESLint complexity inconsistency, rename problematic test files) following the same commit→checks→push flow.

## LATER
1. Automate traceability enforcement:
   - Add the traceability-check script to package.json (e.g., "check:traceability") and wire it into CI early in the pipeline to fail fast on missing/malformed annotations.
   - Add an ESLint rule/run-step (or extend the existing plugin) that enforces per-function/branch @story/@req presence/format and fail CI on violations.
2. Update developer docs:
   - Add an example section to CONTRIBUTING.md and docs/developer-traceability.md showing correct JSDoc examples for functions and branches (copy-paste ready).
   - Add a short checklist item for PRs to include traceability annotations.
3. Add tests and reporting:
   - Add a small unit test (test:) that validates the traceability-check script works on representative files and that new violations are detected automatically.
   - Save the traceability-report.md as a CI artifact on failures to aid reviewers.
4. Clean-up & follow-ups to reach final priority targets:
   - Remove or replace file-level suppressions (e.g., // @ts-nocheck) with targeted // @ts-expect-error and an issue reference where unavoidable.
   - Normalize the ESLint complexity configuration anomaly and rename any test files that break naming policy.
   - Once traceability is enforced and code-quality/tests are >90%, request a full functionality assessment to proceed with the next project milestones.

Notes / Constraints:
- Follow the incremental commit/check/push pattern: commit one logical change at a time, run local quality gates, push, and verify CI passes before continuing.
- Use Conventional Commits; for these changes prefer chore: (internal task) unless they change user-visible behavior.
- Do not modify prompts/, .voder/ or other protected directories.