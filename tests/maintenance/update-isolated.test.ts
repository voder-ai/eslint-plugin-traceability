/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { updateAnnotationReferences } from "../../src/maintenance/update";

describe("updateAnnotationReferences isolated (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-UPDATE] updates @story annotations in files", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-"));
    try {
      const filePath = path.join(tmpDir, "file.ts");
      const originalContent = `
/**
 * @story old.path.md
 */
function foo() {}
`;
      fs.writeFileSync(filePath, originalContent, "utf8");

      const count = updateAnnotationReferences(
        tmpDir,
        "old.path.md",
        "new.path.md",
      );
      expect(count).toBe(1);

      const updatedContent = fs.readFileSync(filePath, "utf8");
      expect(updatedContent).toContain("@story new.path.md");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-UPDATE] should return 0 when directory does not exist", () => {
    const count = updateAnnotationReferences("non-existent-dir", "old.md", "new.md");
    expect(count).toBe(0);
  });
});
