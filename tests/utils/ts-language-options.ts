/**
 * Shared TypeScript RuleTester language options for traceability tests.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Provide reusable TypeScript parser setup for tests
 */

const tsEcmaVersion = 2022;

export const tsRuleTesterLanguageOptions: any = {
  parser: require("@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: tsEcmaVersion,
    sourceType: "module",
  },
};

/**
 * Attach shared TypeScript RuleTester language options to a test case definition.
 * This helper allows tests to avoid repeating the languageOptions assignment.
 *
 * @param testCase A RuleTester valid/invalid test case object
 * @returns The same test case with TypeScript language options applied
 */
/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
 */
export function withTsLanguageOptions<T extends Record<string, unknown>>(
  testCase: T
): T & { languageOptions: typeof tsRuleTesterLanguageOptions } {
  return {
    ...testCase,
    languageOptions: tsRuleTesterLanguageOptions,
  } as T & { languageOptions: typeof tsRuleTesterLanguageOptions };
}