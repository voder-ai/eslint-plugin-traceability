/**
 * Tests for: docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @supports docs/stories/002.0-DEV-ESLINT-CONFIG.story.md REQ-CONFIG-PRESETS REQ-FLAT-CONFIG REQ-PROJECT-INTEGRATION
 */
import { FlatESLint } from "eslint/use-at-your-own-risk";
import { configs, default as traceabilityPlugin } from "../../src/index";

const baseConfig = {
  plugins: {
    traceability: traceabilityPlugin,
  },
  rules: {},
};

/**
 * Lints an in-memory string using a Flat Config array.
 * @supports docs/stories/002.0-DEV-ESLINT-CONFIG.story.md REQ-FLAT-CONFIG REQ-PROJECT-INTEGRATION
 */
async function lintTextWithConfig(text: string, config: any) {
  const eslint = new FlatESLint({
    overrideConfig: config,
    overrideConfigFile: true,
    ignore: false,
  } as any);

  const [result] = await eslint.lintText(text, { filePath: "example.js" });
  return result;
}

describe("Flat config presets integration (Story 002.0-DEV-ESLINT-CONFIG)", () => {
  it("[REQ-CONFIG-PRESETS] recommended preset enables traceability rules via documented usage", async () => {
    const config = [baseConfig, ...configs.recommended];

    const code = "function foo() {}";

    const result = await lintTextWithConfig(code, config);
    const ruleIds = result.messages.map((m) => m.ruleId).sort();

    expect(ruleIds).toContain("traceability/require-traceability");
    expect(ruleIds).toContain("traceability/require-story-annotation");
  });

  it("[REQ-CONFIG-PRESETS] strict preset also enables traceability rules via documented usage", async () => {
    const config = [baseConfig, ...configs.strict];
    const code = "function bar() {}";
    const result = await lintTextWithConfig(code, config);
    const ruleIds = result.messages.map((m) => m.ruleId).sort();
    expect(ruleIds).toContain("traceability/require-traceability");
    expect(ruleIds).toContain("traceability/require-story-annotation");
  });
})