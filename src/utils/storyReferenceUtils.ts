/**
 * Utility functions for story path resolution and existence checking.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
import fs from "fs";
import path from "path";

/**
 * Build candidate file paths for a given story path.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 */
export function buildStoryCandidates(
  storyPath: string,
  cwd: string,
  storyDirs: string[],
): string[] {
  const candidates: string[] = [];
  if (storyPath.startsWith("./") || storyPath.startsWith("../")) {
    candidates.push(path.resolve(cwd, storyPath));
  } else {
    candidates.push(path.resolve(cwd, storyPath));
    for (const dir of storyDirs) {
      candidates.push(path.resolve(cwd, dir, path.basename(storyPath)));
    }
  }
  return candidates;
}

/**
 * Check if any of the provided file paths exist.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 */
const fileExistCache = new Map<string, boolean>();
export function storyExists(paths: string[]): boolean {
  for (const candidate of paths) {
    let ok = fileExistCache.get(candidate);
    if (ok === undefined) {
      ok = fs.existsSync(candidate) && fs.statSync(candidate).isFile();
      fileExistCache.set(candidate, ok);
    }
    if (ok) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize a story path to candidate absolute paths and check existence.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 */
export function normalizeStoryPath(
  storyPath: string,
  cwd: string,
  storyDirs: string[],
): { candidates: string[]; exists: boolean } {
  const candidates = buildStoryCandidates(storyPath, cwd, storyDirs);
  const exists = storyExists(candidates);
  return { candidates, exists };
}

/**
 * Check if the provided path is absolute.
 * @req REQ-SECURITY-VALIDATION - Prevent absolute path usage
 */
export function isAbsolutePath(p: string): boolean {
  return path.isAbsolute(p);
}

/**
 * Check for path traversal patterns.
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal
 */
export function containsPathTraversal(p: string): boolean {
  const normalized = path.normalize(p);
  return normalized.split(path.sep).includes("..");
}

/**
 * Determine if a path is unsafe due to traversal or being absolute.
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
export function isTraversalUnsafe(p: string): boolean {
  return isAbsolutePath(p) || containsPathTraversal(p);
}

/**
 * Validate that the story file has an allowed extension.
 * @req REQ-SECURITY-VALIDATION - Enforce allowed file extensions
 */
export function hasValidExtension(p: string): boolean {
  return p.endsWith(".story.md");
}

/**
 * Determine if a story path is unsafe due to traversal, being absolute, or invalid extension.
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal, absolute path usage, and enforce allowed file extensions
 */
export function isUnsafeStoryPath(p: string): boolean {
  return isTraversalUnsafe(p) || !hasValidExtension(p);
}
