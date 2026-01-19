/* eslint-disable traceability/require-traceability */

/**
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-FORMAT-SPECIFICATION
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-CONSISTENCY REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT
 * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-PATTERN-CONFIG REQ-REGEX-VALIDATION REQ-EXAMPLE-MESSAGES REQ-BACKWARD-COMPAT
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 * @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-JSDOC-TAG-COEXISTENCE REQ-ANNOTATION-TERMINATION REQ-JSDOC-BOUNDARY-DETECTION REQ-CONTINUATION-LOGIC REQ-NO-FALSE-POSITIVES REQ-PRESERVE-MULTILINE
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
      {
        name: "[REQ-IMPLEMENTS-PARSE] valid single @supports with one story and one requirement (default patterns)",
        code: `/**
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE
 */`,
      },
      {
        name: "[REQ-IMPLEMENTS-PARSE] valid multiple @supports lines with different stories and requirements",
        code: `/**
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-FORMAT-VALIDATION
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-FORMAT-SPECIFICATION
 */`,
      },
      {
        name: "[REQ-MIXED-SUPPORT] valid mixed @story/@req/@supports usage in same block comment",
        code: `/**
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-MIXED-SUPPORT
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 */`,
      },
      {
        name: "[BUG-FIX] @story followed by @supports should not concatenate",
        code: `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */`,
      },
      {
        name: "[BUG-FIX] @req followed by @supports should not concatenate",
        code: `/**
 * @req REQ-EXAMPLE-001
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-FORMAT-SPECIFICATION
 */`,
      },
      {
        name: "[BUG-FIX] @story followed by @req should not concatenate",
        code: `/**
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-MIXED-SUPPORT
 */`,
      },
      {
        name: "[BUG-FIX] multiple consecutive @story annotations",
        code: `/**
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 */`,
      },
      {
        name: "[BUG-FIX] multiple consecutive @req annotations",
        code: `/**
 * @req REQ-FIRST
 * @req REQ-SECOND
 */`,
      },
      {
        name: "[REQ-JSDOC-TAG-COEXISTENCE] traceability before other JSDoc tags",
        code: `/**
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @req REQ-JSDOC-TAG-COEXISTENCE
 * @param {string} id - Identifier for the lookup.
 * @returns {Promise<void>} - Completes when finished.
 */
function fetchById(id) {
  return Promise.resolve();
}`,
      },
      {
        name: "[REQ-JSDOC-TAG-COEXISTENCE] traceability after other JSDoc tags",
        code: `/**
 * Fetch a user by id.
 *
 * @param {string} id - Identifier for the lookup.
 * @returns {Promise<void>} - Completes when finished.
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @req REQ-ANNOTATION-TERMINATION
 */
function fetchUser(id) {
  return Promise.resolve();
}`,
      },
      {
        name: "[REQ-JSDOC-TAG-COEXISTENCE] mixed positions of traceability and other JSDoc tags",
        code: `/**
 * Update a record with new data.
 *
 * @story docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md
 * @param {string} id - Identifier.
 * @req REQ-JSDOC-BOUNDARY-DETECTION
 * @param {object} payload - Updated fields.
 * @returns {boolean} - True if updated.
 * @req REQ-CONTINUATION-LOGIC
 */
function updateRecord(id, payload) {
  return true;
}`,
      },
      {
        name: "[REQ-PRESERVE-MULTILINE] multi-line @story annotation before other JSDoc tags",
        code: `/**
 * @story docs/stories/022.0-DEV-
 * JSDOC-COEXISTENCE.story.md
 * @param {string} id - Identifier for the lookup.
 * @returns {Promise<void>} - Completes when finished.
 */
function loadForStory(id) {
  return Promise.resolve();
}`,
      },
      {
        name: "[REQ-NO-FALSE-POSITIVES] JSDoc tags do not pollute requirement ID when following @req",
        code: `/**
 * @req REQ-OPTIMIZATION
 * @param {object} data - Input payload.
 * @returns {void}
 */
