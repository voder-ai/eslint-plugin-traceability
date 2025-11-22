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
    return [];
  }

  const stale = new Set<string>();

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Iterate over all files in the isolated workspace root
  const files = getAllFiles(workspaceRoot);
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
    content = fs.readFileSync(file, "utf8");
  } catch {
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
    return;
  }

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Compute project and codebase candidates relative to cwd and workspaceRoot
  const storyProjectCandidate = path.resolve(cwd, storyPath);
  const storyCodebaseCandidate = path.resolve(workspaceRoot, storyPath);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Enforce workspaceRoot as the project boundary for resolved story paths
  let projectBoundary: ProjectBoundaryCheckResult;
  let codebaseBoundary: ProjectBoundaryCheckResult;

  try {
    projectBoundary = enforceProjectBoundary(
      storyProjectCandidate,
      workspaceRoot,
    );
  } catch {
    projectBoundary = {
      isWithinProject: false,
      candidate: storyProjectCandidate,
    };
  }

  try {
    codebaseBoundary = enforceProjectBoundary(
      storyCodebaseCandidate,
      workspaceRoot,
    );
  } catch {
    codebaseBoundary = {
      isWithinProject: false,
      candidate: storyCodebaseCandidate,
    };
  }

  const inProjectCandidates: string[] = [];
  if (projectBoundary.isWithinProject) {
    inProjectCandidates.push(projectBoundary.candidate);
  }
  if (codebaseBoundary.isWithinProject) {
    inProjectCandidates.push(codebaseBoundary.candidate);
  }

  // If both candidates are out-of-project, do not mark as stale and skip FS checks
  if (inProjectCandidates.length === 0) {
    return;
  }

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Only check existence for in-project candidates
  const anyExists = inProjectCandidates.some((p) => fs.existsSync(p));

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-DETECT - Mark story as stale if any in-project candidate exists conceptually but none exist on disk
  if (!anyExists) {
    stale.add(storyPath);
  }
}
