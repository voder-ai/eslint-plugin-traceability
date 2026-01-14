/* eslint-disable traceability/valid-req-reference */
/**
 * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-RULE-REGISTRY REQ-CONFIG-SYSTEM
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SEVERITY
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin default export and configs in src/index.ts
 * @req REQ-ERROR-SEVERITY - Validate error severity configuration in plugin configs
 */
import plugin, { rules, configs } from "../src/index";

describe("Plugin Default Export and Configs (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  it("[REQ-PLUGIN-STRUCTURE] default export includes rules and configs", () => {
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
  });

  it("[REQ-PLUGIN-STRUCTURE] rules object has correct rule names", () => {
    // Arrange: expected rule names in insertion order
    const expected = [
      "require-traceability",
      "require-story-annotation",
      "require-req-annotation",
      "require-branch-annotation",
      "valid-annotation-format",
      "valid-story-reference",
      "valid-req-reference",
      "prefer-implements-annotation",
      "require-test-traceability",
      "no-redundant-annotation",
      "prefer-supports-annotation",
    ];
    // Act: get actual rule names from plugin
    const actual = Object.keys(rules);
    // Assert: actual matches expected
    expect(actual).toEqual(expected);
  });

  it("[REQ-RULE-REGISTRY] configs.recommended contains correct rule configuration", () => {
    const recommendedRules = configs.recommended[0].rules;
    expect(recommendedRules).toHaveProperty(
      "traceability/require-traceability",
      "error",
    );
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

  it("[REQ-ERROR-SEVERITY] configs.recommended maps valid-annotation-format to warn and others to error", () => {
    const recommendedRules = configs.recommended[0].rules;

    expect(recommendedRules).toHaveProperty(
      "traceability/valid-annotation-format",
      "warn",
    );
    expect(recommendedRules).toHaveProperty(
      "traceability/require-traceability",
      "error",
    );
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
    expect(recommendedRules).toHaveProperty(
      "traceability/valid-story-reference",
      "error",
    );
    expect(recommendedRules).toHaveProperty(
      "traceability/valid-req-reference",
      "error",
    );
    expect(recommendedRules).toHaveProperty(
      "traceability/require-test-traceability",
      "error",
    );
  });

  it("[REQ-ERROR-SEVERITY] configs.strict uses same severity mapping as recommended", () => {
    const strictRules = configs.strict[0].rules;
    const recommendedRules = configs.recommended[0].rules;

    expect(strictRules).toEqual(recommendedRules);
  });

  describe("Unified function-annotation rule aliases (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
    it("[REQ-ANNOTATION-REQUIRED] legacy rule names share the unified require-traceability implementation", () => {
      const unified = rules["require-traceability"] as any;
      const storyAlias = rules["require-story-annotation"] as any;
      const reqAlias = rules["require-req-annotation"] as any;

      expect(typeof unified.create).toBe("function");
      expect(storyAlias.create).toBe(unified.create);
      expect(reqAlias.create).toBe(unified.create);
    });

    it("[REQ-CONFIGURABLE-SCOPE] alias rules preserve metadata needed for configuration and diagnostics", () => {
      const unified = rules["require-traceability"] as any;
      const storyAlias = rules["require-story-annotation"] as any;
      const reqAlias = rules["require-req-annotation"] as any;

      // All variants should expose a schema and messages map so that options
      // like scope/exportPriority and the core diagnostics remain available.
      expect(unified.meta?.schema).toBeDefined();
      expect(storyAlias.meta?.schema).toBeDefined();
      expect(reqAlias.meta?.schema).toBeDefined();

      expect(unified.meta?.messages).toBeDefined();
      expect(storyAlias.meta?.messages).toBeDefined();
      expect(reqAlias.meta?.messages).toBeDefined();
    });
  });
});
