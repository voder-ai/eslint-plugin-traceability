/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
import fs from "fs";
import os from "os";
import path from "path";
import { updateAnnotationReferences } from "../../src/maintenance/update";

describe("updateAnnotationReferences (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-UPDATE] should return 0 when no updates made", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "update-test-"));
    try {
      const count = updateAnnotationReferences(tmpDir, "old.md", "new.md");
      expect(count).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
