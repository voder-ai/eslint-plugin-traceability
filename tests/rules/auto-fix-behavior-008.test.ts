/**
 * Tests for: docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-MISSING - Verify ESLint --fix automatically adds missing @story annotations to functions
 * @req REQ-AUTOFIX-FORMAT - Verify ESLint --fix corrects simple annotation format issues for @story annotations
 */
import { RuleTester } from "eslint";
import requireStoryRule from "../../src/rules/require-story-annotation";
import validAnnotationFormatRule from "../../src/rules/valid-annotation-format";

const functionRuleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

const formatRuleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

describe("Auto-fix behavior (Story 008.0-DEV-AUTO-FIX)", () => {
  describe("[REQ-AUTOFIX-MISSING] require-story-annotation auto-fix", () => {
    functionRuleTester.run("require-story-annotation --fix", requireStoryRule, {
      valid: [
        {
          name: "[REQ-AUTOFIX-MISSING] already annotated function is unchanged",
          code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction alreadyAnnotated() {}`,
        },
      ],
      invalid: [
        {
          name: "[REQ-AUTOFIX-MISSING] adds @story before function declaration when missing",
          code: `function autoFixMe() {}`,
          output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction autoFixMe() {}`,
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc: "Add JSDoc @story annotation for function 'autoFixMe', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                  output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction autoFixMe() {}`,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  describe("[REQ-AUTOFIX-FORMAT] valid-annotation-format auto-fix", () => {
    formatRuleTester.run(
      "valid-annotation-format --fix simple @story extension issues",
      validAnnotationFormatRule as any,
      {
        valid: [
          {
            name: "[REQ-AUTOFIX-FORMAT] already-correct story path is unchanged",
            code: `// @story docs/stories/005.0-DEV-EXAMPLE.story.md`,
          },
        ],
        invalid: [
          {
            name: "[REQ-AUTOFIX-FORMAT] adds .md extension for .story path",
            code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
            output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
            errors: [
              {
                messageId: "invalidStoryFormat",
              },
            ],
          },
          {
            name: "[REQ-AUTOFIX-FORMAT] adds .story.md extension when missing entirely",
            code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,
            output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
            errors: [
              {
                messageId: "invalidStoryFormat",
              },
            ],
          },
        ],
      },
    );
  });
});
