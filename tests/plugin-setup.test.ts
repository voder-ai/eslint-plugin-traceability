/**
 * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-NPM-PACKAGE
 */
import plugin, { rules, configs } from "../src/index";

describe("Traceability ESLint Plugin (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  it("[REQ-PLUGIN-STRUCTURE] plugin exports rules and configs", () => {
    expect(rules).toBeDefined();
    expect(configs).toBeDefined();
    expect(typeof rules).toBe("object");
    expect(typeof configs).toBe("object");
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
  });

  it("[REQ-PLUGIN-STRUCTURE][REQ-NPM-PACKAGE] plugin exposes meta with name, namespace, and version", () => {
    // Arrange
    const pkg = require("../package.json") as { name: string; version: string };

    // Act
    const meta = (plugin as any).meta;

    // Assert
    expect(meta).toBeDefined();
    expect(meta.name).toBe(pkg.name);
    expect(meta.version).toBe(pkg.version);
    expect(meta.namespace).toBe("traceability");
  });
});
