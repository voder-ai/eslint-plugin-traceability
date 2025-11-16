/**
 * Integration tests for file-validation rules via ESLint CLI
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PERFORMANCE-OPTIMIZATION - Verify CLI integration of valid-story-reference and valid-req-reference rules
 */
import { spawnSync } from "child_process";
import path from "path";

// Ensure ESLint CLI uses built plugin
const eslintBin = path.resolve(__dirname, "../../node_modules/.bin/eslint");
const configPath = path.resolve(__dirname, "../../eslint.config.js");

describe("File and Req Validation CLI Integration (Story 006.0-DEV-FILE-VALIDATION)", () => {
  function runLint(code: string, rules: string[]) {
    const ruleArgs = ["--rule", "no-unused-vars:off"];
    for (const r of rules) {
      ruleArgs.push("--rule", r);
    }
    return spawnSync(
      "node",
      [
        eslintBin,
        "--no-config-lookup",
        "--config",
        configPath,
        "--stdin",
        "--stdin-filename",
        "foo.js",
        ...ruleArgs,
      ],
      {
        encoding: "utf-8",
        input: code,
      },
    );
  }

  it("[REQ-FILE-EXISTENCE] reports missing story file via CLI", () => {
    // Arrange
    const code = "// @story docs/stories/missing-file.story.md";
    // Act
    const res = runLint(code, ["traceability/valid-story-reference:error"]);
    // Assert
    expect(res.status).toBe(1);
    expect(res.stdout).toContain("Story file");
  });

  it("[REQ-EXTENSION] reports invalid extension via CLI", () => {
    // Arrange
    const code = "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.md";
    // Act
    const res = runLint(code, ["traceability/valid-story-reference:error"]);
    // Assert
    expect(res.status).toBe(1);
    expect(res.stdout).toContain("Invalid story file extension");
  });

  it("[REQ-DEEP-PARSE] reports missing requirement via CLI", () => {
    // Arrange
    const code =
      "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n// @req REQ-UNKNOWN";
    // Act
    const res = runLint(code, ["traceability/valid-req-reference:error"]);
    // Assert
    expect(res.status).toBe(1);
    expect(res.stdout).toContain("Requirement 'REQ-UNKNOWN' not found");
  });

  it("[REQ-DEEP-MATCH] valid story and requirement via CLI", () => {
    // Arrange
    const code =
      "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n// @req REQ-PLUGIN-STRUCTURE";
    // Act
    const res = runLint(code, ["traceability/valid-req-reference:error"]);
    // Assert
    expect(res.status).toBe(0);
  });
});
