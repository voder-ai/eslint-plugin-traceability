## NOW

- [ ] Strengthen the test callback exclusion helper by updating its function signatures and parameters to use precise ESLint AST node types instead of untyped or loosely typed values, ensuring the behavior of excludeTestCallbacks and additionalTestHelperNames remains unchanged while making the helper fully type-safe and aligned with the function-annotation story requirements.

## NEXT

- [ ] Lower the maximum allowed non-comment lines per function in the linting configuration and split any functions that exceed the new limit into smaller, single-responsibility helpers so that all existing behavior and public APIs remain unchanged.
- [ ] Remove any remaining inline lint rule suppressions in helper and rule modules by simplifying function signatures, dropping unused parameters, or extracting shared utilities so that those files satisfy all enabled lint rules without local disables.
- [ ] Extract small duplicated logic blocks in helper and rule files into shared internal utilities so that the duplication checker reports fewer clones without altering rule behavior or public contracts.

## LATER

- [ ] Incrementally ratchet down file-level size limits in the linting configuration and, when a file exceeds the new threshold, move cohesive groups of helpers into separate modules so each file stays focused and easier to navigate.
- [ ] Expand performance-oriented tests for function and branch annotation rules on large synthetic projects and update the relevant stories with concrete, measured timing expectations based on those results.
- [ ] Once the external GitHub issue related to test callback handling has been closed with the required version-referenced comment, update the function-annotations story checklist to mark the issue-resolution acceptance and Definition of Done items complete and mention the release that contained the fix.
- [ ] Extend internal development documentation to record the finalized lint thresholds, preferred refactoring patterns, and the ratcheting strategy so future contributors can continue improving code quality metrics consistently over time.
