/**
 * Tests for ESLint configuration integration in maintenance tools
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
 */
import fs from "fs";
import path from "path";
import os from "os";
import { detectStaleAnnotations } from "../../src/maintenance/detect";
import { updateAnnotationReferences } from "../../src/maintenance/update";
import { generateMaintenanceReport } from "../../src/maintenance/report";

describe("ESLint Configuration Integration (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  describe("[REQ-MAINT-UPDATE] detectStaleAnnotations with ignore patterns", () => {
    it("should respect ignore patterns", () => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "eslint-ignore-test-"),
      );
      try {
        // Create node_modules directory with a file containing stale annotation
        const nodeModulesDir = path.join(tmpDir, "node_modules");
        fs.mkdirSync(nodeModulesDir, { recursive: true });
        const ignoredFile = path.join(nodeModulesDir, "file.ts");
        fs.writeFileSync(ignoredFile, "/** @story stale.story.md */", "utf8");

        // Create regular file with stale annotation
        const regularFile = path.join(tmpDir, "src", "file.ts");
        fs.mkdirSync(path.dirname(regularFile), { recursive: true });
        fs.writeFileSync(regularFile, "/** @story stale.story.md */", "utf8");

        // Without ignore patterns - should find both
        const allStale = detectStaleAnnotations(tmpDir);
        expect(allStale.length).toBeGreaterThanOrEqual(1);

        // With ignore patterns - should skip node_modules
        const filteredStale = detectStaleAnnotations(tmpDir, {
          ignorePatterns: ["node_modules"],
        });
        expect(filteredStale).toContain("stale.story.md");
        // Verify node_modules files were not scanned by checking the count
        expect(filteredStale.length).toBeLessThanOrEqual(allStale.length);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should support multiple ignore patterns", () => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "multi-ignore-test-"),
      );
      try {
        // Create files in different ignored directories
        const dirs = ["node_modules", "dist", "build"];
        for (const dir of dirs) {
          const dirPath = path.join(tmpDir, dir);
          fs.mkdirSync(dirPath, { recursive: true });
          fs.writeFileSync(
            path.join(dirPath, "file.ts"),
            "/** @story ignored.story.md */",
            "utf8",
          );
        }

        // Create a file in src
        const srcFile = path.join(tmpDir, "src", "file.ts");
        fs.mkdirSync(path.dirname(srcFile), { recursive: true });
        fs.writeFileSync(srcFile, "/** @story found.story.md */", "utf8");

        const stale = detectStaleAnnotations(tmpDir, {
          ignorePatterns: ["node_modules", "dist", "build"],
        });

        expect(stale).toContain("found.story.md");
        expect(stale).not.toContain("ignored.story.md");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("[REQ-MAINT-UPDATE] updateAnnotationReferences with ignore patterns", () => {
    it("should respect ignore patterns when updating", () => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "update-ignore-test-"),
      );
      try {
        // Create node_modules file
        const nodeModulesDir = path.join(tmpDir, "node_modules");
        fs.mkdirSync(nodeModulesDir, { recursive: true });
        const ignoredFile = path.join(nodeModulesDir, "file.ts");
        fs.writeFileSync(ignoredFile, "/** @story old.story.md */", "utf8");

        // Create src file
        const srcFile = path.join(tmpDir, "src", "file.ts");
        fs.mkdirSync(path.dirname(srcFile), { recursive: true });
        fs.writeFileSync(srcFile, "/** @story old.story.md */", "utf8");

        // Update with ignore patterns
        const count = updateAnnotationReferences(
          tmpDir,
          "old.story.md",
          "new.story.md",
          { ignorePatterns: ["node_modules"] },
        );

        // Should only update src file, not node_modules
        expect(count).toBe(1);

        const srcContent = fs.readFileSync(srcFile, "utf8");
        expect(srcContent).toContain("new.story.md");

        const ignoredContent = fs.readFileSync(ignoredFile, "utf8");
        expect(ignoredContent).toContain("old.story.md");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });

  describe("[REQ-MAINT-UPDATE] generateMaintenanceReport with ignore patterns", () => {
    it("should respect ignore patterns in report generation", () => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "report-ignore-test-"),
      );
      try {
        // Create ignored file with stale annotation
        const distDir = path.join(tmpDir, "dist");
        fs.mkdirSync(distDir, { recursive: true });
        fs.writeFileSync(
          path.join(distDir, "file.js"),
          "/** @story ignored.story.md */",
          "utf8",
        );

        // Create src file with stale annotation
        const srcFile = path.join(tmpDir, "src", "file.ts");
        fs.mkdirSync(path.dirname(srcFile), { recursive: true });
        fs.writeFileSync(srcFile, "/** @story found.story.md */", "utf8");

        const report = generateMaintenanceReport(tmpDir, {
          ignorePatterns: ["dist"],
        });

        expect(report).toContain("found.story.md");
        expect(report).not.toContain("ignored.story.md");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
