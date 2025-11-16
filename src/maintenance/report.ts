import { detectStaleAnnotations } from "./detect";

/**
 * Generate a report of maintenance operations performed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 */
export function generateMaintenanceReport(codebasePath: string): string {
  const staleAnnotations = detectStaleAnnotations(codebasePath);
  if (staleAnnotations.length === 0) {
    return "";
  }
  return staleAnnotations.join("\n");
}