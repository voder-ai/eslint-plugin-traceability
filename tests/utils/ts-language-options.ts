/**
 * Shared TypeScript RuleTester language options for traceability tests.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Provide reusable TypeScript parser setup for tests
 */
export const tsRuleTesterLanguageOptions = {
  parser: require("@typescript-eslint/parser") as any,
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
};
