# CODE_QUALITY Non-Core / Excluded Areas

_Last updated: 2025-12-05_

This document complements `docs/code-quality-core-review-scope.md` by
highlighting **large or auxiliary directories** that are usually **out of
scope** for focused CODE_QUALITY reviews.

The intent is to help both humans and automated tools avoid wasting limited
context on files that are not part of the core implementation surface when
running slice-based assessments.

## Directories typically excluded from CODE_QUALITY

When running CODE_QUALITY with tight context limits, you can safely exclude
the following directories and file categories (relative to the repo root):

1. `docs/`
   - Rationale: user and internal documentation are covered by the
     Documentation assessment pipeline.
   - Exception: if you are specifically assessing documentation quality, use
     the documentation-focused tooling instead of CODE_QUALITY.

2. `.voder/`
   - Rationale: this directory contains assessment history, progress logs, and
     machine-generated reports. It is **input to** assessment, not part of the
     implementation itself.
   - It is intentionally ignored by ESLint via `eslint.config.js`.

3. `ci/`, `jscpd-report/`, and other CI artifacts
   - Rationale: these directories hold generated reports from CI runs and are
     not part of the source of truth for the plugin.
   - They are explicitly ignored in `.gitignore` and enforced by
     `scripts/check-no-tracked-ci-artifacts.js`.

4. `coverage/`, `coverage-tmp/`, and Jest output JSON files
   - Rationale: test coverage data is a **result** of tests, not part of the
     implementation.

5. `lib/`, `dist/`, `build/`
   - Rationale: compiled artifacts produced by TypeScript or bundlers.
   - CODE_QUALITY should always target TypeScript sources under `src/` and
     associated tests under `tests/`, never generated output.

6. `node_modules/`
   - Rationale: third-party dependencies are managed via separate dependency
     and security assessments; they are not maintained by this project.

7. `.github/`
   - Rationale: CI workflows are validated by dedicated CI/CD checks and
     `actionlint`; they are secondary for CODE_QUALITY unless you are
     explicitly reviewing CI configuration.

## Large but secondary code areas

The following directories **contain project-maintained code** but are **not
part of the minimal core** for CODE_QUALITY. Prefer to include them **only
when additional context budget is available**:

1. `src/maintenance/` and `tests/maintenance/`
   - Maintenance API and CLI implementation and tests.
   - High value for operational behavior, but secondary to `src/rules` and
     `src/utils` when context is limited.

2. `tests/integration/`
   - End-to-end CLI and ESLint integration tests.
   - Useful for holistic review but can be relatively large and are well
     covered by automated test runs.

3. `tests/fixtures/`
   - Static fixture trees used by tests (e.g. `tests/fixtures/stale`,
     `tests/fixtures/update`).
   - Often verbose and repetitive; reviewing a representative subset is
     usually sufficient if needed at all.

4. Tooling scripts under `scripts/`
   - Node-based helpers used by CI (audit, safety checks, duplication, etc.).
   - Already exercised heavily via `npm run ci-verify:full` and
     `npm run security:secrets`.

## Practical guidance for assessors

When preparing a CODE_QUALITY run:

1. **Start from the core scope** in `docs/code-quality-core-review-scope.md`.
2. Only add secondary areas from the list above if:
   - The tool/model has spare context after loading all core files; or
   - You have a specific review goal (for example, focusing on maintenance CLI
     safety).
3. Avoid ever loading excluded/generated directories listed in the first
   section for CODE_QUALITY—they add noise without improving the assessment.

By following these scoping rules, future CODE_QUALITY runs can stay within
context limits while still targeting the most important parts of the
codebase.
