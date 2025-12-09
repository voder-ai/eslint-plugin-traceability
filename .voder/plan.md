## NOW

- [ ] Eliminate the remaining inline lint rule suppressions from one specific helper or rule module by adjusting its function signatures or extracting small utilities so that the file complies with all enabled lint rules without local disables while keeping its runtime behavior and public API exactly the same.

## NEXT

- [ ] Apply the same suppression-removal refactoring approach to all other helper and rule modules that still rely on inline lint disables so that the entire ruleset is cleanly lint-compliant without local suppressions.
- [ ] Refactor small repeated logic fragments in helper and rule modules into shared internal utilities so that the duplication checker reports fewer clones while preserving rule behavior and configuration contracts.

## LATER

- [ ] Gradually tighten file-level size limits in the linting configuration and, when a file exceeds the new threshold, split cohesive groups of helpers into separate modules so each file remains focused and easy to navigate.
- [ ] Broaden performance-focused tests for function and branch annotation rules against large synthetic projects and update the related stories with concrete timing expectations derived from those measurements.
- [ ] After the external GitHub issue related to test callback handling has been closed with the required release-referenced comment, update the function-annotations story checklist to mark the issue-resolution acceptance and Definition of Done items complete and note the release that contained the fix.
- [ ] Extend internal development documentation to summarize the finalized lint thresholds, preferred refactoring patterns, and the ratcheting strategy so future contributors can continue improving code quality metrics consistently over time.
