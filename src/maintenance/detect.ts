import * as fs from "fs";
import * as path from "path";
import { getAllFiles } from "./utils";
import {
  isUnsafeStoryPath,
  enforceProjectBoundary,
} from "../utils/storyReferenceUtils";
import type { ProjectBoundaryCheckResult } from "../utils/storyReferenceUtils";

/**
 * Detect stale annotation references that point to moved or deleted story files
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Detect stale annotation references
 * @param codebasePath Path to the codebase root, treated as a workspace root and resolved against process.cwd().
 * @returns A de-duplicated array of stale @story paths (as strings) whose resolved targets no longer exist on disk.
 */
export function detectStaleAnnotations(codebasePath: string): string[] {
  const cwd = process.cwd();
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Treat codebasePath as a workspace root resolved from process.cwd()
  const workspaceRoot = path.resolve(cwd, codebasePath);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Return empty result if workspaceRoot does not exist or is not a directory
  if (
    !fs.existsSync(workspaceRoot) ||
    !fs.statSync(workspaceRoot).isDirectory()
  ) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    return [];
  }

  const stale = new Set<string>();

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Iterate over all files in the isolated workspace root
  const files = getAllFiles(workspaceRoot);
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Loop over each workspace file to inspect its @story annotations
  for (const file of files) {
    processFileForStaleAnnotations(file, workspaceRoot, cwd, stale);
  }

  return Array.from(stale);
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Process individual files to detect stale @story annotations
 */
function processFileForStaleAnnotations(
  file: string,
  workspaceRoot: string,
  cwd: string,
  stale: Set<string>,
): void {
  let content: string;
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Handle file read errors gracefully
  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    content = fs.readFileSync(file, "utf8");
  } catch {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Swallow file read failures without aborting detection
    return;
  }

  const regex = /@story\s+([^\s]+)/g;
  let match: RegExpExecArray | null;
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Iterate over regex matches for @story annotations
  while ((match = regex.exec(content)) !== null) {
    handleStoryMatch(match[1], workspaceRoot, cwd, stale);
  }
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT REQ-SECURITY-VALIDATION - Handle individual @story matches within a file
 */
function handleStoryMatch(
  storyPath: string,
  workspaceRoot: string,
  cwd: string,
  stale: Set<string>,
): void {
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT REQ-SECURITY-VALIDATION - Skip traversal/absolute-unsafe or invalid-extension story paths before any filesystem or boundary checks
  if (isUnsafeStoryPath(storyPath)) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    return;
  }

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Compute project and codebase candidates relative to cwd and workspaceRoot
  const storyProjectCandidate = path.resolve(cwd, storyPath);
  const storyCodebaseCandidate = path.resolve(workspaceRoot, storyPath);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Enforce workspaceRoot as the project boundary for resolved story paths
  const inProjectCandidates = getInProjectCandidates(
    storyProjectCandidate,
    storyCodebaseCandidate,
    workspaceRoot,
  );

  // If both candidates are out-of-project, do not mark as stale and skip FS checks
  if (inProjectCandidates.length === 0) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT - No in-project candidates means nothing to check or mark stale
    return;
  }

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Only check existence for in-project candidates
  const anyExists = anyInProjectCandidateExists(inProjectCandidates);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Mark story as stale if any in-project candidate exists conceptually but none exist on disk
  if (!anyExists) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    stale.add(storyPath);
  }
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Enforce project boundary and return in-project candidates
 */
function getInProjectCandidates(
  storyProjectCandidate: string,
  storyCodebaseCandidate: string,
  workspaceRoot: string,
): string[] {
  let projectBoundary: ProjectBoundaryCheckResult;
  let codebaseBoundary: ProjectBoundaryCheckResult;

  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    projectBoundary = enforceProjectBoundary(
      storyProjectCandidate,
      workspaceRoot,
    );
  } catch {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Treat boundary enforcement failures as out-of-project
    projectBoundary = {
      isWithinProject: false,
      candidate: storyProjectCandidate,
    };
  }

  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    codebaseBoundary = enforceProjectBoundary(
      storyCodebaseCandidate,
      workspaceRoot,
    );
  } catch {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Treat boundary enforcement failures as out-of-project
    codebaseBoundary = {
      isWithinProject: false,
      candidate: storyCodebaseCandidate,
    };
  }

  const inProjectCandidates: string[] = [];
  if (projectBoundary.isWithinProject) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT - Collect project-relative in-project candidate
    inProjectCandidates.push(projectBoundary.candidate);
  }
  if (codebaseBoundary.isWithinProject) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT - Collect workspace-root-relative in-project candidate
    inProjectCandidates.push(codebaseBoundary.candidate);
  }

  return inProjectCandidates;
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-DETECT - Check on-disk existence of in-project candidates
 */
function anyInProjectCandidateExists(inProjectCandidates: string[]): boolean {
  return inProjectCandidates.some(
    /**
     * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-DETECT REQ-MAINT-SAFE
     */
    (p) => {
      const exists = fs.existsSync(p);
      if (!exists) {
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-SAFE - Safely handle non-existent candidate without throwing
      }
      return exists;
    },
  );
}
