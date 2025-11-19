The previous plan was incorrect because src/rules/require-story-annotation.ts was already updated in the recent work. Below is the corrected plan that does not repeat already-completed work and keeps the NEXT PRIORITY (traceability remediation) as the central focus.

## NOW

Edit src/maintenance/report.ts to add JSDoc @story and @req annotations to every exported/public function and add branch-level inline comments (// @story ... // @req ...) for each branch (if/else, for/of, switch, try/catch) flagged by scripts/traceability-report.md; then run the full local quality-check checklist and commit the single change with the message:
chore: add traceability annotations to src/maintenance/report.ts

(Only this single file change and commit now — run checks locally before committing and push once green.)

## NEXT

After the NOW commit is pushed and CI passes, continue incremental traceability remediation using a repeatable, one-file-per-commit workflow:

1) Use scripts/traceability-report.md to select the next highest-impact file (suggested order):
   - src/maintenance/detect.ts
   - src/utils/storyReferenceUtils.ts
   - src/utils/other helper files flagged by the report
   - remaining src/rules/* files still showing missing branches
2) For each selected file (one file per commit):
   - Add JSDoc @story and @req to every exported/public function.
   - Add branch-level inline comments (// @story ... // @req ...) for each branch named in the traceability report.
   - Keep code behavior identical; do not rename functions or change logic.
   - Run the local quality-check checklist before committing:
     - npm run build
     - npm run type-check
     - npm test
     - npm run lint -- --max-warnings=0
     - npm run format:check
     - npm run check:traceability
   - Commit using a Conventional Commit (example):
     chore: add @story/@req annotations to src/maintenance/detect.ts
   - Push and wait for CI to pass before proceeding to the next file.
3) After every 3–5 commits, run npm run check:traceability and verify the report's missing counts decline. If branch counts plateau, open the exact report entries and add inline comments at the identified line numbers.
4) When the report shows functions missing = 0 and branches missing = 0 (or the agreed target), commit the regenerated scripts/traceability-report.md with:
   chore: update traceability report

## LATER

After the traceability report reaches the target (zero or agreed threshold), implement systemic protections and contributor ergonomics:

1) Enforcement
   - Enable or implement an ESLint rule that enforces per-function and per-branch @story/@req annotations and add unit tests for it; make it a blocking CI gate.
2) Contributor docs & editor support
   - Add CONTRIBUTING.md Traceability checklist and provide copy/paste JSDoc templates and VS Code snippets for @story/@req insertion.
3) CI observability & automation
   - Ensure CI uploads scripts/traceability-report.md as an artifact and add a scheduled job (daily/weekly) that runs npm run check:traceability and opens an issue/PR when counts increase.
4) Local developer ergonomics
   - Add a fast pre-commit traceability check that only scans changed files to avoid blocking developers with full-suite runs on every commit.
5) Ongoing maintenance
   - Add the traceability-check run to maintenance sprints (quarterly) and include the traceability report in release review checklists.

Rules to follow while executing this plan
- One focused file change per commit.
- Always run the full local quality-check checklist before committing.
- Use Conventional Commits; use chore: for traceability edits.
- Do not modify files under prompts/, prompt-assets/, or .voder/.
- Do not commit secrets or run interactive commands.