function optimize(data) {}`,
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
      makeInvalid({
        name: "[REQ-SUPPORTS-PARSE] @supports with no value is invalid",
        code: `/**
 * @supports
 */`,
        messageId: "invalidImplementsFormat",
        details:
          'Missing story path and requirement IDs for @supports annotation. Expected a value like "docs/stories/005.0-DEV-EXAMPLE.story.md REQ-EXAMPLE".',
      }),
      makeInvalid({
        name: "[REQ-SUPPORTS-PARSE] @supports with only story path and no requirement IDs is invalid",
        code: `/**
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 */`,
        messageId: "invalidImplementsFormat",
        details:
          'Missing requirement IDs for @supports annotation. Expected a value like "docs/stories/005.0-DEV-EXAMPLE.story.md REQ-EXAMPLE".',
      }),
      makeInvalid({
        name: "[REQ-FORMAT-VALIDATION] @supports with invalid story path format",
        code: `/**
 * @supports invalid/path.txt REQ-IMPLEMENTS-PARSE
 */`,
        messageId: "invalidImplementsFormat",
        details:
          'Invalid story path "invalid/path.txt" for @supports annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
      }),
      {
        name: "[REQ-FORMAT-VALIDATION] @supports with invalid requirement ID format",
        code: `/**
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-VALID invalid-format
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
        name: "[REQ-FORMAT-VALIDATION] @supports with multiple requirement IDs where one is invalid",
        code: `/**
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-VALID-1 REQ-VALID-2 bad-id
 */`,
        errors: [
          {
            messageId: "invalidReqFormat",
            data: {
              details:
                'Invalid requirement ID "bad-id" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).',
            },
          },
        ],
      },
    ],
  });
});

/**
 * Tests for shared configuration resolution (storyDirectories support).
 * Verifies that valid-annotation-format derives storyPathPattern from
 * storyDirectories when no explicit pattern is provided.
 *
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 */
describe("Valid Annotation Format Rule - Shared Configuration (storyDirectories)", () => {
  ruleTester.run("valid-annotation-format with storyDirectories", rule, {
    valid: [
      {
        name: "accepts story path matching derived pattern from single storyDirectory",
        code: `// @story stories/001.0-DEV-TEST.story.md`,
        options: [{ storyDirectories: ["stories"] }],
      },
      {
        name: "accepts story path matching derived pattern from multiple storyDirectories",
        code: `// @story custom/stories/002.0-DEV-TEST.story.md`,
        options: [{ storyDirectories: ["docs/stories", "custom/stories"] }],
      },
      {
        name: "accepts story path in default directory when storyDirectories not provided",
        code: `// @story docs/stories/003.0-DEV-TEST.story.md`,
        options: [{}],
      },
      {
        name: "explicit storyPathPattern overrides storyDirectories",
        code: `// @story any/path/works.story.md`,
        options: [
          {
            storyDirectories: ["stories"],
            storyPathPattern: "^.*\\.story\\.md$",
          },
        ],
      },
    ],
    invalid: [
      {
        name: "rejects story path not matching derived pattern from storyDirectories",
        code: `// @story wrong/004.0-DEV-TEST.story.md`,
        options: [{ storyDirectories: ["stories"] }],
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "wrong/004.0-DEV-TEST.story.md" for @story annotation. Expected a path like "stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "rejects story path not in any of multiple storyDirectories",
        code: `// @story other/005.0-DEV-TEST.story.md`,
        options: [{ storyDirectories: ["docs/stories", "custom/stories"] }],
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "other/005.0-DEV-TEST.story.md" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
      {
        name: "explicit storyPathPattern overrides storyDirectories for validation",
        code: `// @story stories/006.0-DEV-TEST.story.md`,
        options: [
          {
            storyDirectories: ["stories"],
            storyPathPattern: "^docs/.*\\.story\\.md$",
          },
        ],
        errors: [
          {
            messageId: "invalidStoryFormat",
            data: {
              details:
                'Invalid story path "stories/006.0-DEV-TEST.story.md" for @story annotation. Expected a path like "stories/005.0-DEV-EXAMPLE.story.md".',
            },
          },
        ],
      },
    ],
  });
});
