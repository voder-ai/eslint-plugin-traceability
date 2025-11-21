/**
 * Tests for: docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ERROR-SPECIFIC - Specific details about what annotation is missing or invalid
 * @req REQ-ERROR-SUGGESTION - Suggest concrete steps to fix the issue
 * @req REQ-ERROR-CONTEXT - Include relevant context in error messages
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

describe("Error Reporting Enhancements for require-story-annotation (Story 007.0-DEV-ERROR-REPORTING)", () => {
  ruleTester.run("require-story-annotation", rule, {
    valid: [
      {
        name: "[007.0-DEV-ERROR-REPORTING] valid with existing annotation",
        code: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */ function foo() {}`,
      },
    ],
    invalid: [
      {
        name: "[REQ-ERROR-SPECIFIC] missing @story annotation should report specific details and suggestion",
        code: `function bar() {}`,
        output:
          "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}",
        errors: [
          {
            messageId: "missingStory",
            data: { name: "bar" },
            suggestions: [
              {
                desc: "Add JSDoc @story annotation for function 'bar', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                output:
                  "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}",
              },
            ],
          },
        ],
      },
    ],
  });
});
