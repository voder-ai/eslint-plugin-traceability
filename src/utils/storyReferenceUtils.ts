/**
 * Utility functions for story path resolution and existence checking.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 */
import fs from "fs";
import path from "path";

/**
 * Describes the possible existence states for a checked path.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
export type StoryExistenceStatus = "exists" | "missing" | "fs-error";

/**
 * Result of checking a single candidate path.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
export interface StoryPathCheckResult {
  path: string;
  status: StoryExistenceStatus;
  error?: unknown;
}

/**
 * Aggregated existence result across multiple candidate paths.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
export interface StoryExistenceResult {
  candidates: string[];
  status: StoryExistenceStatus;
  matchedPath?: string;
  error?: unknown;
}

/**
 * Result of validating that a candidate path stays within the project boundary.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PROJECT-BOUNDARY - Validate files are within project boundaries
 */
export interface ProjectBoundaryCheckResult {
  candidate: string;
  isWithinProject: boolean;
}

/**
 * Validate that a candidate path stays within the project boundary.
 * This compares the resolved candidate path against the normalized cwd
 * prefix, ensuring that even when storyDirectories are misconfigured, we
 * never treat files outside the project as valid story references.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PROJECT-BOUNDARY - Validate files are within project boundaries
 */
export function enforceProjectBoundary(
  candidate: string,
  cwd: string,
): ProjectBoundaryCheckResult {
  const normalizedCwd = path.resolve(cwd);
  const normalizedCandidate = path.resolve(candidate);

  const isWithinProject =
    normalizedCandidate === normalizedCwd ||
    normalizedCandidate.startsWith(normalizedCwd + path.sep);

  return {
    candidate: normalizedCandidate,
    isWithinProject,
  };
}

/**
 * Internal helper to reset the filesystem existence cache. This is primarily
 * intended for tests that need to run multiple scenarios with different
 * mocked filesystem behavior without carrying over cached results.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PERFORMANCE-OPTIMIZATION - Allow safe cache reset in tests to avoid stale entries
 */
export function __resetStoryExistenceCacheForTests(): void {
  fileExistStatusCache.clear();
}

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
  // When the story path is already explicitly relative, resolve it only against the current working directory.
  // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
  // @req REQ-PATH-RESOLUTION - Preserve explicit relative story path semantics when building candidate locations
  if (storyPath.startsWith("./") || storyPath.startsWith("../")) {
    candidates.push(path.resolve(cwd, storyPath));
  } else {
    // For bare paths, first try resolving directly under the current working directory.
    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
    // @req REQ-PATH-RESOLUTION - Attempt direct resolution from cwd before probing configured story directories
    candidates.push(path.resolve(cwd, storyPath));
    // Probe each configured story directory for a matching story filename.
    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
    // @req REQ-PATH-RESOLUTION - Expand search across configured storyDirectories while staying within project
    for (const dir of storyDirs) {
      candidates.push(path.resolve(cwd, dir, path.basename(storyPath)));
    }
  }
  return candidates;
}

