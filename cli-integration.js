#!/usr/bin/env node
/**
 * CLI integration tests script for ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
const { spawnSync } = require("child_process");
const path = require("path");

// Resolve the ESLint CLI binary and configuration path
const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
const configPath = path.resolve(__dirname, "eslint.config.js");

// Define CLI integration test scenarios
const tests = [
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
    name: "reports error when @req annotation uses path traversal",
    code: `/**
 * @req ../docs/requirements/REQ-INVALID.md
 */
function bar() {}`,
    rule: "traceability/valid-req-reference:error",
    expectedStatus: 1,
  },
  {
    name: "reports error when @req annotation uses absolute path",
    code: `/**
 * @req /etc/passwd
 */
function baz() {}`,
    rule: "traceability/valid-req-reference:error",
    expectedStatus: 1,
  },
];

/**
 * Run ESLint CLI with given code and rule override
 * @param {string} code Source code to lint via stdin
 * @param {string} rule ESLint rule override e.g. "traceability/require-story-annotation:error"
 * @returns {object} Result of spawnSync call
 */
function runEslint(code, rule) {
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

// Execute tests and report results
let failures = 0;
tests.forEach((test) => {
  const result = runEslint(test.code, test.rule);
  const passed = result.status === test.expectedStatus;
  if (passed) {
    console.log(`✓ ${test.name}`);
  } else {
    console.error(`✗ ${test.name}`);
    console.error(
      `  Expected exit code ${test.expectedStatus}, got ${result.status}`,
    );
    if (result.stdout) console.error(`  stdout: ${result.stdout}`);
    if (result.stderr) console.error(`  stderr: ${result.stderr}`);
    failures++;
  }
});

process.exit(failures > 0 ? 1 : 0);
