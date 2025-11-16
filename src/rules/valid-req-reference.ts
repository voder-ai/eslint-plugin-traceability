/* eslint-env node */
/**
 * Rule to validate @req annotation references refer to existing requirements in story files
 * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
 * @req REQ-DEEP-PARSE - Parse story files to extract requirement identifiers
 * @req REQ-DEEP-MATCH - Validate @req references against story file content
 * @req REQ-DEEP-CACHE - Cache parsed story content for performance
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
    },
    schema: [],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const cwd = process.cwd();

    // Cache for story file paths to parsed set of requirement IDs
    const reqCache = new Map<string, Set<string>>();

    let currentStoryPath: string | null = null;

    return {
      Program() {
        const comments = sourceCode.getAllComments() || [];
        comments.forEach((comment) => {
          const lines = comment.value.split(/\r?\n/).map((l) => l.trim());
          lines.forEach((line) => {
            if (line.startsWith("@story")) {
              const parts = line.split(/\s+/);
              currentStoryPath = parts[1] || null;
            }
            if (line.startsWith("@req")) {
              const parts = line.split(/\s+/);
              const reqId = parts[1];
              if (!reqId || !currentStoryPath) {
                return;
              }

              // Load and parse story file if not cached
              if (!reqCache.has(currentStoryPath)) {
                try {
                  const fullPath = path.resolve(cwd, currentStoryPath);
                  const content = fs.readFileSync(fullPath, "utf8");
                  const found = new Set<string>();
                  // Extract requirement IDs using regex
                  const regex = /REQ-[A-Z0-9-]+/g;
                  let match;
                  while ((match = regex.exec(content)) !== null) {
                    found.add(match[0]);
                  }
                  reqCache.set(currentStoryPath, found);
                } catch {
                  // Unable to read file, treat as no requirements
                  reqCache.set(currentStoryPath, new Set());
                }
              }

              const reqSet = reqCache.get(currentStoryPath)!;
              if (!reqSet.has(reqId)) {
                context.report({
                  node: comment as any,
                  messageId: "reqMissing",
                  data: { reqId, storyPath: currentStoryPath },
                });
              }
            }
          });
        });
      },
    };
  },
} as Rule.RuleModule;
