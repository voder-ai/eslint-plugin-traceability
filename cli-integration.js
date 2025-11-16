#!/usr/bin/env node
/* eslint-env node */
/**
 * CLI integration tests for ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
const { spawnSync } = require("child_process");
const path = require("path");
const eslintBin = path.resolve(__dirname, "node_modules/.bin/eslint");
const configPath = path.resolve(__dirname, "eslint.config.js");

/**
 * Helper to execute ESLint CLI integration tests for the traceability plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Utility for invoking ESLint with flat config in integration tests
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
  return spawnSync("node", ["--experimental-vm-modules", eslintBin, ...args], {
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
