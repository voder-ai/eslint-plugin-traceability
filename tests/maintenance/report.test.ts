/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 */
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { generateMaintenanceReport } from "../../src/maintenance/report";

describe("generateMaintenanceReport (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "report-test-"));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("[REQ-MAINT-REPORT] should return empty string when no operations", () => {
    const report = generateMaintenanceReport(tmpDir);
    expect(report).toBe("");
  });

  it("[REQ-MAINT-REPORT] should report stale story annotation", () => {
    const filePath = path.join(tmpDir, "stub.md");
    const content = `/**
 * @story non-existent.story.md
 */`;
    fs.writeFileSync(filePath, content);
    const report = generateMaintenanceReport(tmpDir);
    expect(report).toContain("non-existent.story.md");
  });
});
