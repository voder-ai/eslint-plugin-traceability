## NOW

- [ ] Identify the helper functions with the highest logical complexity in the rules and maintenance helpers and select the single worst offender as the first target for a small, behavior-preserving refactor that will reduce its complexity without changing external behavior.

## NEXT

- [ ] Refactor the selected high-complexity helper function into smaller, focused helpers while keeping behavior identical and ensuring all existing tests around that area continue to pass.
- [ ] Repeat the same analysis-and-refactor process for the next most complex helper functions until the key hotspots identified in the assessment have been simplified to an acceptable complexity level.
- [ ] Once the main helper hotspots are simplified, lower the configured complexity threshold in the linting rules to lock in the new standard without introducing violations.
- [ ] Review the user-facing documentation for the valid-annotation-format and related rules to locate any mismatches between documented defaults (such as story path patterns or examples) and the actual implementation, and update the docs to match real behavior.
- [ ] Scan the remaining examples and quick-start snippets to ensure they are consistent with the current default configuration and recently added auto-fix options, adjusting wording or paths where necessary.

## LATER

- [ ] Extend the complexity review to other parts of the codebase beyond the initially identified helpers, gradually tightening standards while keeping changes small and fully covered by tests.
- [ ] Consider introducing targeted unit tests around newly extracted helper functions to better document their behavior and guard against regressions as complexity is reduced.
- [ ] Review all rule and maintenance documentation in one pass to ensure terminology, option names, and defaults are consistently described, especially where recent features like auto-fix toggles and templates were added.
- [ ] After complexity and documentation have been tightened, reassess overall code quality metrics to determine if further ratcheting (such as stricter limits or additional structural rules) is both safe and beneficial.
