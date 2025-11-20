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

/**
 * Helper to run the valid-story-reference rule against a single source string
 * and collect reported diagnostics.
 *
 * @req REQ-ERROR-HANDLING - Used to verify fileAccessError reporting behavior
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 */
function runRuleOnCode(code: string) {
  const messages: any[] = [];

  const context: any = {
    report: (descriptor: any) => {
      messages.push(descriptor);
    },
    getSourceCode: () => ({
      text: code,
      getAllComments: () => [
        {
          type: "Line",
          value: code.replace(/^\/\//, "").trim(),
        },
      ],
    }),
    options: [],
    parserOptions: { ecmaVersion: 2020 },
  };

  const listeners = rule.create(context);

  if (typeof listeners.Program === "function") {
    listeners.Program({} as any);
  }

  return messages;
}

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

  /**
   * @req REQ-ERROR-HANDLING - Verify rule reports fileAccessError when filesystem operations fail
   * instead of treating it as a missing file.
   * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
   */
  it("[REQ-ERROR-HANDLING] rule reports fileAccessError when fs throws", () => {
    const accessError = new Error(
      "EACCES: permission denied while accessing",
    ) as NodeJS.ErrnoException;
    accessError.code = "EACCES";

    jest.spyOn(fs, "existsSync").mockImplementation(() => {
      throw accessError;
    });

    jest.spyOn(fs, "statSync").mockImplementation(() => {
      throw accessError;
    });

    const diagnostics = runRuleOnCode(
      `// @story docs/stories/fs-error.story.md`,
    );

    expect(diagnostics.length).toBeGreaterThan(0);
    const fileAccessDiagnostics = diagnostics.filter(
      (d) => d.messageId === "fileAccessError",
    );
    expect(fileAccessDiagnostics.length).toBeGreaterThan(0);

    const errorData = fileAccessDiagnostics[0].data;
    expect(errorData).toBeDefined();
    expect(String(errorData.error)).toMatch(/EACCES/i);
  });
});
