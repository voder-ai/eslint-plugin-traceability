/**
 * Tests for: docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION - Verify valid-annotation-format rule enforces annotation format syntax
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/valid-annotation-format";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

describe("Valid Annotation Format Rule (Story 005.0-DEV-ANNOTATION-VALIDATION)", () => {
  ruleTester.run("valid-annotation-format", rule, {
    valid: [
      {
        name: "[REQ-PATH-FORMAT] valid story annotation format (single-line)",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
      },
      {
        name: "[REQ-REQ-FORMAT] valid req annotation format (single-line)",
        code: `// @req REQ-EXAMPLE`,
      },
      {
        name: "[REQ-FORMAT-SPECIFICATION] valid block annotations (single-line values)",
        code: `/**
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-VALID-EXAMPLE
 */`,
      },
      {
        name: "[REQ-MULTILINE-SUPPORT] valid multi-line @story annotation value in block comment",
        code: `/**
 * @story docs/stories/005.0-
 * DEV-ANNOTATION-VALIDATION.story.md
 */`,
      },
      {
        name: "[REQ-MULTILINE-SUPPORT] valid multi-line @req annotation value in block comment",
        code: `/**
 * @req REQ-
 * EXAMPLE
 */`,
      },
      {
        name: "[REQ-FLEXIBLE-PARSING] valid JSDoc-style comment with leading stars and spacing",
        code: `/**
 *   @story   docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 *   @req   REQ-FLEXIBLE-PARSING
 */`,
      },
    ],
    invalid: [
      {
        name: "[REQ-PATH-FORMAT] missing story path (single line)",
        code: `// @story`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Missing story path for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-PATH-FORMAT] invalid story file extension",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-REQ-FORMAT] missing req id (single line)",
        code: `// @req`,
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".',
            },
          },
        ],
      },
      {
        name: "[REQ-REQ-FORMAT] invalid req id format (single line)",
        code: `// @req invalid-format`,
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
      {
        name: "[REQ-MULTILINE-SUPPORT] missing story path with multi-line block comment",
        code: `/**
 * @story
 */`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Missing story path for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-MULTILINE-SUPPORT] invalid multi-line story path after collapsing whitespace",
        code: `/**
 * @story docs/stories/005.0-
 * DEV-ANNOTATION-VALIDATION.story
 */`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-MULTILINE-SUPPORT] missing req id with multi-line block comment",
        code: `/**
 * @req
 */`,
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".',
            },
          },
        ],
      },
      {
        name: "[REQ-MULTILINE-SUPPORT] invalid multi-line req id after collapsing whitespace",
        code: `/**
 * @req invalid-
 * format
 */`,
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
    ],
  });
});
