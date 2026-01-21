/* eslint-disable traceability/require-branch-annotation */

import { updateAnnotationReferences } from "./update";
import { detectStaleAnnotations } from "./detect";
import { GetAllFilesOptions } from "./utils";

/**
 * Batch update annotations and verify references
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-BATCH - Perform batch updates
 * @req REQ-MAINT-UPDATE - Update annotation references
 * @req REQ-MAINT-CLI - Provide CLI command interface
 * @param codebasePath Absolute path to the workspace root where annotations will be updated.
 * @param mappings Array of mapping objects describing path changes, each containing an oldPath and newPath.
 * @param options Optional configuration including ESLint ignore patterns
 * @returns Object with total count of updated annotations and array of malformed annotation warnings
 */
export function batchUpdateAnnotations(
  codebasePath: string,
  mappings: { oldPath: string; newPath: string }[],
  options?: GetAllFilesOptions,
): { count: number; warnings: string[] } {
  let totalUpdated = 0;
  const allWarnings: string[] = [];

  for (const { oldPath, newPath } of mappings) {
    const result = updateAnnotationReferences(
      codebasePath,
      oldPath,
      newPath,
      options,
    );
    totalUpdated += result.count;
    allWarnings.push(...result.warnings);
  }

  return { count: totalUpdated, warnings: allWarnings };
}

/**
 * Verify annotation references in codebase after maintenance operations
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - Provide CLI command interface
 * @req REQ-MAINT-MANUAL-TRIGGER - Manual developer execution
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
