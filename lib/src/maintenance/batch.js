"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchUpdateAnnotations = batchUpdateAnnotations;
exports.verifyAnnotations = verifyAnnotations;
const update_1 = require("./update");
const detect_1 = require("./detect");
/**
 * Batch update annotations and verify references
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
function batchUpdateAnnotations(codebasePath, mappings) {
    let totalUpdated = 0;
    for (const { oldPath, newPath } of mappings) {
        totalUpdated += (0, update_1.updateAnnotationReferences)(codebasePath, oldPath, newPath);
    }
    return totalUpdated;
}
/**
 * Verify annotation references in codebase after maintenance operations
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
function verifyAnnotations(codebasePath) {
    const staleAnnotations = (0, detect_1.detectStaleAnnotations)(codebasePath);
    return staleAnnotations.length === 0;
}
