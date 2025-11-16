/**
 * Tests for basic plugin structure
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 */
import plugin, { rules, configs } from "../lib/index";

describe("Traceability ESLint Plugin", () => {
  it("[REQ-PLUGIN-STRUCTURE] plugin exports rules and configs", () => {
    expect(rules).toBeDefined();
    expect(configs).toBeDefined();
    expect(typeof rules).toBe("object");
    expect(typeof configs).toBe("object");
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
  });
});
