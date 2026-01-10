import { updateAnnotationReferences } from "./update";
import { detectStaleAnnotations } from "./detect";
import { GetAllFilesOptions } from "./utils";

/**
 * Batch update annotations and verify references
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-VERIFY - Verify annotation references
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @param codebasePath Absolute path to the workspace root where annotations will be updated.
 * @param mappings Array of mapping objects describing path changes, each containing an oldPath and newPath.
 * @param options Optional configuration including ESLint ignore patterns
 * @returns Total number of updated @story annotations across all mappings.
 */
export function batchUpdateAnnotations(
  codebasePath: string,
  mappings: { oldPath: string; newPath: string }[],
  options?: GetAllFilesOptions,
): number {
  let totalUpdated = 0;
  for (const { oldPath, newPath } of mappings) {
    totalUpdated += updateAnnotationReferences(
      codebasePath,
      oldPath,
      newPath,
      options,
    );
  }
  return totalUpdated;
}

/**
 * Verify annotation references in codebase after maintenance operations
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-VERIFY - Verify annotation references
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @param codebasePath Absolute path to the workspace root whose annotations should be verified.
 * @param options Optional configuration including ESLint ignore patterns
 * @returns Boolean indicating whether there are no stale annotations remaining (true if clean, false if any remain).
 */
export function verifyAnnotations(
  codebasePath: string,
  options?: GetAllFilesOptions,
): boolean {
  const staleAnnotations = detectStaleAnnotations(codebasePath, options);
  return staleAnnotations.length === 0;
}
