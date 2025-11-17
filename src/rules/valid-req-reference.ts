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
 * Handle JSDoc story and req annotations.
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse story files to extract requirement identifiers
 * @req REQ-DEEP-MATCH - Validate @req references against story file content
 * @req REQ-DEEP-CACHE - Cache parsed story content for performance
 * @req REQ-DEEP-PATH - Protect against path traversal in story paths
 */
function handleComment(
  comment: any,
  context: any,
  sourceCode: any,
  cwd: string,
  reqCache: Map<string, Set<string>>,
  rawStoryPath: string | null
): string | null {
  let storyPath = rawStoryPath;
  const rawLines = comment.value.split(/\r?\n/);
  const lines = rawLines.map((rawLine: string) =>
    rawLine.trim().replace(/^\*+\s*/, "")
  );
  lines.forEach((line: string) => {
    if (line.startsWith("@story")) {
      const parts = line.split(/\s+/);
      storyPath = parts[1] || null;
    }
    if (line.startsWith("@req")) {
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
          let match;
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
  });
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
      rawStoryPath = handleComment(
        comment,
        context,
        sourceCode,
        cwd,
        reqCache,
        rawStoryPath
      );
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