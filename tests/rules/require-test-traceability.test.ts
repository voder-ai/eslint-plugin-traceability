/**
 * Tests for: docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md
 * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-FILE-SUPPORTS REQ-TEST-DESCRIBE-STORY REQ-TEST-IT-REQ-PREFIX REQ-TEST-FRAMEWORK-COMPAT REQ-TEST-PATTERN-DETECT
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-test-traceability";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

describe("require-test-traceability rule (Story 020.0-DEV-TEST-ANNOTATION-VALIDATION)", () => {
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
    ],
    invalid: [
      {
        // [REQ-TEST-FILE-SUPPORTS] missing @supports in test file
        code: `describe('Story 020.0-DEV-TEST-ANNOTATION-VALIDATION', () => { it('[REQ-ONE] works', () => {}); });`,
        filename: "tests/rules/missing-supports.test.ts",
        errors: [{ messageId: "missingFileSupports" }],
      },
      {
        // [REQ-TEST-DESCRIBE-STORY] describe without story phrase
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-DESCRIBE-STORY\n */\ndescribe('no story reference here', () => {});`,
        filename: "tests/rules/bad-describe.test.ts",
        errors: [{ messageId: "missingDescribeStory" }],
      },
      {
        // [REQ-TEST-IT-REQ-PREFIX] test name without [REQ-XXX] prefix
        code: `/**\n * @supports docs/stories/020.0-DEV-TEST-ANNOTATION-VALIDATION.story.md REQ-TEST-IT-REQ-PREFIX\n */\nit('missing prefix', () => {});`,
        filename: "tests/rules/bad-test-name.test.ts",
        errors: [{ messageId: "missingReqPrefix" }],
      },
    ],
  });
});
