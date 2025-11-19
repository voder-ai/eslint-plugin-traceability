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
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return fileList;
  }
  /**
   * Recursively traverse a directory and collect file paths.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UTILS-TRAVERSE - Helper traversal function used by getAllFiles
   */
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      /**
       * Recurse into directories to continue traversal.
       * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
       * @req REQ-MAINT-UTILS-TRAVERSE-DIR - Handle directory entries during traversal
       */
      if (stat.isDirectory()) {
        traverse(fullPath);
        /**
         * Collect regular file entries during traversal.
         * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
         * @req REQ-MAINT-UTILS-TRAVERSE-FILE - Handle file entries during traversal
         */
      } else if (stat.isFile()) {
        fileList.push(fullPath);
      }
    }
  }
  traverse(dir);
  return fileList;
}
