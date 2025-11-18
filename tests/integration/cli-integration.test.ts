/**
 * Tests for CLI integration functionality
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
import { spawnSync } from "child_process";
import path from "path";

describe("[docs/stories/001.0-DEV-PLUGIN-SETUP.story.md] CLI Integration (traceability plugin)", () => {
  const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
  const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
  const configPath = path.resolve(__dirname, "../../eslint.config.js");

  interface TestCase {
    name: string;
    code: string;
    rule: string;
    expectedStatus: number;
  }

  const tests: TestCase[] = [
    {
      name: "reports error when @story annotation is missing",
      code: "function foo() {}",
      rule: "traceability/require-story-annotation:error",
      expectedStatus: 1,
    },
    {
      name: "does not report error when @story annotation is present",
      code: `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function foo() {}`,
      rule: "traceability/require-story-annotation:error",
      expectedStatus: 0,
    },
    {
      name: "reports error when @req annotation is missing",
      code: "function bar() {}",
      rule: "traceability/require-req-annotation:error",
      expectedStatus: 1,
    },
    {
      name: "reports error when @story annotation uses path traversal and @req annotation uses path traversal",
      code: `/**
 * @story ../docs/stories/invalid.story.md
 * @req ../docs/requirements/REQ-INVALID.md
 */
function bar() {}`,
      rule: "traceability/valid-req-reference:error",
      expectedStatus: 1,
    },
    {
      name: "reports error when @story annotation uses absolute path and @req annotation uses absolute path",
      code: `/**
 * @story /absolute/path/to/story.story.md
 * @req /etc/passwd
 */
function baz() {}`,
      rule: "traceability/valid-req-reference:error",
      expectedStatus: 1,
    },
  ];

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
    const result = spawnSync(process.execPath, [eslintCliPath, ...args], {
      encoding: "utf-8",
      input: code,
    });
    return result;
  }

  tests.forEach((testCase) => {
    it(`[REQ-PLUGIN-STRUCTURE] ${testCase.name}`, () => {
      const result = runEslint(testCase.code, testCase.rule);
      expect(result.status).toBe(testCase.expectedStatus);
    });
  });
});