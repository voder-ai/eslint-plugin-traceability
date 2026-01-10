/**
 * Tests for circular reference detection in maintenance reports
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Handle circular reference edge cases
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-REPORT
 */
import fs from "fs";
import path from "path";
import os from "os";
import { generateMaintenanceReport } from "../../src/maintenance/report";

describe("Circular Reference Detection (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  describe("[REQ-MAINT-REPORT] detect circular story references", () => {
    it("should detect simple circular reference (A -> B -> A)", () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circular-simple-"));
      try {
        // Create story A referencing story B
        const storyAPath = path.join(tmpDir, "docs", "stories", "A.story.md");
        fs.mkdirSync(path.dirname(storyAPath), { recursive: true });
        fs.writeFileSync(
          storyAPath,
          "# Story A\n@story docs/stories/B.story.md\n",
          "utf8",
        );

        // Create story B referencing story A
        const storyBPath = path.join(tmpDir, "docs", "stories", "B.story.md");
        fs.writeFileSync(
          storyBPath,
          "# Story B\n@story docs/stories/A.story.md\n",
          "utf8",
        );

        const report = generateMaintenanceReport(tmpDir);

        expect(report).toContain("Circular reference");
        expect(report).toContain("A.story.md");
        expect(report).toContain("B.story.md");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should detect complex circular reference (A -> B -> C -> A)", () => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "circular-complex-"),
      );
      try {
        const storiesDir = path.join(tmpDir, "docs", "stories");
        fs.mkdirSync(storiesDir, { recursive: true });

        // Create story A -> B
        fs.writeFileSync(
          path.join(storiesDir, "A.story.md"),
          "@story docs/stories/B.story.md\n",
          "utf8",
        );

        // Create story B -> C
        fs.writeFileSync(
          path.join(storiesDir, "B.story.md"),
          "@story docs/stories/C.story.md\n",
          "utf8",
        );

        // Create story C -> A
        fs.writeFileSync(
          path.join(storiesDir, "C.story.md"),
          "@story docs/stories/A.story.md\n",
          "utf8",
        );

        const report = generateMaintenanceReport(tmpDir);

        expect(report).toContain("Circular reference");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should handle self-referencing story", () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "circular-self-"));
      try {
        const storiesDir = path.join(tmpDir, "docs", "stories");
        fs.mkdirSync(storiesDir, { recursive: true });

        // Create story that references itself
        fs.writeFileSync(
          path.join(storiesDir, "self.story.md"),
          "@story docs/stories/self.story.md\n",
          "utf8",
        );

        const report = generateMaintenanceReport(tmpDir);

        expect(report).toContain("Circular reference");
        expect(report).toContain("self.story.md");
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should not report false positives for non-circular references", () => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "no-circular-"));
      try {
        const storiesDir = path.join(tmpDir, "docs", "stories");
        fs.mkdirSync(storiesDir, { recursive: true });

        // Create linear chain A -> B -> C
        fs.writeFileSync(
          path.join(storiesDir, "A.story.md"),
          "@story docs/stories/B.story.md\n",
          "utf8",
        );

        fs.writeFileSync(
          path.join(storiesDir, "B.story.md"),
          "@story docs/stories/C.story.md\n",
          "utf8",
        );

        fs.writeFileSync(
          path.join(storiesDir, "C.story.md"),
          "# Story C\nNo references\n",
          "utf8",
        );

        const report = generateMaintenanceReport(tmpDir);

        // Should not contain circular reference warnings
        // (may contain empty string or only stale annotations if any)
        if (report) {
          expect(report).not.toContain("Circular reference");
        }
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });

    it("should handle multiple separate circular chains", () => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "circular-multiple-"),
      );
      try {
        const storiesDir = path.join(tmpDir, "docs", "stories");
        fs.mkdirSync(storiesDir, { recursive: true });

        // Chain 1: A <-> B
        fs.writeFileSync(
          path.join(storiesDir, "A.story.md"),
          "@story docs/stories/B.story.md\n",
          "utf8",
        );

        fs.writeFileSync(
          path.join(storiesDir, "B.story.md"),
          "@story docs/stories/A.story.md\n",
          "utf8",
        );

        // Chain 2: X <-> Y
        fs.writeFileSync(
          path.join(storiesDir, "X.story.md"),
          "@story docs/stories/Y.story.md\n",
          "utf8",
        );

        fs.writeFileSync(
          path.join(storiesDir, "Y.story.md"),
          "@story docs/stories/X.story.md\n",
          "utf8",
        );

        const report = generateMaintenanceReport(tmpDir);

        expect(report).toContain("Circular reference");
        // Should detect both chains
        const circularCount = (report.match(/Circular reference/g) || [])
          .length;
        expect(circularCount).toBeGreaterThanOrEqual(2);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
