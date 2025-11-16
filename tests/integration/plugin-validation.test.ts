/**
 * Integration tests for ESLint plugin via CLI
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Validate plugin registers via CLI
 */
/* eslint-env node, jest */
import { spawnSync, SpawnSyncReturns } from "child_process";
import path from "path";

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
  return spawnSync("node", [eslintBin, ...args], {
    encoding: "utf-8",
    input: code,
  });
}

const cliTests = [
  {
    name: "[REQ-PLUGIN-STRUCTURE] reports error when @story annotation is missing",
    code: "function foo() {}",
    rule: "traceability/require-story-annotation:error",
    expectedStatus: 1,
    stdoutRegex: /require-story-annotation/,
  },
  {
    name: "does not report error when @story annotation is present",
    code: "**@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction foo() {}",
    rule: "traceability/require-story-annotation:error",
    expectedStatus: 0,
  },
  {
    name: "Require Req Annotation CLI (Story 003.0-DEV-FUNCTION-ANNOTATIONS)",
    code: "function foo() {}",
    rule: "traceability/require-req-annotation:error",
    expectedStatus: 1,
    stdoutRegex: /require-req-annotation/,
  },
  {
    name: "Require Branch Annotation CLI (Story 004.0-DEV-BRANCH-ANNOTATIONS)",
    code: "if (condition) {}",
    rule: "traceability/require-branch-annotation:error",
    expectedStatus: 1,
    stdoutRegex: /require-branch-annotation/,
  },
];

describe("ESLint CLI Integration (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  test.each(cliTests)(
    "$name",
    ({ code, rule, expectedStatus, stdoutRegex }) => {
      // Arrange
      const inputCode = code;
      const testRule = rule;
      // Act
      const result = runEslint(inputCode, testRule);
      // Assert
      expect(result.status).toBe(expectedStatus);
      if (stdoutRegex) {
        expect(result.stdout).toMatch(stdoutRegex);
      }
    },
  );
});
