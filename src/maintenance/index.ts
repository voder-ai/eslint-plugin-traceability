/**
 * Maintenance Tools Module
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - CLI commands for maintenance operations
 * @req REQ-MAINT-UPDATE - Update annotation references
 * @req REQ-MAINT-BATCH - Batch updates across multiple files
 * @req REQ-MAINT-MANUAL-TRIGGER - Manual developer execution
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI REQ-MAINT-UPDATE REQ-MAINT-BATCH REQ-MAINT-MANUAL-TRIGGER
 */
export { detectStaleAnnotations } from "./detect";
export { updateAnnotationReferences } from "./update";
export { batchUpdateAnnotations, verifyAnnotations } from "./batch";
export { generateMaintenanceReport } from "./report";
