/* eslint-disable traceability/require-branch-annotation */

/**
 * Helper utilities for the "valid-req-reference" rule.
 *
 * These helpers encapsulate the deep-validation logic for `@req` and
 * `@supports` annotations so that the rule module can remain focused on
 * wiring into ESLint. They are intentionally structured as a set of
 * small, single-responsibility functions that can be reused and tested
 * in isolation if needed.
 *
 * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-PARSE REQ-DEEP-MATCH REQ-DEEP-CACHE
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-VALIDATE REQ-MIXED-SUPPORT REQ-SCOPED-IDS
 */
import fs from "fs";
import path from "path";
import type { Rule } from "eslint";

/**
 * Token index configuration for `@supports` annotations.
 * This clarifies the expected positions of the story path and first requirement ID
 * and avoids hard-coded "magic number" indices in parsing logic.
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 */
const IMPLEMENTS_TOKENS = {
  STORY_INDEX: 1,
  FIRST_REQ_INDEX: 2,
} as const;

/**
 * Extract the story path from a JSDoc comment.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse JSDoc comment lines to locate `@story` annotations
 */
function extractStoryPath(comment: any): string | null {
  const rawLines = comment.value.split(/\r?\n/);
  for (const rawLine of rawLines) {
    const line = rawLine.trim().replace(/^\*+\s*/, "");
    if (line.startsWith("@story")) {
      const parts = line.split(/\s+/);
      return parts[1] || null;
    }
  }
  return null;
}

/**
 * Validate and resolve the referenced story path.
 * Performs traversal/absolute checks and resolves to a disk path.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Validate and resolve referenced story file paths
 */
function validateAndResolveStoryPath(opts: {
  comment: any;
  context: any;
  storyPath: string;
  cwd: string;
}): string | null {
  const { comment, context, storyPath, cwd } = opts;

  if (storyPath.includes("..") || path.isAbsolute(storyPath)) {
    context.report({
      node: comment as any,
      messageId: "invalidPath",
      data: { storyPath },
    });
    return null;
  }

  const resolvedStoryPath = path.resolve(cwd, storyPath);
  if (
    !resolvedStoryPath.startsWith(cwd + path.sep) &&
    resolvedStoryPath !== cwd
  ) {
    context.report({
      node: comment as any,
      messageId: "invalidPath",
      data: { storyPath },
    });
    return null;
  }

  return resolvedStoryPath;
}

/**
 * Load and cache requirement IDs from a story file.
 * Reads the story file, extracts requirement IDs, and updates the cache.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Cache requirement IDs discovered in story files
 * @req REQ-DEEP-PARSE - Parse story file contents to extract requirement identifiers
 */
function loadAndCacheRequirements(opts: {
  resolvedStoryPath: string;
  reqCache: Map<string, Set<string>>;
}): Set<string> {
  const { resolvedStoryPath, reqCache } = opts;

  if (!reqCache.has(resolvedStoryPath)) {
    try {
      const content = fs.readFileSync(resolvedStoryPath, "utf8");
      const found = new Set<string>();
      const regex = /REQ-[A-Z0-9-]+/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        found.add(match[0]);
      }
      reqCache.set(resolvedStoryPath, found);
    } catch {
      reqCache.set(resolvedStoryPath, new Set());
    }
  }

  return reqCache.get(resolvedStoryPath)!;
}

/**
 * Perform the final requirement existence check and report if missing.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-MATCH - Verify that a referenced requirement ID exists in the story
 */
function checkRequirementExists(opts: {
  comment: any;
  context: any;
  reqId: string;
  storyPath: string;
  reqSet: Set<string>;
}): void {
  const { comment, context, reqId, storyPath, reqSet } = opts;

  if (!reqSet.has(reqId)) {
    context.report({
      node: comment as any,
      messageId: "reqMissing",
      data: { reqId, storyPath },
    });
  }
}

/**
 * Extract requirement ID from a `@req` line.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse annotation lines to extract requirement IDs
 */
function extractReqIdFromLine(line: string): string | undefined {
  const parts = line.split(/\s+/);
  return parts[1];
}

/**
 * Resolve story path and load requirements set for validation.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Validate and resolve referenced story file paths
 * @req REQ-DEEP-CACHE - Cache requirement IDs discovered in story files
 */
