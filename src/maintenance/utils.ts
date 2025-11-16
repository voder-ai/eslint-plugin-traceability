import * as fs from "fs";
import * as path from "path";

/**
 * Recursively retrieve all files in a directory.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UTILS - Extract common file traversal logic for maintenance tools
 */
export function getAllFiles(dir: string): string[] {
  const fileList: string[] = [];
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return fileList;
  }
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (stat.isFile()) {
        fileList.push(fullPath);
      }
    }
  }
  traverse(dir);
  return fileList;
}