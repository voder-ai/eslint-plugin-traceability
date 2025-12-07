## NOW

- [ ] Analyze the remaining error-reporting helper code in the core story-reporting module to pinpoint any residual duplication or overly complex patterns and decide the next minimal refactor that preserves existing behavior while simplifying the implementation.

## NEXT

- [ ] Introduce a small, focused helper or two in the core story-reporting module to encapsulate the shared construction of missing-story report data so that the remaining duplicated logic in the existing reporting functions is removed without changing what ESLint users observe.
- [ ] Review the existing tests that exercise the core story-reporting behavior and add any missing cases needed to ensure the new helpers and error-resilience paths are fully covered, including scenarios where dependencies throw but linting continues safely.
- [ ] Re-evaluate the updated core story-reporting helpers for duplication and complexity to confirm that the originally identified duplicated region has been eliminated and no new complex or overlapping logic has been introduced.

## LATER

- [ ] Design a small sequence of extractions to break the oversized branch-annotation helper module into a few cohesive utilities grouped by concern, such as generic comment scanning, catch-specific helpers, and else-if–specific helpers, while maintaining current behavior and traceability annotations.
- [ ] After the branch-annotation helpers are decomposed, revisit the linting thresholds for maximum lines per file and per function in the rules and helpers slice to modestly tighten them in line with the code-quality ratcheting plan.
- [ ] Identify any remaining untested defensive branches or rare error paths in core helper modules and add targeted characterization tests that lock in their current behavior before any further refactoring.
