/****
 * Tests for: docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Verify valid-req-reference rule enforces existing requirement content
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
    ],
  });
});
