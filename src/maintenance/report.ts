import { detectStaleAnnotations } from "./detect";

/**
 * Generate a report of maintenance operations performed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-REPORT - Generate maintenance report
 * @req REQ-MAINT-SAFE - Ensure operations are safe and reversible
 * @param codebasePath The workspace root to scan for stale maintenance annotations.
 * @returns An empty string when no stale annotations are found, or a newline-separated list of stale `@story` paths.
 */
export function generateMaintenanceReport(codebasePath: string): string {
  const staleAnnotations = detectStaleAnnotations(codebasePath);
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - When no stale annotations are found, return empty string to indicate no actions required
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-REPORT - When stale annotations exist, produce a newline-separated report
  if (staleAnnotations.length === 0) {
    return "";
  }
  return staleAnnotations.join("\n");
}
