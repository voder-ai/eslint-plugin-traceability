/**
 * Tests for CLI integration script
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */

const { spawnSync } = require("child_process");
const path = require("path");

describe("CLI Integration Tests (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  test("should run without errors", () => {
    const cliPath = path.resolve(__dirname, "cli-integration.js");
    const result = spawnSync("node", [cliPath], { encoding: "utf-8" });
    // Log outputs for debugging
    console.log(result.stdout);
    console.error(result.stderr);
    expect(result.status).toBe(0);
  });
});
