/* eslint-env node */
/**
 * Rule to validate @story annotation references refer to existing story files
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
import path from "path";
import type { Rule } from "eslint";
import {
  normalizeStoryPath,
  containsPathTraversal,
  hasValidExtension,
} from "../utils/storyReferenceUtils";

const defaultStoryDirs = ["docs/stories", "stories"];

/**
 * Extract the story path from the annotation line and delegate validation.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-ANNOTATION-VALIDATION - Ensure each annotation line is parsed
 */
function validateStoryPath(opts: {
  line: string;
  commentNode: any;
  context: any;
  cwd: string;
  storyDirs: string[];
  allowAbsolute: boolean;
  requireExt: boolean;
}): void {
  const { line, commentNode, context, cwd, storyDirs, allowAbsolute, requireExt } = opts;
  const parts = line.split(/\s+/);
  const storyPath = parts[1];
  if (!storyPath) return;
  processStoryPath({ storyPath, commentNode, context, cwd, storyDirs, allowAbsolute, requireExt });
}

/**
 * Process and validate the story path for security, extension, and existence.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
function processStoryPath(opts: {
  storyPath: string;
  commentNode: any;
  context: any;
  cwd: string;
  storyDirs: string[];
  allowAbsolute: boolean;
  requireExt: boolean;
}): void {
  const { storyPath, commentNode, context, cwd, storyDirs, allowAbsolute, requireExt } = opts;

  // Absolute path check
  if (path.isAbsolute(storyPath)) {
    if (!allowAbsolute) {
      context.report({ node: commentNode, messageId: "invalidPath", data: { path: storyPath } });
    }
    return;
  }

  // Path traversal check
  if (containsPathTraversal(storyPath)) {
    const full = path.resolve(cwd, path.normalize(storyPath));
    if (!full.startsWith(cwd + path.sep)) {
      context.report({ node: commentNode, messageId: "invalidPath", data: { path: storyPath } });
      return;
    }
  }

  // Extension check
  if (requireExt && !hasValidExtension(storyPath)) {
    context.report({ node: commentNode, messageId: "invalidExtension", data: { path: storyPath } });
    return;
  }

  // Existence check
  if (!normalizeStoryPath(storyPath, cwd, storyDirs).exists) {
    context.report({ node: commentNode, messageId: "fileMissing", data: { path: storyPath } });
  }
}

/**
 * Handle a single comment node by processing its lines.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-ANNOTATION-VALIDATION - Ensure each annotation line is parsed
 */
function handleComment(opts: {
  commentNode: any;
  context: any;
  cwd: string;
  storyDirs: string[];
  allowAbsolute: boolean;
  requireExt: boolean;
}): void {
  const { commentNode, context, cwd, storyDirs, allowAbsolute, requireExt } = opts;
  const lines = commentNode.value
    .split(/\r?\n/)
    .map((l: string) => l.replace(/^[^@]*/, "").trim());
  for (const line of lines) {
    if (line.startsWith("@story")) {
      validateStoryPath({ line, commentNode, context, cwd, storyDirs, allowAbsolute, requireExt });
    }
  }
}

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Validate that @story annotations reference existing .story.md files",
      recommended: "error",
    },
    messages: {
      fileMissing: "Story file '{{path}}' not found",
      invalidExtension: "Invalid story file extension for '{{path}}', expected '.story.md'",
      invalidPath: "Invalid story path '{{path}}'",
    },
    schema: [
      {
        type: "object",
        properties: {
          storyDirectories: { type: "array", items: { type: "string" } },
          allowAbsolutePaths: { type: "boolean" },
          requireStoryExtension: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const cwd = process.cwd();
    const opts = context.options[0] as
      | { storyDirectories?: string[]; allowAbsolutePaths?: boolean; requireStoryExtension?: boolean }
      | undefined;
    const storyDirs = opts?.storyDirectories || defaultStoryDirs;
    const allowAbsolute = opts?.allowAbsolutePaths || false;
    const requireExt = opts?.requireStoryExtension !== false;
    return {
      Program() {
        const comments = context.getSourceCode().getAllComments() || [];
        for (const comment of comments) {
          handleComment({ commentNode: comment, context, cwd, storyDirs, allowAbsolute, requireExt });
        }
      },
    };
  },
} as Rule.RuleModule;