function resolveStoryAndRequirements(opts: {
  comment: any;
  context: any;
  storyPath: string;
  cwd: string;
  reqCache: Map<string, Set<string>>;
}): { resolvedStoryPath: string | null; reqSet: Set<string> | null } {
  const { comment, context, storyPath, cwd, reqCache } = opts;

  const resolvedStoryPath = validateAndResolveStoryPath({
    comment,
    context,
    storyPath,
    cwd,
  });

  if (!resolvedStoryPath) {
    return { resolvedStoryPath: null, reqSet: null };
  }

  const reqSet = loadAndCacheRequirements({
    resolvedStoryPath,
    reqCache,
  });

  return { resolvedStoryPath, reqSet };
}

/**
 * Validate a `@req` annotation line against the extracted story content.
 * Performs path validation, file reading, caching, and requirement existence checks.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Validate and resolve referenced story file paths
 * @req REQ-DEEP-CACHE - Cache requirement IDs discovered in story files
 * @req REQ-DEEP-MATCH - Verify that a referenced requirement ID exists in the story
 * @req REQ-DEEP-PARSE - Parse story file contents to extract requirement identifiers
 */
function validateReqLine(opts: {
  comment: any;
  context: any;
  line: string;
  storyPath: string | null;
  cwd: string;
  reqCache: Map<string, Set<string>>;
}): void {
  const { comment, context, line, storyPath, cwd, reqCache } = opts;
  const reqId = extractReqIdFromLine(line);
  if (!reqId || !storyPath) {
    return;
  }

  const { reqSet } = resolveStoryAndRequirements({
    comment,
    context,
    storyPath,
    cwd,
    reqCache,
  });

  if (!reqSet) {
    return;
  }

  checkRequirementExists({
    comment,
    context,
    reqId,
    storyPath,
    reqSet,
  });
}

/**
 * Parse a `@supports` annotation line into its story path and requirement IDs.
 * Expects the format: "`@supports` <storyPath> <REQ-ID-1> <REQ-ID-2> ..."
 * Invalid formats (missing storyPath or reqIds) are ignored by this deep rule.
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SUPPORTS-VALIDATE - Support validation of `@supports` annotations
 * @req REQ-MIXED-SUPPORT - Allow mixed `@story`/`@req`/`@supports` usage in the same comment
 * @req REQ-SCOPED-IDS - Treat requirement IDs as scoped to the referenced story file
 */
function parseImplementsLine(
  line: string,
): { storyPath: string; reqIds: string[] } | null {
  const parts = line.split(/\s+/);
  const storyPath = parts[IMPLEMENTS_TOKENS.STORY_INDEX];
  const reqIds = parts.slice(IMPLEMENTS_TOKENS.FIRST_REQ_INDEX);
  if (!storyPath || reqIds.length === 0) {
    return null;
  }
  return { storyPath, reqIds };
}

/**
 * Validate an `@supports` annotation line against the referenced story content.
 * Performs path validation, file reading, caching, and requirement existence checks
 * for each requirement ID listed on the line.
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SUPPORTS-VALIDATE - Validate that all `@supports` requirement IDs exist
 * @req REQ-MIXED-SUPPORT - Ensure `@supports` can coexist with `@story`/`@req` annotations
 * @req REQ-SCOPED-IDS - Validate requirement IDs in the scope of their explicit story
 */
function validateImplementsLine(opts: {
  comment: any;
  context: any;
  line: string;
  cwd: string;
  reqCache: Map<string, Set<string>>;
}): void {
  const { comment, context, line, cwd, reqCache } = opts;
  const parsed = parseImplementsLine(line);
  if (!parsed) {
    return;
  }

  const { storyPath, reqIds } = parsed;

  const { reqSet } = resolveStoryAndRequirements({
    comment,
    context,
    storyPath,
    cwd,
    reqCache,
  });

  if (!reqSet) {
    return;
  }

  for (const reqId of reqIds) {
    checkRequirementExists({
      comment,
      context,
      reqId,
      storyPath,
      reqSet,
    });
  }
}

/**
 * Handle a single annotation line for story or requirement metadata.
 * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-PARSE REQ-DEEP-MATCH
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-VALIDATE REQ-MIXED-SUPPORT
 */
