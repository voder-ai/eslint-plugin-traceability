"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMaintenanceReport = generateMaintenanceReport;
const detect_1 = require("./detect");
/**
 * Generate a report of maintenance operations performed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 */
function generateMaintenanceReport(codebasePath) {
    const staleAnnotations = (0, detect_1.detectStaleAnnotations)(codebasePath);
    if (staleAnnotations.length === 0) {
        return "";
    }
    return staleAnnotations.join("\n");
}