/**
 * Cache of filesystem existence checks keyed by absolute path.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
const fileExistStatusCache = new Map<string, StoryPathCheckResult>();

/**
 * Check a single candidate path, with caching and robust error handling.
 * All filesystem interactions are wrapped in try/catch and never throw.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
function checkSingleCandidate(candidate: string): StoryPathCheckResult {
  const cached = fileExistStatusCache.get(candidate);
  // Reuse any cached filesystem result to avoid redundant disk IO for the same candidate.
  // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
  // @req REQ-PERFORMANCE-OPTIMIZATION - Short-circuit on cached existence checks
  if (cached) {
    return cached;
  }

  let result: StoryPathCheckResult;

  try {
    const exists = fs.existsSync(candidate);
    // When the path does not exist at all, record a simple "missing" status.
    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
    // @req REQ-FILE-EXISTENCE - Distinguish non-existent story paths from other failure modes
    if (!exists) {
      result = { path: candidate, status: "missing" };
    } else {
      const stat = fs.statSync(candidate);
      // Treat existing regular files as valid story candidates; other entry types are considered missing.
      // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
      // @req REQ-FILE-EXISTENCE - Only regular files may satisfy a story path reference
      if (stat.isFile()) {
        result = { path: candidate, status: "exists" };
      } else {
        // Path exists but is not a file; treat as missing for story purposes.
        result = { path: candidate, status: "missing" };
      }
    }
  } catch (error) {
    // Any filesystem error is captured and surfaced as an fs-error status instead of throwing.
    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
    // @req REQ-ERROR-HANDLING - Represent filesystem failures as fs-error results while keeping callers resilient
    result = { path: candidate, status: "fs-error", error };
  }

  fileExistStatusCache.set(candidate, result);
  return result;
}

/**
 * Aggregate existence status across multiple candidate paths.
 * Returns the first successful match (`exists`), or, if none exist,
 * the first filesystem error encountered. If there are only missing
 * candidates, returns a missing status.
 *
 * This function never throws and is the preferred richer API for callers
 * that need more than a boolean.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
export function getStoryExistence(candidates: string[]): StoryExistenceResult {
  let firstFsError: StoryPathCheckResult | undefined;

  for (const candidate of candidates) {
    const res = checkSingleCandidate(candidate);

    // As soon as a candidate file is confirmed to exist, return a successful existence result.
    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
    // @req REQ-FILE-EXISTENCE - Prefer the first positively-matched story file
    if (res.status === "exists") {
      return {
        candidates,
        status: "exists",
        matchedPath: res.path,
      };
    }

    // Remember the first filesystem error so callers can inspect a representative failure if no files exist.
    // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
    // @req REQ-ERROR-HANDLING - Surface a single representative filesystem error without failing fast
    if (res.status === "fs-error" && !firstFsError) {
      firstFsError = res;
    }
  }

  // Prefer reporting a filesystem error over a generic missing status when at least one candidate failed to read.
  // @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
  // @req REQ-ERROR-HANDLING - Distinguish IO failures from simple "missing" results in existence checks
  if (firstFsError) {
    return {
      candidates,
      status: "fs-error",
      error: firstFsError.error,
    };
  }

  return {
    candidates,
    status: "missing",
  };
}

/**
 * Check if any of the provided file paths exist.
 * Handles filesystem errors (e.g., EACCES) gracefully by treating them as non-existent
 * and never throwing.
 *
 * Internally delegates to the richer status-based helper while preserving the
 * original boolean-only API for backwards compatibility.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
export function storyExists(paths: string[]): boolean {
  const result = getStoryExistence(paths);
  return result.status === "exists";
}

/**
 * Normalize a story path to candidate absolute paths and check existence.
 * Filesystem errors are handled via the status-aware helper, which suppresses
 * exceptions and treats such cases as non-existent for the boolean flag while
 * still surfacing error details in the status field.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-ERROR-HANDLING - Handle filesystem errors gracefully without throwing
 * @req REQ-PERFORMANCE-OPTIMIZATION - Cache filesystem checks to avoid redundant work
 */
export function normalizeStoryPath(
  storyPath: string,
  cwd: string,
  storyDirs: string[],
): {
  candidates: string[];
  exists: boolean;
  existence: StoryExistenceResult;
} {
  const candidates = buildStoryCandidates(storyPath, cwd, storyDirs);
  const existence = getStoryExistence(candidates);
  const exists = existence.status === "exists";
  return { candidates, exists, existence };
}

/**
 * Check if the provided path is absolute.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-SECURITY-VALIDATION - Prevent absolute path usage
 */
export function isAbsolutePath(p: string): boolean {
  return path.isAbsolute(p);
}

/**
 * Check for path traversal patterns.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal
 */
export function containsPathTraversal(p: string): boolean {
  const normalized = path.normalize(p);
  return normalized.split(path.sep).includes("..");
}

/**
 * Determine if a path is unsafe due to traversal or being absolute.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
export function isTraversalUnsafe(p: string): boolean {
  return isAbsolutePath(p) || containsPathTraversal(p);
}

/**
 * Validate that the story file has an allowed extension.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-SECURITY-VALIDATION - Enforce allowed file extensions
 */
export function hasValidExtension(p: string): boolean {
  return p.endsWith(".story.md");
}

/**
 * Determine if a story path is unsafe due to traversal, being absolute, or invalid extension.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal, absolute path usage, and enforce allowed file extensions
 */
export function isUnsafeStoryPath(p: string): boolean {
  return isTraversalUnsafe(p) || !hasValidExtension(p);
}