function handleAnnotationLine(opts: {
  line: string;
  comment: any;
  context: any;
  cwd: string;
  reqCache: Map<string, Set<string>>;
  storyPath: string | null;
}): string | null {
  const { line, comment, context, cwd, reqCache, storyPath } = opts;
  if (line.startsWith("@story")) {
    const newPath = extractStoryPath(comment);
    return newPath || storyPath;
  } else if (line.startsWith("@req")) {
    validateReqLine({ comment, context, line, storyPath, cwd, reqCache });
    return storyPath;
  } else if (line.startsWith("@supports")) {
    validateImplementsLine({ comment, context, line, cwd, reqCache });
    return storyPath;
  }
  return storyPath;
}

/**
 * Iterate over all raw lines in a comment and update storyPath as needed.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Iterate comment lines to process `@story`/`@req` annotations
 * @req REQ-DEEP-MATCH - Coordinate annotation handling across a comment block
 */
function processCommentLines(opts: {
  comment: any;
  context: any;
  cwd: string;
  reqCache: Map<string, Set<string>>;
  initialStoryPath: string | null;
}): string | null {
  const { comment, context, cwd, reqCache, initialStoryPath } = opts;
  let storyPath = initialStoryPath;
  const rawLines = comment.value.split(/\r?\n/);
  for (const rawLine of rawLines) {
    const line = rawLine.trim().replace(/^\*+\s*/, "");
    storyPath = handleAnnotationLine({
      line,
      comment,
      context,
      cwd,
      reqCache,
      storyPath,
    });
  }
  return storyPath;
}

/**
 * Handle JSDoc story and req annotations for a single comment block.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Iterate comment lines to process @story/@req annotations
 * @req REQ-DEEP-MATCH - Coordinate annotation handling across a comment block
 * @req REQ-DEEP-CACHE - Maintain and reuse discovered story path across comments
 */
function handleComment(opts: {
  comment: any;
  context: any;
  cwd: string;
  reqCache: Map<string, Set<string>>;
  rawStoryPath: string | null;
}): string | null {
  const { comment, context, cwd, reqCache, rawStoryPath } = opts;
  return processCommentLines({
    comment,
    context,
    cwd,
    reqCache,
    initialStoryPath: rawStoryPath,
  });
}

/**
 * Get all comments from source and drive comment-level handling.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Collect all comments from the source code
 * @req REQ-DEEP-MATCH - Drive comment-level handling for traceability checks
 * @req REQ-DEEP-CACHE - Reuse story path and requirement cache across comments
 */
function processAllComments(opts: {
  sourceCode: any;
  context: any;
  cwd: string;
  reqCache: Map<string, Set<string>>;
  initialStoryPath: string | null;
}): void {
  const { sourceCode, context, cwd, reqCache } = opts;
  let rawStoryPath = opts.initialStoryPath;
  const comments = sourceCode.getAllComments() || [];
  comments.forEach((comment: any) => {
    rawStoryPath = handleComment({
      comment,
      context,
      cwd,
      reqCache,
      rawStoryPath,
    });
  });
}

/**
 * Create a Program listener that iterates comments and validates annotations.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Initialize and share a requirement cache for the program
 * @req REQ-DEEP-CACHE - Derive the working directory context for path resolution
 */
function programListener(context: any) {
  const sourceCode = context.getSourceCode();
  const cwd = process.cwd();
  const reqCache = new Map<string, Set<string>>();
  let rawStoryPath: string | null = null;

  /**
   * Program visitor that walks all comments to validate story/requirement references.
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-DEEP-PARSE - Collect all comments from the source code
   * @req REQ-DEEP-MATCH - Drive comment-level handling for traceability checks
   * @req REQ-DEEP-CACHE - Reuse story path and requirement cache across comments
   * @req REQ-DEEP-CACHE - Ensure validation respects project-relative paths
   */
  return function Program() {
    processAllComments({
      sourceCode,
      context,
      cwd,
      reqCache,
      initialStoryPath: rawStoryPath,
    });
  };
}

/**
 * Factory used by the valid-req-reference rule to construct its Program
 * visitor. Keeping this in a helper module allows the rule entrypoint
 * itself to remain small and focused on meta configuration while the
 * heavier deep-validation logic is encapsulated here.
 *
 * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-PARSE REQ-DEEP-MATCH REQ-DEEP-CACHE
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-VALIDATE REQ-MIXED-SUPPORT REQ-SCOPED-IDS
 */
export function createValidReqReferenceProgramVisitor(
  context: Rule.RuleContext,
) {
  return programListener(context);
}
