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
  create(context) {
    return { Program: programListener(context) };
  },
} as Rule.RuleModule;
