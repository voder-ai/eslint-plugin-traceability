## NOW

- [ ] Add clear, formatter-aware examples to the examples documentation that show annotated if/else/else-if chains before and after formatting, demonstrating where annotations should go and how they are interpreted by the branch-annotation rule.

## NEXT

- [ ] Ensure the new examples are consistent with the documented behavior in the branch-annotation stories and API reference, adjusting wording or annotations in the examples where necessary to match the current implementation.
- [ ] Add brief explanatory notes alongside the new examples that call out how common formatters (such as Prettier) may move comments and why the shown annotation positions remain valid.
- [ ] Cross-reference the new branch-annotation examples from the existing user documentation (for example from the rule’s API reference section) so users can easily discover them when configuring formatter-aware annotations.

## LATER

- [ ] Expand the examples documentation with additional scenarios that cover other supported branch types (such as switch cases and loop constructs), making sure each example illustrates both annotation placement and expected rule behavior.
- [ ] Introduce a small section in the examples documentation that contrasts legacy annotation patterns with the recommended formatter-aware patterns, helping users migrate older codebases more confidently.
- [ ] Revisit and refine the examples over time as formatter behavior or supported branch patterns evolve, keeping them aligned with the latest stories, implementation, and tests.
