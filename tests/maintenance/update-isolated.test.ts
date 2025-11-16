/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 */
import * as fs from "fs";
import * as path from "path";
import { updateAnnotationReferences } from "../../src/maintenance/update";

describe("updateAnnotationReferences isolated (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  it("[REQ-MAINT-UPDATE] updates @story annotations in files", () => {
    // Create a temporary directory for testing
    const tmpDir = fs.mkdtempSync(path.join(__dirname, "tmp-"));
    const filePath = path.join(tmpDir, "file.ts");
    const originalContent = `
/**
 * @story old.path.md
 */
function foo() {}
`;
    fs.writeFileSync(filePath, originalContent, "utf8");

    // Run the function under test
    const count = updateAnnotationReferences(
      tmpDir,
      "old.path.md",
      "new.path.md",
    );
    expect(count).toBe(1);

    // Verify the file content was updated
    const updatedContent = fs.readFileSync(filePath, "utf8");
    expect(updatedContent).toContain("@story new.path.md");

    // Cleanup temporary directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
