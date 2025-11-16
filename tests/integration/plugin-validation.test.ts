/**
 * Integration tests for ESLint plugin via CLI
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
/* eslint-env node, jest */
import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";

describe("ESLint CLI Integration", () => {
  const eslintBin = path.resolve(__dirname, "../../node_modules/.bin/eslint");
  const configPath = path.resolve(__dirname, "../../eslint.config.js");

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
    // Use Node to run the ESLint CLI script
    return spawnSync(
      "node",
      ["--experimental-vm-modules", eslintBin, ...args],
      { encoding: "utf-8", input: code },
    );
  }

  it("[REQ-PLUGIN-STRUCTURE] reports error when @story annotation is missing", () => {
    const code = "function foo() {}";
    const result = runEslint(
      code,
      "traceability/require-story-annotation:error",
    );
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-story-annotation/);
  });

  it("does not report error when @story annotation is present", () => {
    const code = `
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       */
      function foo() {}
    `;
    const result = runEslint(
      code,
      "traceability/require-story-annotation:error",
    );
    expect(result.status).toBe(0);
  });
});
