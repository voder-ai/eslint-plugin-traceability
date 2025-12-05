import path from "path";
import { enforceProjectBoundary } from "../../utils/storyReferenceUtils";

/**
 * Helper utilities for valid-story-reference rule.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PROJECT-BOUNDARY - Ensure resolved candidate paths remain within the project root
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */

export interface _ReportInvalidPathArgs {
  storyPath: string;
  commentNode: any;
  context: any;
}

export interface HandleBoundaryOptions {
  storyPath: string;
  commentNode: any;
  context: any;
  cwd: string;
  candidates: string[];
  existenceResult: {
    status: "exists" | "missing" | "fs-error" | null;
    matchedPath?: string | null;
  } | null;
  reportInvalidPath: (_args: _ReportInvalidPathArgs) => void;
}

export interface SecurityValidationOptions {
  storyPath: string;
  commentNode: any;
  context: any;
  cwd: string;
  allowAbsolute: boolean;
  reportInvalidPath: (_args: _ReportInvalidPathArgs) => void;
}

/**
 * Analyze candidate paths against the project boundary, returning whether any
 * are within the project and whether any are outside.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PROJECT-BOUNDARY - Validate files are within project boundaries
 * @req REQ-CONFIGURABLE-PATHS - Respect configured storyDirectories while enforcing project boundaries
 */
export function analyzeCandidateBoundaries(
  candidates: string[],
  cwd: string,
): {
  hasInProjectCandidate: boolean;
  hasOutOfProjectCandidate: boolean;
} {
  let hasInProjectCandidate = false;
  let hasOutOfProjectCandidate = false;

  for (const candidate of candidates) {
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
    const boundary = enforceProjectBoundary(candidate, cwd);
    if (boundary.isWithinProject) {
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
      hasInProjectCandidate = true;
    } else {
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
      hasOutOfProjectCandidate = true;
    }
  }

  return { hasInProjectCandidate, hasOutOfProjectCandidate };
}

/**
 * Determine whether any candidate or matched path crosses the project
 * boundary, and report an invalid path if so.
 *
 * This centralizes project-boundary invalidation logic used during
 * existence checks, so the decision of *when* to call the invalid-path
 * reporter is not duplicated.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PROJECT-BOUNDARY - Ensure resolved candidate paths remain within the project root
 * @req REQ-CONFIGURABLE-PATHS - Respect configured storyDirectories while enforcing project boundaries
 */
export function handleProjectBoundaryForExistence({
  storyPath,
  commentNode,
  context,
  cwd,
  candidates,
  existenceResult,
  reportInvalidPath,
}: HandleBoundaryOptions): boolean {
  if (candidates.length > 0) {
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
    const { hasInProjectCandidate, hasOutOfProjectCandidate } =
      analyzeCandidateBoundaries(candidates, cwd);

    if (hasOutOfProjectCandidate && !hasInProjectCandidate) {
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
      reportInvalidPath({ storyPath, commentNode, context });
      return true;
    }
  }

  if (
    existenceResult &&
    existenceResult.status === "exists" &&
    existenceResult.matchedPath
  ) {
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
    const boundary = enforceProjectBoundary(existenceResult.matchedPath, cwd);
    if (!boundary.isWithinProject) {
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
      reportInvalidPath({ storyPath, commentNode, context });
      return true;
    }
  }

  return false;
}

/**
 * Perform security-related validations on the story path, including
 * absolute-path usage and path traversal checks. Report invalid paths
 * when necessary and indicate whether further processing should continue.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
export function performSecurityValidations({
  storyPath,
  commentNode,
  context,
  cwd,
  allowAbsolute,
  reportInvalidPath,
}: SecurityValidationOptions): boolean {
  // Absolute path check
  if (path.isAbsolute(storyPath)) {
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
    if (!allowAbsolute) {
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
      reportInvalidPath({ storyPath, commentNode, context });
      return false;
    }
    // When absolute paths are allowed, we still enforce extension and
    // project-boundary checks via the existence phase.
  }

  // Path traversal check
  const containsTraversal = storyPath.includes("..") || /\\|\//.test(storyPath);
  if (containsTraversal) {
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
    // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
    const full = path.resolve(cwd, path.normalize(storyPath));
    if (!full.startsWith(cwd + path.sep)) {
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY REQ-SECURITY-VALIDATION
      // @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-SECURITY-VALIDATION
      reportInvalidPath({ storyPath, commentNode, context });
      return false;
    }
  }

  return true;
}
