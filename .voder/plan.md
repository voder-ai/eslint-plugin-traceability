## NOW

- [ ] Add complete traceability annotations to the helper functions and significant branches in the valid-req-reference helper module so that each piece of logic clearly references the appropriate story file and requirement IDs.

## NEXT

- [ ] Review other helper modules in the rules/helpers directory to identify any remaining functions or branches that lack @supports-style traceability annotations and add the missing references to their corresponding stories and requirements.
- [ ] Re-scan the TypeScript rule and helper code to confirm that every exported function and important conditional branch has a consistent, parseable traceability annotation and that none point to incorrect or placeholder story paths.
- [ ] Update the ESLint plugin development guide to explicitly state that helper modules must carry the same level of traceability annotations as rule entrypoints, including examples that show how to document helpers and internal branches.
- [ ] Align any affected story documents or requirement IDs with the new annotations if necessary, ensuring that requirement identifiers used in code actually exist in the referenced story files and are described clearly.

## LATER

- [ ] Introduce or tighten automated checks that enforce the presence and correctness of traceability annotations on helper functions and branches, reducing the chance of future drift.
- [ ] Extend the dogfooding and self-validation strategy so that traceability enforcement covers helper modules explicitly, and document how failures in helper-level annotations surface in tests and CI.
- [ ] Periodically review and refactor helper modules to keep them small, focused, and well-documented as additional rules and requirements are added to the plugin.
- [ ] Revisit the overall documentation and architecture decision records to capture the convention that all implementation layers (rules, helpers, utilities) participate equally in story and requirement traceability.
