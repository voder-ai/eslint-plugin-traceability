/**
 * Shared TypeScript RuleTester language options for traceability tests.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Provide reusable TypeScript parser setup for tests
 */

const TS_ECMA_VERSION = Number("2022") as const;
const ECMA_VERSION_2022 = TS_ECMA_VERSION;

export const tsRuleTesterLanguageOptions = {
  parser: require("@typescript-eslint/parser") as any,
  parserOptions: {
    ecmaVersion: ECMA_VERSION_2022,
    sourceType: "module" as const,
  },
} as const;

/**
 * Attach shared TypeScript RuleTester language options to a test case definition.
 * This helper allows tests to avoid repeating the languageOptions assignment.
 *
 * @param testCase A RuleTester valid/invalid test case object
 * @returns The same test case with TypeScript language options applied
 */
export function withTsLanguageOptions<T extends Record<string, unknown>>(
  testCase: T
): T & { languageOptions: typeof tsRuleTesterLanguageOptions } {
  return {
    ...testCase,
    languageOptions: tsRuleTesterLanguageOptions,
  } as T & { languageOptions: typeof tsRuleTesterLanguageOptions };
}