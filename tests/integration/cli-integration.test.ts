/**
 * Tests for CLI integration of the traceability plugin.
 * Validates that the plugin registers correctly and enforces
 * traceability-related rules when invoked via the ESLint CLI.
 *
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 */
/**
 * Tests for CLI integration functionality
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
import { spawnSync } from "child_process";
import path from "path";

const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
const configPath = path.resolve(__dirname, "../../eslint.config.js");

interface TestCase {
  name: string;
  code: string;
  rule: string;
  expectedStatus: number;
}

const cliIntegrationTestCases: TestCase[] = [
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
 * @req REQ-ANNOTATION-REQUIRED
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

/**
 * Helper to run ESLint CLI with a single rule for integration tests
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
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
  const result = spawnSync(process.execPath, [eslintCliPath, ...args], {
    encoding: "utf-8",
    input: code,
  });
  return result;
}

/**
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
 */
function runCliIntegrationTestCase({ code, rule, expectedStatus }: TestCase) {
  const result = runEslint(code, rule);
  expect(result.status).toBe(expectedStatus);
}

/**
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
 */
function cliIntegrationSuite() {
  it.each(cliIntegrationTestCases)(
    "[REQ-PLUGIN-STRUCTURE] $name",
    runCliIntegrationTestCase,
  );
}

describe("CLI Integration (Story 001.0-DEV-PLUGIN-SETUP)", cliIntegrationSuite);
