/**
 * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin default export and configs in src/index.ts
 */
import plugin, { rules, configs } from "../src/index";

describe("Plugin Default Export and Configs (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  it("[REQ-PLUGIN-STRUCTURE] default export includes rules and configs", () => {
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
  });

  it("[REQ-PLUGIN-STRUCTURE] rules object has correct rule names", () => {
    const expected = [
      "require-story-annotation",
      "require-req-annotation",
      "require-branch-annotation",
    ];
    expect(Object.keys(rules).sort()).toEqual(expected.sort());
  });

  it("[REQ-RULE-REGISTRY] configs.recommended contains correct rule configuration", () => {
    const recommendedRules = configs.recommended[0].rules;
    expect(recommendedRules).toHaveProperty(
      "traceability/require-story-annotation",
      "error",
    );
    expect(recommendedRules).toHaveProperty(
      "traceability/require-req-annotation",
      "error",
    );
    expect(recommendedRules).toHaveProperty(
      "traceability/require-branch-annotation",
      "error",
    );
  });

  it("[REQ-CONFIG-SYSTEM] configs.strict contains same rules as recommended", () => {
    const strictRules = configs.strict[0].rules;
    expect(strictRules).toEqual(configs.recommended[0].rules);
  });
});
