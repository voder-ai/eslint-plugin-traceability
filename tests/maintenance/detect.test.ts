/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
import fs from "fs";
import path from "path";
import os from "os";
import { detectStaleAnnotations } from "../../src/maintenance/detect";

describe("detectStaleAnnotations (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-DETECT] should return empty array when no stale annotations", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "detect-test-"));
    // No annotation files are created in tmpDir to simulate no stale annotations
    const result = detectStaleAnnotations(tmpDir);
    expect(result).toEqual([]);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
