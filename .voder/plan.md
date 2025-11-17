## NOW
Modify `src/rules/require-story-annotation.ts` to register AST visitors for `FunctionExpression`, `ArrowFunctionExpression`, and `MethodDefinition` so that all function types are detected in accordance with docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md.

## NEXT
- Extend the rule’s JSON schema in `src/rules/require-story-annotation.ts` to accept `scope` and `exportPriority` options (REQ-CONFIGURABLE-SCOPE, REQ-EXPORT-PRIORITY).
- In the rule implementation, wire up those options so users can configure which function kinds to check and prioritize exported functions.
- Add new unit tests in `tests/rules/require-story-annotation.test.ts` covering arrow functions, function expressions, class methods, export scenarios, and both default and custom configurations.
- Update error messages to include the specific requirement IDs from story 003.0 for each missing annotation case.

## LATER
- Add support for TypeScript-specific AST nodes (parameter properties, decorators) by importing and handling TSESTree node types from `@typescript-eslint/parser`.
- Refactor the function-detection logic into a reusable helper (e.g. `detectFunctionNodes`) for use across other rules.
- Document the new configuration options and behavior in `docs/rules/require-story-annotation.md`, including examples.
- Write end-to-end CLI integration tests to verify annotation enforcement in a sample TypeScript project with mixed function syntaxes.