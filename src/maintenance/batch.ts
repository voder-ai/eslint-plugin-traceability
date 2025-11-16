import { updateAnnotationReferences } from "./update";
import { detectStaleAnnotations } from "./detect";

/**
 * Batch update annotations and verify references
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
export function batchUpdateAnnotations(
  codebasePath: string,
  mappings: { oldPath: string; newPath: string }[],
): number {
  let totalUpdated = 0;
  for (const { oldPath, newPath } of mappings) {
    totalUpdated += updateAnnotationReferences(codebasePath, oldPath, newPath);
  }
  return totalUpdated;
}

/**
 * Verify annotation references in codebase after maintenance operations
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-VERIFY - Verify annotation references
 */
export function verifyAnnotations(codebasePath: string): boolean {
  const staleAnnotations = detectStaleAnnotations(codebasePath);
  return staleAnnotations.length === 0;
}
