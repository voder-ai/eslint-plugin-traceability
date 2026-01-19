/* eslint-disable traceability/require-traceability */

/**
 * Integration tests for unified require-traceability rule and its legacy aliases.
 *
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-UNIFIED-ALIAS-ENGINE REQ-SUPPORTS-FIRST-MODEL REQ-PRESETS-CANONICAL-RULE
 */
import { FlatESLint } from "eslint/use-at-your-own-risk";
import traceabilityPlugin, { configs } from "../../src/index";

async function lintTextWithConfig(
  text: string,
  filename: string,
  extraConfig: any,
) {
  const baseConfig = {
    plugins: {
      traceability: traceabilityPlugin,
    },
  };

  const eslint = new FlatESLint({
    overrideConfig: [baseConfig, ...extraConfig],
    overrideConfigFile: true,
    ignore: false,
  } as any);

  const [result] = await eslint.lintText(text, { filePath: filename });
  return result;
}

describe("Unified require-traceability and aliases integration (Story 010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES)", () => {
  const codeMissingAll = "function foo() {}";
  const codeWithSupportsOnly = `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction foo() {}`;
  const codeWithStoryAndReq = `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n */\nfunction foo() {}`;

  async function getDiagnosticsForRule(ruleKey: string, code: string) {
    const config = [
      {
        rules: {
          [ruleKey]: "error",
        },
      },
    ];

    const result = await lintTextWithConfig(code, "example.js", config);
    return result.messages.map((m) => ({
      ruleId: m.ruleId,
      messageId: m.messageId,
    }));
  }

  it("[REQ-UNIFIED-ALIAS-ENGINE] canonical and alias keys all report missing traceability on unannotated function", async () => {
    const ruleKeys = [
      "traceability/require-traceability",
      "traceability/require-story-annotation",
      "traceability/require-req-annotation",
    ];

    const results = await Promise.all(
      ruleKeys.map((ruleKey) => getDiagnosticsForRule(ruleKey, codeMissingAll)),
    );

    results.forEach((messages, index) => {
      const ruleKey = ruleKeys[index];
      expect(messages.length).toBeGreaterThan(0);
      messages.forEach((msg) => {
        expect(msg.ruleId).toBe(ruleKey);
      });
    });
  });

  it("[REQ-SUPPORTS-FIRST-MODEL] @supports-only annotation satisfies all three rule keys", async () => {
    const ruleKeys = [
      "traceability/require-traceability",
      "traceability/require-story-annotation",
      "traceability/require-req-annotation",
    ];

    const results = await Promise.all(
      ruleKeys.map((ruleKey) =>
        getDiagnosticsForRule(ruleKey, codeWithSupportsOnly),
      ),
    );

    results.forEach((messages) => {
      expect(messages).toHaveLength(0);
    });
  });

  it("[REQ-SUPPORTS-FIRST-MODEL] @story + @req annotation satisfies all three rule keys", async () => {
    const ruleKeys = [
      "traceability/require-traceability",
      "traceability/require-story-annotation",
      "traceability/require-req-annotation",
    ];

    const results = await Promise.all(
      ruleKeys.map((ruleKey) =>
        getDiagnosticsForRule(ruleKey, codeWithStoryAndReq),
      ),
    );

    results.forEach((messages) => {
      expect(messages).toHaveLength(0);
    });
  });

  it("[REQ-INSIDE-BRACE-PLACEMENT][REQ-ALL-BLOCK-TYPES] unified rule and aliases accept inside-brace annotations when annotationPlacement is 'inside'", async () => {
    const codeWithInsideAnnotations = `function foo() {\n  // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-FN-INSIDE\n  return 1;\n}`;

    const config = [
      {
        rules: {
          "traceability/require-traceability": "error",
          "traceability/require-story-annotation": [
            "error",
            {
              annotationPlacement: "inside",
            },
          ],
          "traceability/require-req-annotation": [
            "error",
            {
              annotationPlacement: "inside",
            },
          ],
        },
      },
    ];

    const result = await lintTextWithConfig(
      codeWithInsideAnnotations,
      "example.js",
      config,
    );

    const ruleIds = result.messages.map((m) => m.ruleId);
    expect(ruleIds).not.toContain("traceability/require-story-annotation");
    expect(ruleIds).not.toContain("traceability/require-req-annotation");
  });

  it("[REQ-PRESETS-CANONICAL-RULE] recommended preset surfaces unified and legacy diagnostics together for missing annotations", async () => {
    const result = await lintTextWithConfig(
      codeMissingAll,
      "example.js",
      configs.recommended,
    );

    const ruleIds = result.messages.map((m) => m.ruleId).sort();

    expect(ruleIds).toContain("traceability/require-traceability");
    expect(ruleIds).toContain("traceability/require-story-annotation");
    expect(ruleIds).toContain("traceability/require-req-annotation");
  });

  it("[REQ-PRESETS-CANONICAL-RULE] strict preset surfaces unified and legacy diagnostics together for missing annotations", async () => {
    const result = await lintTextWithConfig(
      codeMissingAll,
      "example.js",
      configs.strict,
    );

    const ruleIds = result.messages.map((m) => m.ruleId).sort();

    expect(ruleIds).toContain("traceability/require-traceability");
    expect(ruleIds).toContain("traceability/require-story-annotation");
    expect(ruleIds).toContain("traceability/require-req-annotation");
  });
});
