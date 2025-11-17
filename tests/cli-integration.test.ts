/**
 * Integration tests for ESLint Traceability Plugin CLI integration
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 */
import { spawnSync } from "child_process";
import path from "path";

describe("CLI Integration Tests for Traceability Rules", () => {
  // Resolve ESLint CLI path and config
  const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
  const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
  const configPath = path.resolve(__dirname, "../eslint.config.js");

  /**
   * Helper to run ESLint CLI with a single rule
   */
  function runEslint(code: string, rule: string) {
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
    return spawnSync(process.execPath, [eslintCliPath, ...args], {
      encoding: "utf-8",
      input: code,
    });
  }

  it("[REQ-PLUGIN-STRUCTURE] reports error when @story annotation is missing", () => {
    const code = "function foo() {}";
    const result = runEslint(code, "traceability/require-story-annotation:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-story-annotation/);
  });

  it("[REQ-PLUGIN-STRUCTURE] does not report error when @story annotation is present", () => {
    const code = `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function foo() {}`;
    const result = runEslint(code, "traceability/require-story-annotation:error");
    expect(result.status).toBe(0);
  });

  it("[REQ-REQ-ANNOTATION] reports error when @req annotation is missing", () => {
    const code = `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */`;
    const result = runEslint(code, "traceability/require-req-annotation:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-req-annotation/);
  });

  it("[REQ-BRANCH-DETECTION] reports error when branch annotations missing", () => {
    const code = "if (true) {}";
    const result = runEslint(code, "traceability/require-branch-annotation:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/require-branch-annotation/);
  });

  it("[REQ-FORMAT-SPECIFICATION] reports invalid annotation format", () => {
    const code = `/**
 * @story invalid/path.txt
 * @req INVALID
 */
function foo() {}`;
    const result = runEslint(code, "traceability/valid-annotation-format:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/valid-annotation-format/);
  });

  it("[REQ-FORMAT-SPECIFICATION] valid annotation format passes", () => {
    const code = `/**
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION
 */
function foo() {}`;
    const result = runEslint(code, "traceability/valid-annotation-format:error");
    expect(result.status).toBe(0);
  });

  it("[REQ-FILE-EXISTENCE] reports missing story file via CLI", () => {
    const code = "// @story docs/stories/nonexistent.story.md";
    const result = runEslint(code, "traceability/valid-story-reference:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/Story file/);
  });

  it("[REQ-EXTENSION] reports invalid extension via CLI", () => {
    const code = "// @story docs/stories/001.0-DEV-PLUGIN-SETUP.md";
    const result = runEslint(code, "traceability/valid-story-reference:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/Invalid story file extension/);
  });

  it("[REQ-DEEP-MATCH] valid story and requirement via CLI", () => {
    const code = `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE`;
    const result = runEslint(code, "traceability/valid-req-reference:error");
    expect(result.status).toBe(0);
  });

  it("[REQ-DEEP-PARSE] reports missing requirement via CLI", () => {
    const code = `// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-UNKNOWN`;
    const result = runEslint(code, "traceability/valid-req-reference:error");
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/not found/);
  });
});
