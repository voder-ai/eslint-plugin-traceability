/* eslint-env node */
/**
 * Rule to validate @req annotation references refer to existing requirements in story files
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse comments and extract story/requirement metadata
 * @req REQ-DEEP-MATCH - Match @req annotations to story file requirements
 * @req REQ-DEEP-CACHE - Cache requirement IDs per story file for efficient validation
 * @req REQ-DEEP-PATH - Validate and resolve story file paths safely
 */
import fs from "fs";
import path from "path";
import type { Rule } from "eslint";

/**
 * Extract the story path from a JSDoc comment.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse JSDoc comment lines to locate @story annotations
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
 * Validate a @req annotation line against the extracted story content.
 * Performs path validation, file reading, caching, and requirement existence checks.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PATH - Validate and resolve referenced story file paths
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
  const parts = line.split(/\s+/);
  const reqId = parts[1];
  if (!reqId || !storyPath) {
    return;
  }
  if (storyPath.includes("..") || path.isAbsolute(storyPath)) {
    context.report({
      node: comment as any,
      messageId: "invalidPath",
      data: { storyPath },
    });
    return;
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
    return;
  }
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
  const reqSet = reqCache.get(resolvedStoryPath)!;
  if (!reqSet.has(reqId)) {
    context.report({
      node: comment as any,
      messageId: "reqMissing",
      data: { reqId, storyPath },
    });
  }
}

/**
 * Handle a single annotation line for story or requirement metadata.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse annotation lines for @story and @req tags
 * @req REQ-DEEP-MATCH - Dispatch @req lines for validation against story requirements
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
  let storyPath = rawStoryPath;
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
 * Create a Program listener that iterates comments and validates annotations.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Initialize and share a requirement cache for the program
 * @req REQ-DEEP-PATH - Derive the working directory context for path resolution
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
   * @req REQ-DEEP-PATH - Ensure validation respects project-relative paths
   */
  return function Program() {
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
  };
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate that @req annotations reference existing requirements in referenced story files",
      recommended: "error",
    },
    messages: {
      reqMissing: "Requirement '{{reqId}}' not found in '{{storyPath}}'",
      invalidPath: "Invalid story path '{{storyPath}}'",
    },
    schema: [],
  },
  /**
   * Rule create entrypoint that returns the Program visitor.
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-DEEP-MATCH - Register the Program visitor with ESLint
   * @req REQ-DEEP-PARSE - Integrate comment parsing into the ESLint rule lifecycle
   * @req REQ-DEEP-CACHE - Ensure cache and context are wired into the listener
   * @req REQ-DEEP-PATH - Propagate path context into the program listener
   */
  create(context) {
    return { Program: programListener(context) };
  },
} as Rule.RuleModule;
