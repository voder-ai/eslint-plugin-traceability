/**
 * Integration tests for ESLint plugin via CLI
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
/* eslint-env node, jest */
import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";

// Ensure ESLint CLI uses built plugin
const eslintBin = path.resolve(__dirname, "../../node_modules/.bin/eslint");
const configPath = path.resolve(__dirname, "../../eslint.config.js");

describe("ESLint CLI Integration (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  /**
   * Helper to run ESLint CLI with the traceability plugin and custom rule
   * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @req REQ-PLUGIN-STRUCTURE - Invoke ESLint CLI for integration testing
   */
  function runEslint(code: string, rule: string): SpawnSyncReturns<string> {
    const args = [
      "--no-config-lookup",
      "--config",
      configPath,
      "--stdin",
      "--stdin-filename",
      "foo.js",
      "--rule",
      "no-unused-vars:off",
      "--rule",
      rule,
    ];
    return spawnSync("node", [eslintBin, ...args], {
      encoding: "utf-8",
      input: code,
    });
  }

  it("[REQ-PLUGIN-STRUCTURE] reports error when @story annotation is missing", () => {
    // Arrange
    const code = "function foo() {}";
    const rule = "traceability/require-story-annotation:error";
    // Act
    const result = runEslint(code, rule);
    // Assert
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-story-annotation/);
  });

  it("[REQ-PLUGIN-STRUCTURE] does not report error when @story annotation is present", () => {
    // Arrange
    const code = `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function foo() {}`;
    const rule = "traceability/require-story-annotation:error";
    // Act
    const result = runEslint(code, rule);
    // Assert
    expect(result.status).toBe(0);
  });

  it("[REQ-REQ-CLI] reports error when @req annotation is missing", () => {
    // Arrange
    const code = "function foo() {}";
    const rule = "traceability/require-req-annotation:error";
    // Act
    const result = runEslint(code, rule);
    // Assert
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-req-annotation/);
  });

  it("[REQ-BRANCH-CLI] reports error when branch annotations missing", () => {
    // Arrange
    const code = "if (true) {}";
    const rule = "traceability/require-branch-annotation:error";
    // Act
    const result = runEslint(code, rule);
    // Assert
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-branch-annotation/);
  });
});
