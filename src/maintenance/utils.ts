import * as fs from "fs";
import * as path from "path";

/**
 * Recursively retrieve all files in a directory.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UTILS - Extract common file traversal logic for maintenance tools
 */
export function getAllFiles(dir: string): string[] {
  const fileList: string[] = [];
  /**
   * Ensure the provided path exists and is a directory before traversal.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UTILS-VALIDATE-DIR - Validate input directory path
   */
  /**
   * Traceability for the directory-existence branch.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UTILS-VALIDATE-DIR-BRANCH - Traceability for directory-existence branch
   */
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return fileList;
  }

  traverseDirectory(dir, fileList);

  return fileList;
}

/**
 * Recursively traverse a directory and collect file paths.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UTILS-TRAVERSE - Helper traversal function used by getAllFiles
 */
function traverseDirectory(currentDir: string, fileList: string[]): void {
  const entries = fs.readdirSync(currentDir);
  /**
   * Iterate over directory entries using a for-of loop.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UTILS-TRAVERSE-FOROF - Traceability for ForOfStatement branch handling entries
   */
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry);
    const stat = fs.statSync(fullPath);
    /**
     * Recurse into directories to continue traversal.
     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
     * @req REQ-MAINT-UTILS-TRAVERSE-DIR - Handle directory entries during traversal
     */
    if (stat.isDirectory()) {
      traverseDirectory(fullPath, fileList);
      /**
       * Collect regular file entries during traversal.
       * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
       * @req REQ-MAINT-UTILS-TRAVERSE-FILE - Handle file entries during traversal
       */
    }
    /**
     * Skip non-file entries encountered during traversal.
     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
     * @req REQ-MAINT-UTILS-TRAVERSE-SKIP-NONFILE - Traceability for skipping non-file entries
     */
    if (!stat.isFile()) {
      continue;
    }
    fileList.push(fullPath);
  }
}
