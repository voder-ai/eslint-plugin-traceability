# Improvement Plan

Focus area: Code Quality & Documentation Refinement
Priority: Foundation is acceptable (all dimensions ≥80%), but code-quality at 73% is weakest dimension. Functionality at 96.6% with minor gaps. Address quality issues before new features.

## NOW

- Refactor 4 files exceeding max-lines limit (branch-annotation-helpers.ts at 659, prefer-implements-annotation.ts at 658, valid-annotation-options.ts at 536, no-redundant-annotation.ts at 499). Extract cohesive modules to improve maintainability and reduce complexity. Target ≤450 lines per file.
  - Category: non-functional
  - Reason: code-quality dimension at 73% primarily due to complexity/size violations. Files exceeding limits by 46% indicate god object pattern. Addressing this improves readability, testability, and reduces duplication risk.
  - Success criteria: All source files ≤450 lines. Extracted modules have clear single responsibilities. All tests pass. No new linting errors. code-quality dimension rises to ≥80%.
  - Dimension: code-quality

## NEXT

- Remove 26 eslint-disable directives for traceability/valid-annotation-format in src/ files. Ensure plugin source code conforms to its own rules or document justified exceptions in configuration.
- Replace 3 deprecated eslint-env comments with modern ESLint flat config globals declarations.
- Update README line 133 link from internal docs/rules/ to user-facing documentation (user-docs/ or published site). Ensure all README links point to public resources.
- Update jsdocHasStory, commentsBeforeHasStory, leadingCommentsHasStory functions to check @supports in addition to @story. Align with scanLinesForMarker implementation.
- Change default auto-fix template from @story to @supports. Update tests and documentation to reflect @supports as primary annotation format.
- Push 4 commits currently ahead of origin/main to synchronize remote repository.

## LATER

- Create missing rule documentation file (docs/rules/require-test-traceability.md) to complete story 020.0
- Add explicit test coverage for edge cases in stories 002.0 (config error handling) and 004.0 (ternary/arrow/logical operators)
- Reduce code duplication from 4.16% to <3% by extracting shared patterns in require-story-visitors.ts and require-story-core.ts
- Enhance story 010.0 with explicit markdown section parsing instead of regex-based approach
- Complete Definition of Done checklists for stories with unchecked items (code review, integration testing)
- Investigate performance optimization opportunities for fs.readFileSync usage in hot paths
