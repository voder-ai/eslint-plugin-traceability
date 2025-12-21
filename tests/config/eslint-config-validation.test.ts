/* eslint-disable traceability/valid-annotation-format */
/**
 * Tests for ESLint config rule schemas.
 *
 * @supports docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @req REQ-RULE-OPTIONS
 * @req REQ-CONFIG-VALIDATION
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 */

import validStoryReference from "../../src/rules/valid-story-reference";
import { FlatESLint } from "eslint/use-at-your-own-risk";
import plugin from "../../src/index";

/** @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md */
describe("ESLint Configuration Setup (Story 002.0-DEV-ESLINT-CONFIG)", () => {
  it("[REQ-RULE-OPTIONS] rule meta.schema defines expected properties", () => {
    const schema = ((validStoryReference.meta as any).schema as any)[0];
    expect(schema.properties).toHaveProperty("storyDirectories");
    expect(schema.properties).toHaveProperty("allowAbsolutePaths");
    expect(schema.properties).toHaveProperty("requireStoryExtension");
  });

  it("[REQ-CONFIG-VALIDATION] schema disallows unknown options", () => {
    const schema = ((validStoryReference.meta as any).schema as any)[0];
    expect(schema.additionalProperties).toBe(false);
  });

  it("[REQ-CONFIG-VALIDATION] ESLint throws on unknown rule option", async () => {
    const eslint = new FlatESLint({
      overrideConfig: [
        {
          plugins: {
            traceability: plugin as any,
          },
          rules: {
            "traceability/valid-story-reference": [
              "error",
              {
                storyDirectories: ["stories"],
                allowAbsolutePaths: false,
                requireStoryExtension: true,
                unknownOptionKey: true,
              } as any,
            ],
          },
        },
      ],
      overrideConfigFile: true,
      ignore: false,
    } as any);

    let caughtError: unknown;
    try {
      await eslint.lintText("const x = 1;");
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const message = String((caughtError as Error).message || caughtError);
    expect(message).toContain("traceability/valid-story-reference");
    expect(message.toLowerCase()).toContain("additional");
    expect(message.toLowerCase()).toContain("unexpected property");
    expect(message).toContain("unknownOptionKey");
  });

  it("[REQ-CONFIG-VALIDATION] ESLint throws on invalid option type", async () => {
    const eslint = new FlatESLint({
      overrideConfig: [
        {
          plugins: {
            traceability: plugin as any,
          },
          rules: {
            "traceability/valid-story-reference": [
              "error",
              {
                // storyDirectories must be an array, not a string
                storyDirectories: "not-an-array" as any,
              },
            ],
          },
        },
      ],
      overrideConfigFile: true,
      ignore: false,
    } as any);

    let caughtError: unknown;
    try {
      await eslint.lintText("const y = 2;");
    } catch (err) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(Error);
    const message = String((caughtError as Error).message || caughtError);
    expect(message).toContain("traceability/valid-story-reference");
    expect(message).toContain("not-an-array");
    expect(message.toLowerCase()).toContain("array");
  });
});