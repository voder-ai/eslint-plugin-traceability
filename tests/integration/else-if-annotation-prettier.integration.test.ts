/**
 * Prettier integration tests for else-if annotation positions.
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-PRETTIER-AUTOFIX-ELSE-IF
 */
import path from "path";
import { spawnSync } from "child_process";
import { formatWithPrettier } from "./prettier-test-helpers";

describe("Else-if annotations with Prettier (Story 026.0-DEV-ELSE-IF-ANNOTATION-POSITION)", () => {
  const eslintPkgDir = path.dirname(require.resolve("eslint/package.json"));
  const eslintCliPath = path.join(eslintPkgDir, "bin", "eslint.js");
  const configPath = path.resolve(__dirname, "../../eslint.config.js");

  function runEslintWithRequireBranchAnnotation(code: string) {
    const args = [
      "--no-config-lookup",
      "--config",
      configPath,
      "--stdin",
      "--stdin-filename",
      "else-if.js",
      "--rule",
      "no-unused-vars:off",
      "--rule",
      "no-magic-numbers:off",
      "--rule",
      "no-undef:off",
      "--rule",
      "no-console:off",
      "--rule",
      "traceability/require-branch-annotation:error",
    ];

    return spawnSync(process.execPath, [eslintCliPath, ...args], {
      encoding: "utf-8",
      input: code,
    });
  }

  it("[REQ-PRETTIER-COMPATIBILITY-ELSE-IF-BEFORE] accepts code where annotations start before else-if but are moved between condition and body by Prettier", () => {
    const original = `
function doA() {
  return 1;
}

function doB() {
  return 2;
}

// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (aVeryLongConditionThatForcesPrettierToWrapTheElseIfBranch && anotherCondition) {
  doA();
}
// @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
// @req REQ-DUAL-POSITION-DETECTION-ELSE-IF
else if (anotherVeryLongConditionThatForcesWrapping && someOtherCondition) {
  doB();
}
`;

    const formatted = formatWithPrettier(original);

    // Sanity checks: Prettier should keep both the else-if branch and the associated story annotation,
    // but the exact layout and comment movement may vary between versions.
    expect(formatted).toContain("else if");
    expect(formatted).toContain(
      "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
    );

    const result = runEslintWithRequireBranchAnnotation(formatted);

    expect(result.status).toBe(0);
  });

  it("[REQ-PRETTIER-COMPATIBILITY-ELSE-IF-INSIDE] accepts code where annotations start between condition and body and are preserved by Prettier", () => {
    const original = `
function doA() {
  return 1;
}

function doB() {
  return 2;
}

// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (aVeryLongConditionThatForcesPrettierToWrapTheElseIfBranch && anotherCondition) {
  doA();
} else if (
  anotherVeryLongConditionThatForcesWrapping && someOtherCondition
) {
  // @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
  // @req REQ-DUAL-POSITION-DETECTION-ELSE-IF
  doB();
}
`;

    const formatted = formatWithPrettier(original);
    // Note: Prettier's exact layout of the else-if and its comments may differ between versions;
    // the rule should accept any of the supported annotation positions regardless of formatting.

    const result = runEslintWithRequireBranchAnnotation(formatted);

    expect(result.status).toBe(0);
  });
});
