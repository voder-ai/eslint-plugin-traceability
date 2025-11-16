"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for: docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 */
const report_1 = require("../../src/maintenance/report");
describe("generateMaintenanceReport (Story 009.0-DEV-MAINTENANCE-TOOLS)", () => {
    it("[REQ-MAINT-REPORT] should return empty string when no operations", () => {
        const report = (0, report_1.generateMaintenanceReport)("tests/fixtures/empty");
        expect(report).toBe("");
    });
    it("[REQ-MAINT-REPORT] should report stale story annotation", () => {
        const report = (0, report_1.generateMaintenanceReport)("tests/fixtures/stale");
        expect(report).toContain("non-existent.md");
    });
});
