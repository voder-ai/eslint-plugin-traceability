## NOW

- [ ] Restructure the function-annotations story file so that every repository-scoped acceptance criterion and Definition of Done item is checked off, and move the GitHub issue #5 closure requirement into a clearly labeled external follow-up section that explains it is tracked directly in GitHub rather than as an in-repo checkbox.

## NEXT

- [ ] Adjust any remaining references inside the function-annotations story that treat the GitHub issue #5 closure as an in-repo requirement so they instead describe it as an external administrative task linked to the completed implementation.
- [ ] Verify that the function-annotations story’s requirements and tests are still correctly cross-referenced (REQ IDs, @supports tags in tests) and update any outdated requirement text to match the current behavior of the unified rule and test callback exclusion.

## LATER

- [ ] Remove any remaining inline lint rule suppressions in helper and rule modules by refactoring code so that all enabled lint rules pass without local disables while preserving behavior.
- [ ] Extract small duplicated logic fragments in helper and rule modules into shared internal utilities so the duplication checker reports fewer clones without changing public behavior.
- [ ] Incrementally tighten file-level size limits in the linting configuration and split oversized modules into smaller, focused files as they exceed new thresholds, keeping the codebase easy to navigate.
