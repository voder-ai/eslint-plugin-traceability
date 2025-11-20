## NOW

- [ ] Rename the four coverage-oriented Jest test files under `tests/rules` that currently end with `.branches.test.ts` to behavior-focused names (for example: `require-story-core-edgecases.test.ts`, `require-story-helpers-edgecases.test.ts`, `require-story-io-edgecases.test.ts`, and `require-story-visitors-edgecases.test.ts`), updating any in-file titles or references that mention “branches” purely as coverage terminology.

## NEXT

- [ ] Scan the codebase for any references to the old `.branches.test.ts` filenames (e.g., in documentation, scripts, or comments) and update them to the new behavior-focused names so everything stays consistent.
- [ ] Remove generated CI/test artifact files that are currently tracked in git (such as `jest-output.json`, `jest-coverage.json`, `tmp_eslint_report.json`, `tmp_jest_output.json`, `ci/jest-output.json`, and `ci/npm-audit.json`) to clean the repository and reduce VERSION_CONTROL penalties.
- [ ] Fix and extend `.gitignore` so that Jest/ESLint output and CI report files (including `jest-output.json`, `jest-coverage.json`, temporary ESLint/Jest JSON files, and either the whole `ci/` directory or specific report files) are properly ignored, correcting the malformed `jest-output.json# Ignore CI artifact reports` line into a valid ignore rule plus a separate comment.
- [ ] Verify that any scripts or documentation that currently read Jest or CI JSON artifacts are updated to use a dedicated, gitignored reports directory (or to regenerate artifacts on demand) so workflows keep functioning without committing generated files.

## LATER

- [ ] Add a brief note to the testing section of `CONTRIBUTING.md` stating that test filenames must describe the behavior or feature under test (not coverage intent such as “branches”), reinforcing the new convention for future contributors.
- [ ] Optionally introduce a dedicated gitignored directory (for example `reports/` or `artifacts/`) for local Jest/ESLint/CI JSON outputs and adjust helper scripts to write there, standardizing handling of transient test and CI data.
- [ ] After these changes have been in place, rerun or request an updated implementation assessment to confirm that both TESTING and VERSION_CONTROL now exceed the 90% threshold so that the FUNCTIONALITY assessment can proceed.
