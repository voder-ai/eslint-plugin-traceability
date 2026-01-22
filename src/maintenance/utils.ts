import * as fs from "fs";
import * as path from "path";

/**
 * Options for file traversal with optional ignore patterns
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Support ESLint configuration integration
 */
export interface GetAllFilesOptions {
  /**
   * Array of glob patterns or absolute paths to ignore during traversal.
   * Supports both directory paths (to skip entire directories) and file patterns.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE - Respect ESLint ignore patterns
   */
  ignorePatterns?: string[];
}

/**
 * Recursively retrieve all files in a directory.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Support ESLint configuration integration
 * @param dir Root directory to scan
 * @param options Optional configuration including ignore patterns from ESLint config
 */
export function getAllFiles(
  dir: string,
  options?: GetAllFilesOptions,
): string[] {
  const fileList: string[] = [];
  const ignorePatterns = options?.ignorePatterns ?? [];
  /**
   * Ensure the provided path exists and is a directory before traversal.
   * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
   * @req REQ-MAINT-UPDATE - Support ESLint configuration integration
   */
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-UPDATE - Return empty array for invalid directories
    return fileList;
  }

  traverseDirectory(dir, fileList, ignorePatterns);

  return fileList;
}

/**
 * Check if a path should be ignored based on patterns
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Respect ESLint ignore patterns
 */
function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
  for (const pattern of ignorePatterns) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-UPDATE - Check each ignore pattern
    // Support both exact path matches and directory prefix matches
    if (
      filePath === pattern ||
      filePath.startsWith(pattern + path.sep) ||
      // Support common patterns like node_modules, dist, etc.
      filePath.includes(path.sep + pattern + path.sep) ||
      filePath.endsWith(path.sep + pattern)
    ) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-UPDATE - Return true when pattern matches
      return true;
    }
  }
  return false;
}

/**
 * Recursively traverse a directory and collect file paths.
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-UPDATE - Apply ignore patterns during traversal
 */
function traverseDirectory(
  currentDir: string,
  fileList: string[],
  ignorePatterns: string[],
): void {
  const entries = fs.readdirSync(currentDir);
  for (const entry of entries) {
    // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
    // @req REQ-MAINT-UPDATE - Process each directory entry
    const fullPath = path.join(currentDir, entry);

    /**
     * Skip ignored paths based on ESLint configuration
     * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
     * @req REQ-MAINT-UPDATE - Respect ESLint ignore patterns
     */
    if (shouldIgnore(fullPath, ignorePatterns)) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-UPDATE - Skip ignored paths
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-UPDATE - Recurse into subdirectories
      traverseDirectory(fullPath, fileList, ignorePatterns);
    }
    if (!stat.isFile()) {
      // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
      // @req REQ-MAINT-UPDATE - Skip non-file entries
      continue;
    }
    fileList.push(fullPath);
  }
}
