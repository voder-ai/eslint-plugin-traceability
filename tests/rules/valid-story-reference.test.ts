/**
 * Tests for: docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Verify valid-story-reference rule enforces existing .story.md files
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/valid-story-reference";
import { storyExists } from "../../src/utils/storyReferenceUtils";

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

describe("Valid Story Reference Rule Error Handling (Story 006.0-DEV-FILE-VALIDATION)", () => {
  /**
   * @req REQ-ERROR-HANDLING - Verify storyExists swallows fs errors and returns false
   * instead of throwing when filesystem operations fail.
   * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
   */
  const fs = require("fs");

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("[REQ-ERROR-HANDLING] storyExists returns false when fs throws", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => {
      const err: NodeJS.ErrnoException = new Error("EACCES: permission denied");
      err.code = "EACCES";
      throw err;
    });

    jest.spyOn(fs, "statSync").mockImplementation(() => {
      const err: NodeJS.ErrnoException = new Error("EACCES: permission denied");
      err.code = "EACCES";
      throw err;
    });

    expect(() =>
      storyExists(["docs/stories/permission-denied.story.md"]),
    ).not.toThrow();

    expect(storyExists(["docs/stories/permission-denied.story.md"])).toBe(
      false,
    );
  });
});
