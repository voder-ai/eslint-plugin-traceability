/**
 * Tests for: docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION - Verify valid-annotation-format rule enforces annotation format syntax
 * Tests for: docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ERROR-MESSAGES-CONSISTENT - Verify invalid annotation errors use consistent wording and structure
 * @req REQ-ERROR-MESSAGES-ACTIONABLE - Verify invalid annotation errors provide actionable guidance and examples
 * @req REQ-ERROR-MESSAGES-IDENTIFIERS - Verify invalid annotation errors echo the offending identifier/path in the message
 * Tests for: docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @req REQ-CONFIGURABLE-PATTERNS-STORY - Rule supports configurable story path regex patterns
 * @req REQ-CONFIGURABLE-PATTERNS-REQ - Rule supports configurable requirement ID regex patterns
 * @req REQ-CONFIGURABLE-PATTERNS-EXAMPLES - Rule supports configurable example strings in error messages
 * @req REQ-CONFIGURABLE-PATTERNS-FALLBACK - Invalid regex patterns fall back to default behavior without crashing
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
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-STORY] custom storyPathPattern accepts alternate extension",
        code: `// @story stories/feature-010.1-CUSTOM.story.mdx`,
        options: [
          {
            story: {
              pattern: "^stories\\/[^\\s]+\\.story\\.mdx$",
              example: "stories/example-010.1-CUSTOM.story.mdx",
            },
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-REQ] custom requirementIdPattern accepts PROJECT-123 style IDs",
        code: `// @req PROJECT-123`,
        options: [
          {
            req: {
              pattern: "^[A-Z]+-[0-9]+$",
              example: "PROJECT-123",
            },
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-BOTH] custom patterns accept alternative story and req shapes",
        code: `/**
 * @story stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.mdx
 * @req STORY-10
 */`,
        options: [
          {
            story: {
              pattern: "^stories\\/[^\\s]+\\.story\\.mdx$",
              example: "stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.mdx",
            },
            req: {
              pattern: "^[A-Z]+-[0-9]+$",
              example: "STORY-10",
            },
          },
        ],
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
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
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
        name: "[REQ-PATH-FORMAT] missing extension in story path",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-PATH-FORMAT] story path must not use path traversal",
        code: `// @story ../docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "../docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
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
        name: "[REQ-REQ-FORMAT] missing req identifier with trailing space",
        code: `// @req `,
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
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-EXAMPLES] custom story example appears in error message",
        code: `// @story invalid/path.txt`,
        options: [
          {
            story: {
              pattern: "^stories\\/[^\\s]+\\.story\\.mdx$",
              example: "stories/example-010.1-CUSTOM.story.mdx",
            },
          },
        ],
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "invalid/path.txt" for @story annotation. Expected a path like "stories/example-010.1-CUSTOM.story.mdx".',
            },
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-EXAMPLES] custom requirement example appears in error message",
        code: `// @req not-matching`,
        options: [
          {
            req: {
              pattern: "^[A-Z]+-[0-9]+$",
              example: "PROJECT-123",
            },
          },
        ],
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "not-matching" for @req annotation. Expected an identifier like "PROJECT-123" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-FALLBACK] invalid storyPathPattern falls back to default behavior",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
        options: [
          {
            // invalid regex should be caught by the rule and ignored
            story: {
              pattern: "[unclosed",
            },
          },
        ],
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              // Because we fall back, we still use the default example text
              details:
                'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-FALLBACK] invalid requirementIdPattern falls back to default behavior",
        code: `// @req invalid-format`,
        options: [
          {
            // invalid regex should be caught by the rule and ignored
            req: {
              pattern: "(unclosed",
            },
          },
        ],
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              // Because we fall back, we still use the default example text
              details:
                'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
    ],
  });
});
