## NOW

- [ ] Review the JSDoc coexistence story and the current annotation parsing implementation side by side to derive precise rules for how traceability tags must coexist with other JSDoc tags like @param and @returns without corrupting annotation values.

## NEXT

- [ ] Update the annotation parsing logic so that when a pending @story, @req, or @supports annotation is followed by a new JSDoc tag line (such as @param or @returns), the parser finalizes the annotation instead of appending the JSDoc tag text into its value, while preserving existing multi-line value behavior for non-tag lines.
- [ ] Add targeted tests that cover JSDoc coexistence scenarios described in the story, including traceability annotations appearing before and after @param/@returns tags, and verify that IDs remain unpolluted and no false positives are introduced.
- [ ] Adjust rule documentation and, if necessary, the story file itself to record the new coexistence behavior, including at least one concrete example showing a traceability annotation living alongside standard JSDoc tags.
- [ ] Perform a small focused review of the updated parser helper code to ensure it still meets the project’s complexity and readability expectations, making minor refactors if needed without altering the new behavior.

## LATER

- [ ] Extend tests to cover additional JSDoc tag variants (such as @type, @throws, or custom tags) to ensure the coexistence logic is robust against less common but realistic comment structures.
- [ ] Consider extracting a small reusable JSDoc line-classification helper if similar logic is later needed in other rules that parse comment annotations, keeping cross-rule behavior consistent.
- [ ] Revisit related stories and rules that depend on annotation parsing to see if any can benefit from the improved JSDoc coexistence semantics or require their own additional tests.
