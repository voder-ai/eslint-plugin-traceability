## NOW

- [ ] Update the user-facing API reference so that the documentation for the core validation rules (such as the annotation-format, story-reference, and req-reference rules) uses @supports-based annotations as the primary examples, with any @story/@req examples clearly labeled as legacy or migration-focused.

## NEXT

- [ ] Review the rest of the user-facing documentation (README and the guides in the user-docs directory) to identify any remaining primary examples that still rely solely on @story/@req, and revise them so the default guidance and code samples demonstrate @supports-first usage with legacy forms shown only in explicitly marked sections.
- [ ] Cross-check the development stories and architecture decision records related to supports migration and unified rules to ensure their described behavior and example annotations match the updated @supports-first documentation model.
- [ ] Once the documentation and stories are aligned, re-validate that the specific acceptance criteria for the supports-migration story about documentation examples are fully satisfied, adjusting any remaining wording or examples that could conflict with the intended @supports-first guidance.

## LATER

- [ ] Expand the project’s own ESLint configuration to enable additional traceability rules on the codebase, tightening or removing any temporary suppressions as missing annotations are added so the plugin’s conventions are fully self-enforced.
- [ ] Enhance tests and examples around the maintenance CLI and migration rule to cover more complex real-world annotation patterns, ensuring that both @supports-first behavior and legacy compatibility are clearly demonstrated and validated.
- [ ] Document any future refinements to the unified rule, aliasing strategy, or supports-based conventions in new or updated architecture decision records so that the evolution of the traceability model remains clearly recorded.
