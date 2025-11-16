#!/usr/bin/env node
/* eslint-env node */
/**
 * CLI integration tests for ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
const { spawnSync } = require("child_process");
const path = require("path");
const configPath = path.resolve(__dirname, "eslint.config.js");

/**
 * Helper to execute ESLint CLI integration tests for the traceability plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Utility for invoking ESLint with flat config in integration tests
 */
function runEslint(code, rule) {
  const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
  const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
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
    "no-constant-condition:off",
    "--rule",
    "no-empty:off",
    "--rule",
    "traceability/require-story-annotation:off",
    "--rule",
    "traceability/require-req-annotation:off",
    "--rule",
    "traceability/require-branch-annotation:off",
    "--rule",
    "traceability/valid-annotation-format:off",
    "--rule",
    "traceability/valid-story-reference:off",
    "--rule",
    "traceability/valid-req-reference:off",
    "--rule",
    rule,
  ];
  return spawnSync(process.execPath, ['--experimental-vm-modules', eslintCliPath, ...args], {
    encoding: "utf-8",
    input: code,
  });
}

const tests = [
  {
    name: "reports error when @story annotation is missing",
    code: "function foo() {}",
    rule: "traceability/require-story-annotation:error",
    expectedStatus: 1,
  },
  {
    name: "does not report error when @story annotation is present",
    code: `
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function foo() {}
`,
    rule: "traceability/require-story-annotation:error",
    expectedStatus: 0,
  },
  {
    name: "reports error when requirement reference is missing",
    code: `/**\n * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n * @req REQ-NON-EXISTENT\n */\nfunction foo() {}`,
    rule: "traceability/valid-req-reference:error",
    expectedStatus: 1,
  },
  {
    name: "reports error when requirement reference uses path traversal",
    code: `/**\n * @story ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n * @req REQ-PLUGIN-STRUCTURE\n */\nfunction foo() {}`,
    rule: "traceability/valid-req-reference:error",
    expectedStatus: 1,
  },
  {
    name: "reports error when requirement reference uses absolute path",
    code: `/**\n * @story /absolute/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md\n * @req REQ-PLUGIN-STRUCTURE\n */\nfunction foo() {}`,
    rule: "traceability/valid-req-reference:error",
    expectedStatus: 1,
  },
  {
    name: "reports error when @req annotation is missing",
    code: `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */\nfunction foo() {}`,
    rule: "traceability/require-req-annotation:error",
    expectedStatus: 1,
  },
  {
    name: "does not report error when @req annotation is present",
    code: `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */\nfunction foo() {}`,
    rule: "traceability/require-req-annotation:error",
    expectedStatus: 0,
  },
  {
    name: "reports error for missing branch annotations",
    code: `if (true) {}`,
    rule: "traceability/require-branch-annotation:error",
    expectedStatus: 1,
  },
  {
    name: "does not report error for branch with annotations",
    code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n// @req REQ-BRANCH-DETECTION\nif (true) {}`,
    rule: "traceability/require-branch-annotation:error",
    expectedStatus: 0,
  },
  {
    name: "reports invalid annotation format",
    code: `/**\n * @story invalid/path.txt\n * @req INVALID\n */\nfunction foo() {}`,
    rule: "traceability/valid-annotation-format:error",
    expectedStatus: 1,
  },
  {
    name: "valid annotation format passes",
    code: `/**\n * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md\n * @req REQ-FORMAT-SPECIFICATION\n */\nfunction foo() {}`,
    rule: "traceability/valid-annotation-format:error",
    expectedStatus: 0,
  },
  {
    name: "reports missing story file reference",
    code: `/**\n * @story docs/stories/nonexistent.story.md\n */\nfunction foo() {}`,
    rule: "traceability/valid-story-reference:error",
    expectedStatus: 1,
  },
  {
    name: "existing story file reference passes",
    code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction foo() {}`,
    rule: "traceability/valid-story-reference:error",
    expectedStatus: 0,
  },
];

let exitCode = 0;
tests.forEach(({ name, code, rule, expectedStatus }) => {
  const result = runEslint(code, rule);
  if (result.status !== expectedStatus) {
    console.error(
      `Test "${name}" failed. Expected status ${expectedStatus}, got ${result.status}.`,
    );
    console.error("stdout:", result.stdout);
    exitCode = 1;
  }
});

process.exit(exitCode);