import * as fs from "fs";
import { getAllFiles } from "./utils";

/**
 * Helper to process a single file for annotation reference updates
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE
 */
function processFileForAnnotationUpdates(
  fullPath: string,
  regex: RegExp,
  newPath: string,
  replacementCountRef: { count: number },
): void {
  const stat = fs.statSync(fullPath);
  /**
   * Skip non-files in iteration
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
   */
  /**
   * Skip entries that are not regular files (e.g., directories)
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
   */
  if (!stat.isFile()) return;

  const content = fs.readFileSync(fullPath, "utf8");
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
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-UPDATE
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
   */
  /**
   * Loop over each discovered file path
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE
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
