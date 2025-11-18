## NOW
Enhance the `require-story-annotation` rule in `src/rules/require-story-annotation.ts` to include AST selectors for ArrowFunctionExpression, FunctionExpression, and MethodDefinition so that missing `@story` annotations on those function forms trigger errors per REQ-FUNCTION-DETECTION in `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`.

## NEXT
- Add new unit tests in `tests/rules/require-story-annotation.test.ts` for arrow functions, function expressions, and class methods to verify the rule flags missing annotations and accepts properly annotated cases.
- Update ESLint’s `parserOptions` (e.g. enable `@typescript-eslint/parser`) and extend the rule to handle TypeScript-specific nodes (e.g. TSDeclareFunction, TSMethodSignature).
- Revise `docs/rules/require-story-annotation.md` to document the newly supported function forms and confirm the `scope` and `exportPriority` options reflect the code’s behavior.

## LATER
- Implement handling for decorator-laden functions, overloaded and generic functions as outlined in the story’s edge‐case requirements.
- Publish a patch release (e.g. v1.x.x) documenting full support for story 003.0 and update the changelog.
- Prioritize and plan the implementation of the remaining incomplete stories (004.0, 005.0, etc.) in order.