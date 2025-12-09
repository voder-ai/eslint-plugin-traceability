## NOW

- [ ] Lower the allowed cyclomatic complexity for functions in the linting configuration and refactor any functions that exceed the new limit into smaller, focused helpers so that all code complies with the stricter complexity threshold without changing behavior.

## NEXT

- [ ] Add an integration test that exercises the unified traceability rule in a flat ESLint configuration with custom additional test helper names configured, verifying that callbacks in both JavaScript and TypeScript files respect the exclusion and bench callbacks still require annotations.
- [ ] Reduce the maximum allowed non-comment lines per function in the linting configuration and split any functions that violate the new limit into smaller, single-responsibility helpers while keeping existing behavior and public interfaces intact.
- [ ] Eliminate any remaining localized lint rule suppressions in helper and rule modules by simplifying signatures, removing unused parameters, or extracting shared logic so those files pass linting without inline disables.
- [ ] Inspect the new test callback exclusion helper module and replace untyped or loosely typed parameters with concrete AST node types from the existing utilities, ensuring the helper remains behaviorally identical but gains stronger type safety and clearer intent.
- [ ] Identify small duplicated logic blocks in the helper and rule files reported by the duplication checker and extract them into shared internal utilities so that duplication metrics improve without altering rule behavior.

## LATER

- [ ] Incrementally ratchet down file-level size limits in the linting configuration and, when a file exceeds the new limit, move cohesive groups of helpers into separate modules to keep each file focused and easier to navigate.
- [ ] Broaden performance-oriented tests around function and branch annotation rules on large synthetic projects, then use the results to update the relevant stories’ performance acceptance criteria with realistic timing expectations.
- [ ] Once the external GitHub issue related to test callback handling has been closed with a version-referenced comment, update the function-annotations story checklist to mark the resolution items complete and reference the release containing the fix.
- [ ] Extend internal documentation to capture the finalized lint thresholds, refactoring patterns, and ratcheting strategy so future contributors understand how to keep code quality metrics improving over time.
