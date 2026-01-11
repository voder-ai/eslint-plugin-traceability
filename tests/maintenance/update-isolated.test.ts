/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
 */
/* eslint-disable traceability/valid-annotation-format */
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

      const result = updateAnnotationReferences(
        tmpDir,
        "old.path.md",
        "new.path.md",
      );
      expect(result.count).toBe(1);
      expect(result.warnings).toEqual([]);

      const updatedContent = fs.readFileSync(filePath, "utf8");
      expect(updatedContent).toContain("@story new.path.md");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-UPDATE#1] updates @supports annotations in files", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-"));
    try {
      const filePath = path.join(tmpDir, "file.ts");
      const originalContent = `
/**
 * @story old.path.md
 * @req REQ-MAINT-UPDATE#1
 * @supports old.path.md REQ-TEST REQ-OTHER
 */
function foo() {}
`;
      fs.writeFileSync(filePath, originalContent, "utf8");

      const result = updateAnnotationReferences(
        tmpDir,
        "old.path.md",
        "new.path.md",
      );
      expect(result.count).toBe(2); // Both @story and @supports updated
      expect(result.warnings).toEqual([]);

      const updatedContent = fs.readFileSync(filePath, "utf8");
      expect(updatedContent).toContain("@story new.path.md");
      expect(updatedContent).toContain(
        "@supports new.path.md REQ-TEST REQ-OTHER",
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-UPDATE] detects malformed @story annotations", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-"));
    try {
      const filePath = path.join(tmpDir, "file.ts");
      const originalContent = `
/**
 * @story
 */
function foo() {}
`;
      fs.writeFileSync(filePath, originalContent, "utf8");

      const result = updateAnnotationReferences(
        tmpDir,
        "old.path.md",
        "new.path.md",
      );
      expect(result.count).toBe(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("@story annotation without path");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-UPDATE] detects malformed @supports annotations", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tmp-"));
    try {
      const filePath = path.join(tmpDir, "file.ts");
      const originalContent = `
/**
 * @supports
 */
function foo() {}
`;
      fs.writeFileSync(filePath, originalContent, "utf8");

      const result = updateAnnotationReferences(
        tmpDir,
        "old.path.md",
        "new.path.md",
      );
      expect(result.count).toBe(0);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain(
        "@supports annotation without path/requirements",
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("[REQ-MAINT-UPDATE] should return 0 count when directory does not exist", () => {
    const result = updateAnnotationReferences(
      "non-existent-dir",
      "old.md",
      "new.md",
    );
    expect(result.count).toBe(0);
    expect(result.warnings).toEqual([]);
  });
});
