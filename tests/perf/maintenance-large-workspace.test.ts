/**
 * Performance and stress tests for maintenance tools on large workspaces.
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-VERIFY REQ-MAINT-REPORT REQ-MAINT-UPDATE REQ-MAINT-BATCH
 */
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { performance } from "perf_hooks";
import { detectStaleAnnotations } from "../../src/maintenance/detect";
import {
  batchUpdateAnnotations,
  verifyAnnotations,
} from "../../src/maintenance/batch";
import { generateMaintenanceReport } from "../../src/maintenance/report";
import { updateAnnotationReferences } from "../../src/maintenance/update";

/**
 * Shape of the synthetic large workspace:
 * - 10 modules (module-000 .. module-009)
 * - 50 files per module (file-000.ts .. file-049.ts)
 * - Each file includes a mix of valid and stale @story references.
 */
function createLargeWorkspace(): { root: string; cleanup: () => void } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "traceability-large-"));

  // Create a pool of story files that will be considered "valid".
  const validStories: string[] = [];
  for (let i = 0; i < 250; i += 1) {
    const storyName = `valid-story-${i.toString().padStart(4, "0")}.story.md`;
    const storyPath = path.join(root, storyName);
    fs.writeFileSync(storyPath, `# ${storyName}`, "utf8");
    validStories.push(storyName);
  }

  let validIndex = 0;
  let staleIndex = 0;

  for (let moduleIndex = 0; moduleIndex < 10; moduleIndex += 1) {
    const moduleDir = path.join(
      root,
      `module-${moduleIndex.toString().padStart(3, "0")}`,
    );
    fs.mkdirSync(moduleDir);

    for (let fileIndex = 0; fileIndex < 50; fileIndex += 1) {
      const filePath = path.join(
        moduleDir,
        `file-${fileIndex.toString().padStart(3, "0")}.ts`,
      );

      const validStory =
        validStories[validIndex % validStories.length] ??
        "valid-story-0000.story.md";
      validIndex += 1;

      const staleStory = `stale-story-${staleIndex
        .toString()
        .padStart(4, "0")}.story.md`;
      staleIndex += 1;

      const content = `/**
 * @story ${validStory}
 * @story ${staleStory}
 */
export function example_${moduleIndex}_${fileIndex}() {}
`;
      fs.writeFileSync(filePath, content, "utf8");
    }
  }

  return {
    root,
    cleanup: () => {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

describe("Maintenance tools on large workspaces (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let workspace: { root: string; cleanup: () => void };

  beforeAll(() => {
    workspace = createLargeWorkspace();
  });

  afterAll(() => {
    workspace.cleanup();
  });

  it("[REQ-MAINT-DETECT] detectStaleAnnotations completes within a generous time budget", () => {
    const start = performance.now();
    const stale = detectStaleAnnotations(workspace.root);
    const durationMs = performance.now() - start;

    // Sanity check: we expect at least some stale entries due to the generated stale-story-* references.
    expect(stale.length).toBeGreaterThan(0);

    // Guardrail: this operation should remain comfortably under ~5 seconds on CI hardware.
    expect(durationMs).toBeLessThan(5000);
  });

  it("[REQ-MAINT-VERIFY] verifyAnnotations remains fast on large workspaces", () => {
    const start = performance.now();
    const result = verifyAnnotations(workspace.root);
    const durationMs = performance.now() - start;

    // With both valid and stale references, verification should report false.
    expect(result).toBe(false);
    expect(durationMs).toBeLessThan(5000);
  });

  it("[REQ-MAINT-REPORT] generateMaintenanceReport produces output within a generous time budget", () => {
    const start = performance.now();
    const report = generateMaintenanceReport(workspace.root);
    const durationMs = performance.now() - start;

    expect(report).not.toBe("");
    expect(durationMs).toBeLessThan(5000);
  });

  it("[REQ-MAINT-UPDATE] updateAnnotationReferences and batchUpdateAnnotations remain tractable", () => {
    const exampleOldPath = "stale-story-0000.story.md";
    const exampleNewPath = "updated-story-0000.story.md";

    const singleStart = performance.now();
    const updatedCount = updateAnnotationReferences(
      workspace.root,
      exampleOldPath,
      exampleNewPath,
    );
    const singleDuration = performance.now() - singleStart;

    expect(updatedCount).toBeGreaterThan(0);
    expect(singleDuration).toBeLessThan(5000);

    const batchStart = performance.now();
    const totalUpdated = batchUpdateAnnotations(workspace.root, [
      {
        oldPath: "stale-story-0001.story.md",
        newPath: "updated-story-0001.story.md",
      },
      {
        oldPath: "stale-story-0002.story.md",
        newPath: "updated-story-0002.story.md",
      },
    ]);
    const batchDuration = performance.now() - batchStart;

    expect(totalUpdated).toBeGreaterThanOrEqual(2);
    expect(batchDuration).toBeLessThan(5000);
  });
});
