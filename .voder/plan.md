## NOW

- [ ] Implement the remaining switch statement behaviors from the branch-annotations story by updating the branch-annotation rule so that switch default cases are required to have traceability annotations and fall-through case groups are handled according to the story’s fall-through semantics.

## NEXT

- [ ] Extend the branch-annotation rule to support loop annotation flexibility so that loops are considered correctly annotated when the traceability annotation is placed either on the loop statement or on the first significant statement inside the loop body, as specified in the story.
- [ ] Update function-annotation and branch-annotation logic to enforce the story’s rules for named versus anonymous arrow functions and to implement nested function inheritance of annotations, ensuring inner anonymous functions can inherit coverage from an annotated outer function while named inner functions require their own annotations.
- [ ] Add or adjust unit tests for the branch-annotation and function-annotation rules to cover the new switch, loop, arrow function, and nested function behaviors, including both positive and negative cases tied to the specific requirement IDs from the branch-annotations story.
- [ ] Introduce or extend integration tests that run the ESLint plugin against representative files containing complex switch statements, nested loops, and nested arrow functions to confirm that the combined behavior matches all acceptance criteria of the branch-annotations story.
- [ ] Update the branch-annotations story file and relevant user-facing documentation to reflect the completed behaviors, marking the outstanding acceptance criteria as satisfied and clarifying any nuances in switch, loop, and nested function handling.

## LATER

- [ ] Review performance and complexity of the updated branch and function annotation logic on large, branch-heavy codebases and optimize helper utilities if needed while preserving behavior.
- [ ] Add additional regression tests for edge cases such as ternary operators, logical operators, and async catch blocks to strengthen confidence that excluded constructs remain excluded and included constructs continue to behave as required.
- [ ] Refine internal helper abstractions for comment and scope analysis to reduce duplication between branch-annotation, function-annotation, and redundant-annotation rules while keeping the implementation easy to understand and maintain.
