/* eslint-disable traceability/valid-req-reference */
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-REPORT REQ-MAINT-SAFE
 */
import * as fs from "fs";
import * as path from "path";
import { createTempDir } from "../utils/temp-dir-helpers";
import { generateMaintenanceReport } from "../../src/maintenance/report";

describe("generateMaintenanceReport (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
  let temp: ReturnType<typeof createTempDir>;

  beforeAll(() => {
    temp = createTempDir("report-test-");
  });

  afterAll(() => {
    temp.cleanup();
  });

  it("[REQ-MAINT-REPORT] should return empty string when no operations", () => {
    const report = generateMaintenanceReport(temp.dir);
    expect(report).toBe("");
  });

  it("[REQ-MAINT-REPORT] should report stale story annotation", () => {
    const filePath = path.join(temp.dir, "stub.md");
    const content = `/**
 * @story non-existent.story.md
 */`;
    fs.writeFileSync(filePath, content);
    const report = generateMaintenanceReport(temp.dir);
    expect(report).toContain("non-existent.story.md");
  });
});
