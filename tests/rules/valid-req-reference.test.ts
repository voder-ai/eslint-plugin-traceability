/* eslint-disable traceability/valid-req-reference */
/****
 * Tests for: docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Verify valid-req-reference rule enforces existing requirement content
 *
 * Additional coverage for error reporting behavior:
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ERROR-SPECIFIC - Verify requirement-level errors identify the exact missing requirement
 * @req REQ-ERROR-CONTEXT - Verify requirement-level errors include relevant story path context
 * @req REQ-ERROR-CONSISTENCY - Verify requirement-level error messages are consistent across cases
 * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-PARSE REQ-DEEP-BULLET REQ-DEEP-IMPLEMENTS REQ-DEEP-MATCH
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/valid-req-reference";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

describe("Valid Req Reference Rule (Story 010.0-DEV-DEEP-VALIDATION)", () => {
  ruleTester.run("valid-req-reference", rule, {
    valid: [
      {
        name: "[REQ-DEEP-PARSE] valid requirement reference existing in story file",
        code: `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE`,
      },
      {
        name: "[REQ-DEEP-BULLET] valid bullet list requirement existing in bullet story fixture",
        code: `// @story tests/fixtures/story_bullet.md
// @req REQ-BULLET-LIST`,
      },
      {
        name: "[REQ-DEEP-IMPLEMENTS] single supports line with multiple requirements in multi-story fixture (see 010.2-DEV-MULTI-STORY-SUPPORT)",
        code: `// @supports tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A`,
      },
      {
        name: "[REQ-DEEP-IMPLEMENTS] multi-story supports with shared requirement IDs (see 010.2-DEV-MULTI-STORY-SUPPORT)",
        code: `// @supports tests/fixtures/story_multi_a.md REQ-SHARED-ID REQ-ONLY-A
// @supports tests/fixtures/story_multi_b.md REQ-SHARED-ID REQ-ONLY-B`,
      },
    ],
    invalid: [
      {
        name: "[REQ-DEEP-MATCH] missing requirement in story file",
        code: `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-NON-EXISTENT`,
        errors: [
          {
            messageId: "reqMissing",
            data: {
              reqId: "REQ-NON-EXISTENT",
              storyPath: "docs/stories/001.0-DEV-PLUGIN-SETUP.story.md",
            },
          },
        ],
      },
      {
        name: "[REQ-DEEP-PARSE] disallow path traversal in story path",
        code: `// @story ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE`,
        errors: [
          {
            messageId: "invalidPath",
            data: {
              storyPath: "../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md",
            },
          },
        ],
      },
      {
        name: "[REQ-DEEP-PARSE] disallow absolute path in story path",
        code: `// @story /absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE`,
        errors: [
          {
            messageId: "invalidPath",
            data: {
              storyPath:
                "/absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md",
            },
          },
        ],
      },
      {
        name: "[REQ-DEEP-BULLET] missing bullet list requirement in bullet story fixture",
        code: `// @story tests/fixtures/story_bullet.md
// @req REQ-MISSING-BULLET`,
        errors: [
          {
            messageId: "reqMissing",
            data: {
              reqId: "REQ-MISSING-BULLET",
              storyPath: "tests/fixtures/story_bullet.md",
            },
          },
        ],
      },
      {
        name: "[REQ-DEEP-IMPLEMENTS] missing supports requirement in multi-story fixture (see 010.2-DEV-MULTI-STORY-SUPPORT)",
        code: `// @supports tests/fixtures/story_multi_a.md REQ-NOT-IN-A`,
        errors: [
          {
            messageId: "reqMissing",
            data: {
              reqId: "REQ-NOT-IN-A",
              storyPath: "tests/fixtures/story_multi_a.md",
            },
          },
        ],
      },
      {
        name: "[REQ-DEEP-IMPLEMENTS] disallow path traversal in supports story path (see 010.2-DEV-MULTI-STORY-SUPPORT)",
        code: `// @supports ../tests/fixtures/story_multi_a.md REQ-SHARED-ID`,
        errors: [
          {
            messageId: "invalidPath",
            data: {
              storyPath: "../tests/fixtures/story_multi_a.md",
            },
          },
        ],
      },
    ],
  });
});
