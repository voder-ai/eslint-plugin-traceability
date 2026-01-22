import * as fs from "fs";
import * as path from "path";
import { getAllFiles, GetAllFilesOptions } from "./utils";
import {
  isUnsafeStoryPath,
  enforceProjectBoundary,
} from "../utils/storyReferenceUtils";
import type { ProjectBoundaryCheckResult } from "../utils/storyReferenceUtils";

/**
 * Detect stale annotation references that point to moved or deleted story files
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - Detect stale annotation references
 * @req REQ-MAINT-UPDATE - Integrate with ESLint configuration
 * @param codebasePath Path to the codebase root, treated as a workspace root and resolved against process.cwd().
 * @param options Optional configuration including ESLint ignore patterns
 * @returns A de-duplicated array of stale @story paths (as strings) whose resolved targets no longer exist on disk.
 */
export function detectStaleAnnotations(
  codebasePath: string,
  options?: GetAllFilesOptions,
): string[] {
  const cwd = process.cwd();
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Treat codebasePath as a workspace root resolved from process.cwd()
  const workspaceRoot = path.resolve(cwd, codebasePath);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Return empty result if workspaceRoot does not exist or is not a directory
  if (
    !fs.existsSync(workspaceRoot) ||
    !fs.statSync(workspaceRoot).isDirectory()
  ) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    return [];
  }

  const stale = new Set<string>();

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Iterate over all files in the isolated workspace root
  // @req REQ-MAINT-UPDATE - Apply ESLint ignore patterns during file discovery
  const files = getAllFiles(workspaceRoot, options);
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Loop over each workspace file to inspect its @story annotations
  for (const file of files) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    processFileForStaleAnnotations(file, workspaceRoot, cwd, stale);
  }

  return Array.from(stale);
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - Process individual files to detect stale @story annotations
 */
function processFileForStaleAnnotations(
  file: string,
  workspaceRoot: string,
  cwd: string,
  stale: Set<string>,
): void {
  let content: string;
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Handle file read errors gracefully
  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    content = fs.readFileSync(file, "utf8");
  } catch {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    return;
  }

  const regex = /@story\s+([^\s]+)/g;
  let match: RegExpExecArray | null;
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Iterate over regex matches for @story annotations
  while ((match = regex.exec(content)) !== null) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    handleStoryMatch(match[1], workspaceRoot, cwd, stale);
  }
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI REQ-SECURITY-VALIDATION - Handle individual @story matches within a file
 */
function handleStoryMatch(
  storyPath: string,
  workspaceRoot: string,
  cwd: string,
  stale: Set<string>,
): void {
  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI REQ-SECURITY-VALIDATION - Skip traversal/absolute-unsafe or invalid-extension story paths before any filesystem or boundary checks
  if (isUnsafeStoryPath(storyPath)) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    return;
  }

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Compute project and codebase candidates relative to cwd and workspaceRoot
  const storyProjectCandidate = path.resolve(cwd, storyPath);
  const storyCodebaseCandidate = path.resolve(workspaceRoot, storyPath);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Enforce workspaceRoot as the project boundary for resolved story paths
  const inProjectCandidates = getInProjectCandidates(
    storyProjectCandidate,
    storyCodebaseCandidate,
    workspaceRoot,
  );

  // If both candidates are out-of-project, do not mark as stale and skip FS checks
  if (inProjectCandidates.length === 0) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    return;
  }

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Only check existence for in-project candidates
  const anyExists = anyInProjectCandidateExists(inProjectCandidates);

  // @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
  // @req REQ-MAINT-CLI - Mark story as stale if any in-project candidate exists conceptually but none exist on disk
  if (!anyExists) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    stale.add(storyPath);
  }
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - Enforce project boundary and return in-project candidates
 */
function getInProjectCandidates(
  storyProjectCandidate: string,
  storyCodebaseCandidate: string,
  workspaceRoot: string,
): string[] {
  let projectBoundary: ProjectBoundaryCheckResult;
  let codebaseBoundary: ProjectBoundaryCheckResult;

  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    projectBoundary = enforceProjectBoundary(
      storyProjectCandidate,
      workspaceRoot,
    );
  } catch {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    projectBoundary = {
      isWithinProject: false,
      candidate: storyProjectCandidate,
    };
  }

  try {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    codebaseBoundary = enforceProjectBoundary(
      storyCodebaseCandidate,
      workspaceRoot,
    );
  } catch {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    codebaseBoundary = {
      isWithinProject: false,
      candidate: storyCodebaseCandidate,
    };
  }

  const inProjectCandidates: string[] = [];
  if (projectBoundary.isWithinProject) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    inProjectCandidates.push(projectBoundary.candidate);
  }
  if (codebaseBoundary.isWithinProject) {
    // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
    inProjectCandidates.push(codebaseBoundary.candidate);
  }

  return inProjectCandidates;
}

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINT-CLI - Check on-disk existence of in-project candidates
 */
function anyInProjectCandidateExists(inProjectCandidates: string[]): boolean {
  return inProjectCandidates.some(
    /**
     * @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI REQ-MAINT-CLI
     */
    (p) => {
      const exists = fs.existsSync(p);
      if (!exists) {
        // @supports docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md REQ-MAINT-CLI
      }
      return exists;
    },
  );
}
