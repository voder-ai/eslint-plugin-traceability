import { detectStaleAnnotations } from "./detect";

/**
 * Generate a report of maintenance operations performed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 */
export function generateMaintenanceReport(codebasePath: string): string {
  const staleAnnotations = detectStaleAnnotations(codebasePath);
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md // @req REQ-MAINT-SAFE - When no stale annotations are found, return empty string to indicate no actions required
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md // @req REQ-MAINT-REPORT - When stale annotations exist, produce a newline-separated report
  if (staleAnnotations.length === 0) {
    return "";
  }
  return staleAnnotations.join("\n");
}
