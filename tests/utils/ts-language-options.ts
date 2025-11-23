/**
 * Shared TypeScript RuleTester language options for traceability tests.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Provide reusable TypeScript parser setup for tests
 */
export const tsRuleTesterLanguageOptions = {
  parser: require("@typescript-eslint/parser") as any,
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
};

/**
 * Attach shared TypeScript RuleTester language options to a test case definition.
 * This helper allows tests to avoid repeating the languageOptions assignment.
 *
 * @param testCase A RuleTester valid/invalid test case object
 * @returns The same test case with TypeScript language options applied
 */
export function withTsLanguageOptions<T extends { languageOptions?: unknown }>(
  testCase: T
): T {
  return {
    languageOptions: tsRuleTesterLanguageOptions,
    ...testCase,
  };
}