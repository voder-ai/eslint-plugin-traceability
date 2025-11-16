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
    const sourceCode = context.getSourceCode();
    const cwd = process.cwd();

    // Cache for resolved story file paths to parsed set of requirement IDs
    const reqCache = new Map<string, Set<string>>();

    let rawStoryPath: string | null = null;

    return {
      Program() {
        const comments = sourceCode.getAllComments() || [];
        comments.forEach((comment) => {
          const rawLines = comment.value.split(/\r?\n/);
          const lines = rawLines.map((rawLine) =>
            rawLine.trim().replace(/^\*+\s*/, ""),
          );
          lines.forEach((line) => {
            if (line.startsWith("@story")) {
              const parts = line.split(/\s+/);
              rawStoryPath = parts[1] || null;
            }
            if (line.startsWith("@req")) {
              const parts = line.split(/\s+/);
              const reqId = parts[1];
              if (!reqId || !rawStoryPath) {
                return;
              }

              // Protect against path traversal and absolute paths
              if (
                rawStoryPath.includes("..") ||
                path.isAbsolute(rawStoryPath)
              ) {
                context.report({
                  node: comment as any,
                  messageId: "invalidPath",
                  data: { storyPath: rawStoryPath },
                });
                return;
              }

              const resolvedStoryPath = path.resolve(cwd, rawStoryPath);
              if (
                !resolvedStoryPath.startsWith(cwd + path.sep) &&
                resolvedStoryPath !== cwd
              ) {
                context.report({
                  node: comment as any,
                  messageId: "invalidPath",
                  data: { storyPath: rawStoryPath },
                });
                return;
              }

              // Load and parse story file if not cached
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
                  // Unable to read file, treat as no requirements
                  reqCache.set(resolvedStoryPath, new Set());
                }
              }

              const reqSet = reqCache.get(resolvedStoryPath)!;
              if (!reqSet.has(reqId)) {
                context.report({
                  node: comment as any,
                  messageId: "reqMissing",
                  data: { reqId, storyPath: rawStoryPath },
                });
              }
            }
          });
        });
      },
    };
  },
} as Rule.RuleModule;
