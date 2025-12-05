## NOW

- [ ] Review the branch-annotation rule implementation, its helpers, and the associated story and test files to understand exactly how nested control-flow structures are currently handled and what gaps remain for the nested-handling requirement in the branch-annotations story.

## NEXT

- [ ] Extend the branch-annotation rule and its helpers so that nested control-flow structures (such as nested conditionals, loops, and try/catch blocks) are explicitly and correctly supported in line with the nested-handling requirement, without changing existing behavior for simple branches.
- [ ] Add or update targeted tests for the branch-annotation rule that exercise a variety of nested and complex control-flow scenarios, with clear traceability annotations back to the nested-handling requirement in the branch-annotations story.
- [ ] Create a focused performance-oriented test for the branch-annotation rule that validates its behavior and execution time on code containing many branch constructs, and document this as fulfilling the performance-optimization requirement for the branch-annotations story.

## LATER

- [ ] Re-evaluate the branch-annotations story against all its documented requirements, confirming that nested handling and performance optimization are now fully met and updating any internal traceability annotations or ADRs as needed.
- [ ] Perform small, localized refactors on the branch-annotation helpers to further reduce duplication or complexity identified during implementation, ensuring tests continue to describe behavior rather than implementation details.
- [ ] Update the user-facing rule documentation to briefly describe how the branch-annotation rule behaves with nested control flow and to note any performance characteristics or limits relevant to typical usage.
