/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 */
import * as path from "path";
import * as os from "os";
import { detectStaleAnnotations } from "../../src/maintenance/detect";
const fs = require("fs");

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

  /**
   * [REQ-MAINT-DETECT]
   * Ensure detectStaleAnnotations does not perform filesystem checks for malicious
   * @story paths that escape the workspace (Story 009.0-DEV-MAINTENANCE-TOOLS).
   */
  it("[REQ-MAINT-DETECT] does not stat or check existence of malicious story paths outside workspace", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-workspace-"));
    const maliciousRelative = "../outside-project.story.md";
    const maliciousAbsolute = "/etc/passwd.story.md";

    const filePath = path.join(tmpDir, "file.ts");
    const content = `
/**
 * @story ${maliciousRelative}
 * @story ${maliciousAbsolute}
 */
`;
    fs.writeFileSync(filePath, content, "utf8");

    const existsCalls: string[] = [];

    const originalExistsSync = fs.existsSync;
    const existsSpy = jest
      .spyOn(fs, "existsSync")
      .mockImplementation((p: any) => {
        const strPath = typeof p === "string" ? p : p.toString();
        existsCalls.push(strPath);
        return originalExistsSync(p);
      });

    try {
      detectStaleAnnotations(tmpDir);

      const allPathsChecked = [...existsCalls];

      expect(allPathsChecked).not.toContain(maliciousRelative);
      expect(allPathsChecked).not.toContain(maliciousAbsolute);

      // Also ensure no resolved variants of these paths were checked
      const resolvedRelative = path.resolve(tmpDir, maliciousRelative);
      expect(allPathsChecked).not.toContain(resolvedRelative);
      expect(
        allPathsChecked.some((p) => p.includes("outside-project.story.md")),
      ).toBe(false);
      expect(allPathsChecked.some((p) => p.includes("passwd.story.md"))).toBe(
        false,
      );
    } finally {
      existsSpy.mockRestore();
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors
      }
    }
  });
});
