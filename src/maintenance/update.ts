import * as fs from "fs";
import { getAllFiles } from "./utils";

/**
 * Helper to process a single file for annotation reference updates
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE
 * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
 */
function processFileForAnnotationUpdates(
  fullPath: string,
  regex: RegExp,
  newPath: string,
  replacementCountRef: { count: number },
): void {
  const content = fs.readFileSync(fullPath, "utf8"); // getAllFiles already returns regular files
  const newContent = content.replace(
    regex,
    /**
     * Replacement callback to update annotation references
     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
     * @req REQ-MAINT-UPDATE
     */
    (match, p1) => {
      replacementCountRef.count++;
      return `${p1}${newPath}`;
    },
  );
  /**
   * Write file only if content changed
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
   */
  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, "utf8");
  }
}

/**
 * Update annotation references when story files are moved or renamed
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Update annotation references
 * @param codebasePath Absolute or workspace-root path whose files will be updated in-place.
 * @param oldPath The original @story path to search for in annotation comments.
 * @param newPath The replacement @story path that will replace occurrences of oldPath.
 * @returns The number of @story annotations that were updated across the codebase.
 */
export function updateAnnotationReferences(
  codebasePath: string,
  oldPath: string,
  newPath: string,
): number {
  /**
   * Check that the provided codebase path exists and is a directory.
   * If not, abort early.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
   */
  // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
  if (
    !fs.existsSync(codebasePath) ||
    !fs.statSync(codebasePath).isDirectory()
  ) {
    return 0;
  }

  const replacementCountRef = { count: 0 };
  const escapedOldPath = oldPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(@story\\s*)${escapedOldPath}`, "g");

  const files = getAllFiles(codebasePath);
  /**
   * Iterate over all files and replace annotation references
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
   * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
   */
  /**
   * Loop over each discovered file path
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
   * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-UPDATE
   */
  for (const fullPath of files) {
    processFileForAnnotationUpdates(
      fullPath,
      regex,
      newPath,
      replacementCountRef,
    );
  }

  return replacementCountRef.count;
}
