## NOW

- [ ] Reintroduce a single, focused invalid test case for the redundant-annotation rule in the rule test file, based directly on the story’s core example of a simple statement fully covered by its enclosing scope, so that this behavior is specified and ready to drive any needed rule refinements.

## NEXT

- [ ] Expand the invalid test set for the redundant-annotation rule to cover the remaining key acceptance criteria from the story, such as multiple simple statements under a shared scope annotation, mixed @story/@supports/@req combinations, and preservation of non-redundant inner annotations.
- [ ] Refine the redundant-annotation rule implementation so that all newly added invalid tests pass, including honoring configuration options like strictness, alwaysCovered, allowEmphasisDuplication, and maxScopeDepth as described in the story.
- [ ] Add at least one integration-level test that runs ESLint with the plugin against multiple files, confirming that redundant annotations are cleaned up consistently across a small synthetic project while required annotations are preserved.
- [ ] Update the user-facing API reference and any internal rule documentation to accurately describe the final behavior and option semantics of the redundant-annotation rule, and then mark the corresponding acceptance criteria and Definition of Done items as satisfied in the redundant-annotation story file.

## LATER

- [ ] Evaluate the performance of the redundant-annotation rule and its scope-analyzer utilities on large, representative projects and, if necessary, optimize scope traversal or comment parsing to avoid redundant work.
- [ ] Identify and extract any common logic between the redundant-annotation rule and existing annotation-related helpers into shared utilities to reduce duplication without sacrificing clarity.
- [ ] Augment the user documentation with additional examples and troubleshooting guidance based on real-world usage, clarifying how the rule behaves with legacy annotations, partially migrated code, and different strictness configurations.
