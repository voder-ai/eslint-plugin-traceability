/**
 * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - plugin exports rules and configs
 */
import plugin, { rules, configs } from "../lib/index";

describe("Traceability ESLint Plugin (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  it("[REQ-PLUGIN-STRUCTURE] plugin exports rules and configs", () => {
    expect(rules).toBeDefined();
    expect(configs).toBeDefined();
    expect(typeof rules).toBe("object");
    expect(typeof configs).toBe("object");
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
  });
});
