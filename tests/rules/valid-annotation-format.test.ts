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

const makeInvalid = ({
  name,
  code,
  output,
  messageId,
  details,
  options,
}: {
  name: string;
  code: string;
  output?: string;
  messageId: string;
  details: string;
  options?: any[];
}) => ({
  name,
  code,
  ...(output ? { output } : {}),
  ...(options ? { options } : {}),
  errors: [
    {
      messageId,
      data: {
        details,
      },
    },
  ],
});

/**
 * Test-only convenience for Story 005.0 error messaging consistency.
 * Preconfigures the invalidStoryFormat messageId so tests only specify
 * name, code, and details (plus optional output/options).
 */
const makeInvalidStory = ({
  name,
  code,
  details,
  output,
  options,
}: {
  name: string;
  code: string;
  details: string;
  output?: string;
  options?: any[];
}) =>
  makeInvalid({
    name,
    code,
    output,
    options,
    messageId: "invalidStoryFormat",
    details,
  });

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
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-STORY-FLAT] flat storyPathPattern accepts alternate extension when nested config not provided",
        code: `// @story stories/feature-010.1-CUSTOM.story.mdx`,
        options: [
          {
            storyPathPattern: "^stories\\/[^\\s]+\\.story\\.mdx$",
            storyPathExample: "stories/example-010.1-CUSTOM.story.mdx",
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-REQ-FLAT] flat requirementIdPattern accepts PROJECT-123 style IDs when nested config not provided",
        code: `// @req PROJECT-123`,
        options: [
          {
            requirementIdPattern: "^[A-Z]+-[0-9]+$",
            requirementIdExample: "PROJECT-123",
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-BOTH-FLAT] flat patterns accept alternative story and req shapes when nested config not provided",
        code: `/**
 * @story stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.mdx
 * @req STORY-10
 */`,
        options: [
          {
            storyPathPattern: "^stories\\/[^\\s]+\\.story\\.mdx$",
            storyPathExample:
              "stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.mdx",
            requirementIdPattern: "^[A-Z]+-[0-9]+$",
            requirementIdExample: "STORY-10",
          },
        ],
      },
    ],
    invalid: [
      makeInvalidStory({
        name: "[REQ-PATH-FORMAT] missing story path (single line)",
        code: `// @story`,
        details:
          'Missing story path for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      makeInvalidStory({
        name: "[REQ-PATH-FORMAT] invalid story file extension",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        details:
          'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      makeInvalidStory({
        name: "[REQ-PATH-FORMAT] missing extension in story path",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION`,
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        details:
          'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      makeInvalidStory({
        name: "[REQ-PATH-FORMAT] story path must not use path traversal",
        code: `// @story ../docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        details:
          'Invalid story path "../docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      makeInvalid({
        name: "[REQ-REQ-FORMAT] missing req id (single line)",
        code: `// @req`,
        messageId: "invalidReqFormat",
        details:
          'Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".',
      }),
      makeInvalid({
        name: "[REQ-REQ-FORMAT] invalid req id format (single line)",
        code: `// @req invalid-format`,
        messageId: "invalidReqFormat",
        details:
          'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
      }),
      makeInvalid({
        name: "[REQ-REQ-FORMAT] missing req identifier with trailing space",
        code: `// @req `,
        messageId: "invalidReqFormat",
        details:
          'Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".',
      }),
      makeInvalidStory({
        name: "[REQ-MULTILINE-SUPPORT] missing story path with multi-line block comment",
        code: `/**
 * @story
 */`,
        details:
          'Missing story path for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      makeInvalidStory({
        name: "[REQ-MULTILINE-SUPPORT] invalid multi-line story path after collapsing whitespace",
        code: `/**
 * @story docs/stories/005.0-
 * DEV-ANNOTATION-VALIDATION.story
 */`,
        details:
          'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      makeInvalid({
        name: "[REQ-MULTILINE-SUPPORT] missing req id with multi-line block comment",
        code: `/**
 * @req
 */`,
        messageId: "invalidReqFormat",
        details:
          'Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".',
      }),
      makeInvalid({
        name: "[REQ-MULTILINE-SUPPORT] invalid multi-line req id after collapsing whitespace",
        code: `/**
 * @req invalid-
 * format
 */`,
        messageId: "invalidReqFormat",
        details:
          'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
      }),
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
            // Configuration error should also be reported
            messageId: "invalidRuleConfiguration",
            data: {
              details:
                'Invalid regular expression for option "story.pattern": "[unclosed"',
            },
          },
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
            // Configuration error should also be reported
            messageId: "invalidRuleConfiguration",
            data: {
              details:
                'Invalid regular expression for option "req.pattern": "(unclosed"',
            },
          },
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
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-FALLBACK-FLAT] invalid flat storyPathPattern falls back to default and reports config error",
        code: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story`,
        options: [
          {
            // invalid regex should be caught by the rule and ignored
            storyPathPattern: "[unclosed",
          },
        ],
        output: `// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`,
        errors: [
          {
            // Configuration error should also be reported
            messageId: "invalidRuleConfiguration",
            data: {
              details:
                'Invalid regular expression for option "storyPathPattern": "[unclosed"',
            },
          },
          {
            // Because we fall back, we still use the default example text
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "[REQ-CONFIGURABLE-PATTERNS-FALLBACK-FLAT] invalid flat requirementIdPattern falls back to default and reports config error",
        code: `// @req invalid-format`,
        options: [
          {
            // invalid regex should be caught by the rule and ignored
            requirementIdPattern: "(unclosed",
          },
        ],
        errors: [
          {
            // Configuration error should also be reported
            messageId: "invalidRuleConfiguration",
            data: {
              details:
                'Invalid regular expression for option "requirementIdPattern": "(unclosed"',
            },
          },
          {
            // Because we fall back, we still use the default example text
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "invalid-format" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
      {
        name: "[REQ-PATTERN-CONFIG] nested story.pattern takes precedence over flat storyPathPattern and its example",
        code: `// @story not-matching.mdx`,
        options: [
          {
            story: {
              pattern: "^stories\\/nested-only\\.story\\.mdx$",
              example: "stories/nested-only.story.mdx",
            },
            storyPathPattern:
              "^docs\\/stories\\/should-not-apply\\.story\\.mdx$",
            storyPathExample: "docs/stories/should-not-apply.story.mdx",
          },
        ],
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "not-matching.mdx" for @story annotation. Expected a path like "stories/nested-only.story.mdx".',
            },
          },
        ],
      },
      {
        name: "[REQ-PATTERN-CONFIG] nested req.pattern takes precedence over flat requirementIdPattern and its example",
        code: `// @req DOES-NOT-MATCH`,
        options: [
          {
            req: {
              pattern: "^REQ-[0-9]{4}$",
              example: "REQ-0001",
            },
            requirementIdPattern: "^[A-Z]+-[0-9]+$",
            requirementIdExample: "PROJECT-123",
          },
        ],
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "DOES-NOT-MATCH" for @req annotation. Expected an identifier like "REQ-0001" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
      {
        name: "[REQ-EXAMPLE-MESSAGES] nested story example text overrides flat storyPathExample in error messages",
        code: `// @story invalid/path.txt`,
        options: [
          {
            story: {
              pattern: "^stories\\/special\\/.+\\.story\\.mdx$",
              example: "stories/special/example.story.mdx",
            },
            storyPathPattern: "^stories\\/ignored\\/.+\\.story\\.mdx$",
            storyPathExample: "stories/ignored/example.story.mdx",
          },
        ],
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "invalid/path.txt" for @story annotation. Expected a path like "stories/special/example.story.mdx".',
            },
          },
        ],
      },
      {
        name: "[REQ-EXAMPLE-MESSAGES] nested req example text overrides flat requirementIdExample in error messages",
        code: `// @req bad-id`,
        options: [
          {
            req: {
              pattern: "^REQ-[A-Z]+-[0-9]{3}$",
              example: "REQ-FOO-001",
            },
            requirementIdPattern: "^[A-Z]+-[0-9]+$",
            requirementIdExample: "PROJECT-123",
          },
        ],
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "bad-id" for @req annotation. Expected an identifier like "REQ-FOO-001" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
    ],
  });
});
