/**
 * Tests for: docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Verify valid-story-reference rule enforces existing .story.md files
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/valid-story-reference";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

describe("Valid Story Reference Rule (Story 006.0-DEV-FILE-VALIDATION)", () => {
  ruleTester.run("valid-story-reference", rule, {
    valid: [
      {
        name: "[REQ-FILE-EXISTENCE] valid story file reference",
        code: `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md`,
      },
      {
        name: "[REQ-EXTENSION] valid .story.md extension",
        code: `// @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md`,
      },
      {
        name: "[REQ-PATH-RESOLUTION] valid relative path with ./ prefix",
        code: `// @story ./docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md`,
      },
    ],
    invalid: [
      {
        name: "[REQ-PATH-RESOLUTION] missing file",
        code: `// @story docs/stories/missing-file.story.md`,
        errors: [
          {
            messageId: "fileMissing",
            data: { path: "docs/stories/missing-file.story.md" },
          },
        ],
      },
      {
        name: "[REQ-EXTENSION] invalid extension",
        code: `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.md`,
        errors: [
          {
            messageId: "invalidExtension",
            data: { path: "docs/stories/001.0-DEV-PLUGIN-SETUP.md" },
          },
        ],
      },
      {
        name: "[REQ-PATH-SECURITY] path traversal",
        code: `// @story ../outside.story.md`,
        errors: [
          { messageId: "invalidPath", data: { path: "../outside.story.md" } },
        ],
      },
      {
        name: "[REQ-ABSOLUTE-PATH] absolute path not allowed",
        code: `// @story /etc/passwd.story.md`,
        errors: [
          { messageId: "invalidPath", data: { path: "/etc/passwd.story.md" } },
        ],
      },
    ],
  });
});
