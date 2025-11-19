/* eslint-env node */
/**
 * Rule to validate @req annotation references refer to existing requirements in story files
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse story files to extract requirement identifiers
 * @req REQ-DEEP-MATCH - Validate @req references against story file content
 * @req REQ-DEEP-CACHE - Cache parsed story content for performance
 * @req REQ-DEEP-PATH - Protect against path traversal in story paths
 */
import fs from "fs";
import path from "path";
import type { Rule } from "eslint";

/**
 * Extract the story path from a JSDoc comment.
 * Parses comment.value lines for @story annotation.
 * @param comment any JSDoc comment node
 * @returns story path or null if not found
 *
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Extracts @story annotation from comment content
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
 *
 * @param opts options bag
 *
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PATH - Validates and protects against path traversal and absolute paths
 * @req REQ-DEEP-CACHE - Caches parsed story files to avoid repeated IO
 * @req REQ-DEEP-MATCH - Ensures referenced requirement IDs exist in the story file
 * @req REQ-DEEP-PARSE - Parses story file content to find REQ- identifiers
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
 * Handle a single annotation line.
 * @story Updates the current story path when encountering an @story annotation
 * @req Validates the requirement reference against the current story content
 *
 * @param opts handler options
 *
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Recognizes @story and @req annotation lines
 * @req REQ-DEEP-MATCH - Delegates @req validation to validateReqLine
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
 * Handle JSDoc story and req annotations.
 *
 * @param opts options for comment handling
 *
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parses comment blocks to extract annotation lines
 * @req REQ-DEEP-MATCH - Uses handleAnnotationLine to validate @req entries
 * @req REQ-DEEP-CACHE - Passes shared cache for parsed story files
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
 *
 * @param context ESLint rule context
 * @returns Program visitor function
 *
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-CACHE - Maintains a cache across comment processing
 * @req REQ-DEEP-PATH - Resolves and protects story paths against traversal
 */
function programListener(context: any) {
  const sourceCode = context.getSourceCode();
  const cwd = process.cwd();
  const reqCache = new Map<string, Set<string>>();
  let rawStoryPath: string | null = null;

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
   *
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-DEEP-MATCH - Entrypoint orchestrates validation of @req annotations
   * @req REQ-DEEP-PARSE - Uses parsing helpers to extract annotations and story paths
   * @req REQ-DEEP-CACHE - Establishes cache used during validation
   * @req REQ-DEEP-PATH - Ensures path validation is applied during checks
   */
  create(context) {
    return { Program: programListener(context) };
  },
} as Rule.RuleModule;