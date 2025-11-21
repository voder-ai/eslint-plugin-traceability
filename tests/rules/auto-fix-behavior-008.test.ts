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
        {
          name: "[REQ-AUTOFIX-MISSING] already annotated class method is unchanged",
          code: `class A {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
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
        {
          name: "[REQ-AUTOFIX-MISSING] adds @story before function expression when missing",
          code: `const fnExpr = function() {};`,
          output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst fnExpr = function() {};`,
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc: "Add JSDoc @story annotation for function 'fnExpr', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                  output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst fnExpr = function() {};`,
                },
              ],
            },
          ],
        },
        {
          name: "[REQ-AUTOFIX-MISSING] adds @story before class method when missing",
          code: `class C {\n  method() {}\n}`,
          output: `class C {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc: "Add JSDoc @story annotation for function 'method', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                  output: `class C {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
                },
              ],
            },
          ],
        },
        {
          name: "[REQ-AUTOFIX-MISSING] adds @story before TS declare function when missing",
          code: `declare function tsDecl(): void;`,
          output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ndeclare function tsDecl(): void;`,
          languageOptions: {
            parser: require("@typescript-eslint/parser") as any,
            parserOptions: { ecmaVersion: 2020, sourceType: "module" },
          },
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc: "Add JSDoc @story annotation for function 'tsDecl', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                  output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ndeclare function tsDecl(): void;`,
                },
              ],
            },
          ],
        },
        {
          name: "[REQ-AUTOFIX-MISSING] adds @story before TS method signature when missing",
          code: `interface D {\n  method(): void;\n}`,
          output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ninterface D {\n  method(): void;\n}`,
          languageOptions: {
            parser: require("@typescript-eslint/parser") as any,
            parserOptions: { ecmaVersion: 2020, sourceType: "module" },
          },
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc: "Add JSDoc @story annotation for function 'method', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
                  output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ninterface D {\n  method(): void;\n}`,
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
