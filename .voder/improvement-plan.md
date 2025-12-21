# Improvement Plan

Focus area: Foundation gate failures blocking functionality assessment
Priority: Three dimensions (version-control 30%, dependencies 40%, code-quality 73%) are below the 80% threshold, preventing functionality assessment. Version-control has the largest gap (-50%) due to missing pre-commit/pre-push hooks and uncommitted changes. Addressing this first will improve development workflow and unblock the foundation gate.

## NOW

- Install pre-commit and pre-push hooks to enforce quality gates, then commit the 2 modified files (src/maintenance/batch.ts, src/rules/helpers/valid-annotation-format-internal.ts) and 4 untracked .voder/ files. Fix the formatting issue in valid-annotation-format-internal.ts and remove the unused eslint-disable directive in src/maintenance/update.ts before committing.
  - Category: non-functional
  - Reason: Version-control dimension scores only 30% due to -60% penalties from missing hooks. Installing hooks prevents quality regressions and aligns with project requirement to never bypass pre-commit hooks. Uncommitted changes must be resolved to establish clean baseline.
  - Success criteria: Active pre-commit and pre-push hooks installed in .git/hooks/, working tree clean (no modified/untracked files outside .voder/), version-control dimension score ≥80%, formatting check passes, no unused eslint suppressions.
  - Dimension: version-control

## NEXT

- Upgrade @eslint/js from 9.39.1 to 9.39.2, @semantic-release/npm from 13.1.2 to 13.1.3, and eslint from 9.39.1 to 9.39.2. Run full test suite and quality checks after upgrade.
- Fix formatting issue in src/rules/helpers/valid-annotation-format-internal.ts (if not already fixed in NOW), remove unused eslint-disable directive in src/maintenance/update.ts, and refactor require-story-helpers.ts to reduce line count from 306 to ≤300 lines.
- Add @supports annotations to no-redundant-annotation.test.ts and valid-req-reference.test.ts to document which features/stories each test validates.

## LATER

- Refactor 5 additional files exceeding 450-line limit (branch-annotation-helpers.ts:659, prefer-implements-annotation.ts:658, require-story-core.ts:616, valid-annotation-options.ts:536, no-redundant-annotation.ts:499, valid-req-reference-helpers.ts:453) to improve maintainability
- Address code duplication in src utilities (branch-annotation-helpers, require-story-visitors, require-story-core) to reduce technical debt below 2% duplicated lines
- Add @story/@req/@supports annotations to require-traceability.ts to enforce consistent traceability documentation
- Create comprehensive requirements documentation in user-docs/ mapping user-facing features to satisfied requirements
- Fix malformed nested link in README line 134 for migration guide reference
- Review and reduce 28 eslint-disable directives in src/ to ensure no quality issues are hidden
