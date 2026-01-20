/**
 * End-to-end tests exercising full plugin and CLI workflows
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI REQ-MAINT-UPDATE
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { ESLint } from "eslint";
import {
  updateAnnotationReferences,
  detectStaleAnnotations,
} from "../../src/maintenance";

/**
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Verify plugin works in realistic ESLint configuration
 */
describe("E2E: Plugin and CLI Integration (Stories 001.0 & 009.0)", () => {
  let tempDir: string;

  /**
   * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @req REQ-PLUGIN-STRUCTURE - Setup temp workspace for each test
   */
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "traceability-e2e-"));
  });

  /**
   * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @req REQ-PLUGIN-STRUCTURE - Cleanup temp workspace after each test
   */
  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @req REQ-PLUGIN-STRUCTURE - Verify ESLint can load and execute the plugin
   */
  it("[E2E][REQ-PLUGIN-STRUCTURE] should validate traceability annotations via ESLint", async () => {
    // Setup test workspace
    const storiesDir = path.join(tempDir, "docs", "stories");
    fs.mkdirSync(storiesDir, { recursive: true });

    const storyPath = path.join(storiesDir, "test-feature.story.md");
    fs.writeFileSync(
      storyPath,
      `# Test Feature

## Requirements
- REQ-TEST-001: Test requirement
`,
    );

    const srcFile = path.join(tempDir, "test.js");
    fs.writeFileSync(
      srcFile,
      `/**
 * @story docs/stories/test-feature.story.md
 * @req REQ-TEST-001
 */
function validFunction() {
  return true;
}

// Missing annotations
function missingAnnotation() {
  return false;
}
`,
    );

    // Configure ESLint with the plugin
    const eslint = new ESLint({
      cwd: tempDir,
      overrideConfigFile: true,
      baseConfig: {
        plugins: {
          traceability: require("../../src/index"),
        },
        rules: {
          "traceability/require-traceability": "error",
          "traceability/valid-story-reference": "error",
        },
      },
    });

    // Run linting
    const results = await eslint.lintFiles([srcFile]);

    // Verify results
    expect(results).toHaveLength(1);
    expect(results[0].errorCount).toBeGreaterThan(0);
    const messages = results[0].messages;

    // Should have error for missing annotation
    const missingAnnotationError = messages.find((m) =>
      m.message.includes("missingAnnotation"),
    );
    expect(missingAnnotationError).toBeDefined();
  }, 30_000);

  /**
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE - Verify batch update functionality works end-to-end
   */
  it("[E2E][REQ-MAINT-UPDATE] should update annotations when story files are renamed", async () => {
    // Setup initial workspace
    const storiesDir = path.join(tempDir, "docs", "stories");
    fs.mkdirSync(storiesDir, { recursive: true });

    const oldStoryPath = path.join(storiesDir, "old-feature.story.md");
    fs.writeFileSync(
      oldStoryPath,
      `# Old Feature

## Requirements
- REQ-OLD-001: Test requirement
`,
    );

    const srcFile = path.join(tempDir, "src", "feature.js");
    fs.mkdirSync(path.dirname(srcFile), { recursive: true });
    fs.writeFileSync(
      srcFile,
      `/**
 * @story docs/stories/old-feature.story.md
 * @req REQ-OLD-001
 */
function oldFeature() {
  return true;
}
`,
    );

    // Rename story file
    const newStoryPath = path.join(storiesDir, "new-feature.story.md");
    fs.renameSync(oldStoryPath, newStoryPath);

    // Update annotations
    const updateResult = updateAnnotationReferences(
      tempDir,
      "docs/stories/old-feature.story.md",
      "docs/stories/new-feature.story.md",
    );

    // Verify update succeeded
    expect(updateResult.count).toBeGreaterThan(0);
    expect(updateResult.warnings).toEqual([]);

    // Verify file content was updated
    const updatedContent = fs.readFileSync(srcFile, "utf8");
    expect(updatedContent).toContain("new-feature.story.md");
    expect(updatedContent).not.toContain("old-feature.story.md");
  });

  /**
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-CLI - Verify detection of stale annotations
   */
  it("[E2E][REQ-MAINT-CLI] should detect stale annotations after story file deletion", async () => {
    // Setup initial workspace
    const storiesDir = path.join(tempDir, "docs", "stories");
    fs.mkdirSync(storiesDir, { recursive: true });

    const storyPath = path.join(storiesDir, "deleted-feature.story.md");
    fs.writeFileSync(
      storyPath,
      `# Deleted Feature

## Requirements
- REQ-DEL-001: Test requirement
`,
    );

    const srcFile = path.join(tempDir, "src", "feature.js");
    fs.mkdirSync(path.dirname(srcFile), { recursive: true });
    fs.writeFileSync(
      srcFile,
      `/**
 * @story docs/stories/deleted-feature.story.md
 * @req REQ-DEL-001
 */
function deletedFeature() {
  return true;
}
`,
    );

    // Delete story file
    fs.unlinkSync(storyPath);

    // Detect stale annotations
    const detectResult = detectStaleAnnotations(tempDir, {});

    // Verify detection succeeded
    expect(detectResult).toHaveLength(1);
    expect(detectResult[0]).toContain("deleted-feature.story.md");
  });

  /**
   * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-PLUGIN-STRUCTURE - Full workflow: lint, fix, update, lint again
   */
  it("[E2E][FULL-WORKFLOW] should handle complete development workflow", async () => {
    // Setup test workspace
    const storiesDir = path.join(tempDir, "docs", "stories");
    fs.mkdirSync(storiesDir, { recursive: true });

    const storyPath = path.join(storiesDir, "feature-v1.story.md");
    fs.writeFileSync(
      storyPath,
      `# Feature V1

## Requirements
- REQ-FEAT-001: Feature requirement
`,
    );

    const srcFile = path.join(tempDir, "src", "feature.js");
    fs.mkdirSync(path.dirname(srcFile), { recursive: true });
    fs.writeFileSync(
      srcFile,
      `// Missing annotations - will be auto-fixed
function newFeature() {
  return true;
}
`,
    );

    // Step 1: Initial lint with auto-fix
    const eslint = new ESLint({
      cwd: tempDir,
      fix: true,
      overrideConfigFile: true,
      baseConfig: {
        plugins: {
          traceability: require("../../src/index"),
        },
        rules: {
          "traceability/require-story-annotation": "error",
        },
      },
    });

    const results1 = await eslint.lintFiles([srcFile]);
    await ESLint.outputFixes(results1);

    // Verify annotation was added
    let content = fs.readFileSync(srcFile, "utf8");
    expect(content).toContain("@story");

    // Step 2: Manually fix the annotation to point to correct story
    fs.writeFileSync(
      srcFile,
      `/**
 * @story docs/stories/feature-v1.story.md
 * @req REQ-FEAT-001
 */
function newFeature() {
  return true;
}
`,
    );

    // Step 3: Rename story file
    const newStoryPath = path.join(storiesDir, "feature-v2.story.md");
    fs.renameSync(storyPath, newStoryPath);

    // Step 4: Update annotations
    const updateResult = updateAnnotationReferences(
      tempDir,
      "docs/stories/feature-v1.story.md",
      "docs/stories/feature-v2.story.md",
    );
    expect(updateResult.count).toBeGreaterThan(0);

    // Step 5: Final lint - should pass
    const eslint2 = new ESLint({
      cwd: tempDir,
      overrideConfigFile: true,
      baseConfig: {
        plugins: {
          traceability: require("../../src/index"),
        },
        rules: {
          "traceability/require-traceability": "error",
          "traceability/valid-story-reference": "error",
        },
      },
    });

    const results2 = await eslint2.lintFiles([srcFile]);
    expect(results2[0].errorCount).toBe(0);

    // Verify final state
    content = fs.readFileSync(srcFile, "utf8");
    expect(content).toContain("feature-v2.story.md");
    expect(content).not.toContain("feature-v1.story.md");
  });
});
