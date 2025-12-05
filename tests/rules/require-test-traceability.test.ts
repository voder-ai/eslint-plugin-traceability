/**
 * Tests for:
 * - docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md
 * - docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FILE-SUPPORTS REQ-TEST-DESCRIBE-STORY REQ-TEST-IT-REQ-PREFIX REQ-TEST-FRAMEWORK-COMPAT REQ-TEST-PATTERN-DETECT
 * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-TEMPLATE REQ-TEST-FIX-PREFIX-FORMAT REQ-TEST-FIX-SAFE REQ-TEST-FIX-PRESERVE REQ-TEST-FIX-PLACEHOLDER REQ-TEST-FIX-NO-INFERENCE
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-test-traceability";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

describe("require-test-traceability rule (Stories 020.0 and 021.0)", () => {
  ruleTester.run("require-test-traceability", rule, {
    valid: [
      {
        // [REQ-TEST-FILE-SUPPORTS] file-level @supports present and describe/test satisfied
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FILE-SUPPORTS\n */\ndescribe('Story 020.0-DEV-TEST-ANNOTATION-VALIDATION', () => { it('[REQ-EXAMPLE] does something', () => {}); });`,
        filename: "tests/rules/require-test-traceability.test.ts",
      },
      {
        // [REQ-TEST-FRAMEWORK-COMPAT] mocha style `context` is treated as a test call but only name checks apply
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FRAMEWORK-COMPAT\n */\ncontext('Story 020.0-DEV-TEST-ANNOTATION-VALIDATION', () => {});`,
        filename: "tests/some/context.test.ts",
      },
      {
        // Ensure non-test files are ignored (REQ-TEST-PATTERN-DETECT)
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-PATTERN-DETECT\n */\ndescribe('Story 020.0-DEV-TEST-ANNOTATION-VALIDATION', () => {});`,
        filename: "src/not-a-test-file.ts",
      },
      {
        // [REQ-TEST-FIX-PREFIX-FORMAT] already-correct [REQ-XXX] prefix is left unchanged by auto-fix
        code: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\ndescribe('Story 021.0-DEV-TEST-ANNOTATION-AUTO-FIX', () => { it('[REQ-TRACE-123] behaves correctly', () => {}); });`,
        filename: "tests/rules/correct-prefix-autofix.test.ts",
      },
    ],
    invalid: [
      {
        // [REQ-TEST-FIX-TEMPLATE] missing @supports in test file -> insert default placeholder template
        code: `describe('Story 020.0-DEV-TEST-ANNOTATION-VALIDATION', () => { it('[REQ-ONE] works', () => {}); });`,
        output: `/**\n * @supports docs/stories/XXX.X-STORY-NAME.story.md REQ-XXX-YYY REQ-XXX-ZZZ\n * TODO: Replace the placeholder story path and REQ-IDs with real values for this test file.\n */\ndescribe('Story 020.0-DEV-TEST-ANNOTATION-VALIDATION', () => { it('[REQ-ONE] works', () => {}); });`,
        filename: "tests/rules/missing-supports.test.ts",
        errors: [{ messageId: "missingFileSupports" }],
      },
      {
        // [REQ-TEST-DESCRIBE-STORY] describe without story phrase still reported (no auto-fix)
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-DESCRIBE-STORY\n */\ndescribe('no story reference here', () => {});`,
        filename: "tests/rules/bad-describe.test.ts",
        errors: [{ messageId: "missingDescribeStory" }],
      },
      {
        // [REQ-TEST-IT-REQ-PREFIX][REQ-TEST-FIX-NO-INFERENCE] test name without any REQ prefix -> error but no auto-fix
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-IT-REQ-PREFIX\n */\nit('missing prefix', () => {});`,
        filename: "tests/rules/bad-test-name-no-prefix.test.ts",
        errors: [{ messageId: "missingReqPrefix" }],
      },
      {
        // [REQ-TEST-FIX-PREFIX-FORMAT] malformed prefix with extra spaces in brackets
        code: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[ REQ-TEST-FIX ] does something', () => {});`,
        output: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[REQ-TEST-FIX] does something', () => {});`,
        filename: "tests/rules/malformed-prefix-spacing.test.ts",
        errors: [{ messageId: "missingReqPrefix" }],
      },
      {
        // [REQ-TEST-FIX-PREFIX-FORMAT] malformed prefix with underscore delimiter
        code: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[REQ_TEST_FIX] does something', () => {});`,
        output: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[REQ-TEST-FIX] does something', () => {});`,
        filename: "tests/rules/malformed-prefix-underscore.test.ts",
        errors: [{ messageId: "missingReqPrefix" }],
      },
      {
        // [REQ-TEST-FIX-PREFIX-FORMAT] malformed prefix with lowercase req
        code: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[req-lowercase] bad casing', () => {});`,
        output: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[REQ-LOWERCASE] bad casing', () => {});`,
        filename: "tests/rules/malformed-prefix-lowercase.test.ts",
        errors: [{ messageId: "missingReqPrefix" }],
      },
      {
        // [REQ-TEST-FIX-PREFIX-FORMAT] malformed prefix using parentheses
        code: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('(REQ-PAREN) with parens', () => {});`,
        output: `/**\n * @supports docs/stories/021.0-DEV-TEST-ANNOTATION-AUTO-FIX.story.md REQ-TEST-FIX-PREFIX-FORMAT\n */\nit('[REQ-PAREN] with parens', () => {});`,
        filename: "tests/rules/malformed-prefix-parens.test.ts",
        errors: [{ messageId: "missingReqPrefix" }],
      },
    ],
  });
});
