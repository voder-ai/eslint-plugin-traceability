/* eslint-disable traceability/valid-req-reference */
/**
 * Prettier integration tests for CatchClause annotation positions.
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-PRETTIER-COMPATIBILITY
 */
import path from "path";
import { spawnSync } from "child_process";
import { formatWithPrettier } from "./prettier-test-helpers";

describe("CatchClause annotations with Prettier (Story 025.0-DEV-CATCH-ANNOTATION-POSITION)", () => {
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
      "catch.js",
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

  it("[REQ-PRETTIER-COMPATIBILITY-BEFORE] accepts code where annotations start before catch but are moved inside by Prettier", () => {
    const original = `
function doSomething() {
  return 42;
}

function handleError(error) {
  console.error(error);
}

// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-TRY
try {
  doSomething();
}
// @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
// @req REQ-CATCH-PATH
catch (error) {
  handleError(error);
}
`;

    const formatted = formatWithPrettier(original);

    // Sanity check: Prettier should move the branch annotations inside the catch body.
    expect(formatted).toContain("catch (error) {");
    const catchIndex = formatted.indexOf("catch (error) {");
    const storyIndex = formatted.indexOf(
      "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
    );
    expect(storyIndex).toBeGreaterThan(catchIndex);

    const result = runEslintWithRequireBranchAnnotation(formatted);

    expect(result.status).toBe(0);
  });

  it("[REQ-PRETTIER-COMPATIBILITY-INSIDE] accepts code where annotations start inside the catch body and are preserved by Prettier", () => {
    const original = `
function doSomething() {
  return 42;
}

function handleError(error) {
  console.error(error);
}

// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-TRY
try {
  doSomething();
} catch (error) {
  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
  // @req REQ-CATCH-INSIDE
  handleError(error);
}
`;

    const formatted = formatWithPrettier(original);

    // Sanity: annotations should still be associated with the catch body after formatting.
    expect(formatted).toContain("catch (error) {");
    const catchIndex = formatted.indexOf("catch (error) {");
    const storyIndex = formatted.indexOf(
      "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
    );
    expect(storyIndex).toBeGreaterThan(catchIndex);

    const result = runEslintWithRequireBranchAnnotation(formatted);

    expect(result.status).toBe(0);
  });

  it("[REQ-PRETTIER-COMPATIBILITY-EMPTY] accepts empty catch blocks with inside-catch annotations after Prettier formatting", () => {
    const original = `
function doSomething() {
  return 42;
}

// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-TRY
try {
  doSomething();
} catch (error) {
  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
  // @req REQ-CATCH-EMPTY
}
`;

    const formatted = formatWithPrettier(original);

    const result = runEslintWithRequireBranchAnnotation(formatted);

    expect(result.status).toBe(0);
  });
});
