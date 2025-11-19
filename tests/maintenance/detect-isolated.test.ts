/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { detectStaleAnnotations } from "../../src/maintenance/detect";

describe("detectStaleAnnotations isolated (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-DETECT] returns empty array when directory does not exist", () => {
    const result = detectStaleAnnotations("non-existent-dir");
    expect(result).toEqual([]);
  });

  it("[REQ-MAINT-DETECT] detects stale annotations in nested directories", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-nested-"));
    try {
      const nestedDir = path.join(tmpDir, "nested");
      fs.mkdirSync(nestedDir);
      const filePath1 = path.join(tmpDir, "file1.ts");
      const filePath2 = path.join(nestedDir, "file2.ts");
      const content1 = `
/**
 * @story stale1.story.md
 */
`;
      fs.writeFileSync(filePath1, content1, "utf8");
      const content2 = `
/**
 * @story stale2.story.md
 */
`;
      fs.writeFileSync(filePath2, content2, "utf8");
      const result = detectStaleAnnotations(tmpDir);
      expect(result).toHaveLength(2);
      expect(result).toContain("stale1.story.md");
      expect(result).toContain("stale2.story.md");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-DETECT] throws error on permission denied", () => {
    const tmpDir2 = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-perm-"));
    const dir = path.join(tmpDir2, "subdir");
    fs.mkdirSync(dir);
    const filePath = path.join(dir, "file.ts");
    const content = `
/**
 * @story none.story.md
 */
`;
    fs.writeFileSync(filePath, content, "utf8");
    // Remove read permission
    try {
      fs.chmodSync(dir, 0o000);
      expect(() => detectStaleAnnotations(tmpDir2)).toThrow();
    } finally {
      // Restore permissions and cleanup temporary directory, ignoring errors during cleanup
      try {
        fs.chmodSync(dir, 0o700);
      } catch {
        // ignore
      }
      try {
        fs.rmSync(tmpDir2, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  });
});
