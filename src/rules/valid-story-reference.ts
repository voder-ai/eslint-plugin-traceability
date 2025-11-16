/* eslint-env node */
/**
 * Rule to validate @story annotation references refer to existing story files
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
import fs from "fs";
import path from "path";
import type { Rule } from "eslint";

const defaultStoryDirs = ["docs/stories", "stories"];
const fileExistCache = new Map<string, boolean>();

/**
 * Build possible file paths for a given storyPath.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 */
function buildCandidates(
  storyPath: string,
  cwd: string,
  storyDirs: string[],
): string[] {
  const candidates: string[] = [];
  if (storyPath.startsWith("./") || storyPath.startsWith("../")) {
    candidates.push(path.resolve(cwd, storyPath));
  } else {
    candidates.push(path.resolve(cwd, storyPath));
    for (const dir of storyDirs) {
      candidates.push(path.resolve(cwd, dir, path.basename(storyPath)));
    }
  }
  return candidates;
}

/**
 * Check if any of the candidate files exist.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 */
function existsAny(paths: string[]): boolean {
  for (const candidate of paths) {
    let ok = fileExistCache.get(candidate);
    if (ok === undefined) {
      ok = fs.existsSync(candidate) && fs.statSync(candidate).isFile();
      fileExistCache.set(candidate, ok);
    }
    if (ok) {
      return true;
    }
  }
  return false;
}

/**
 * Validate a single @story annotation line.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 */
function validateStoryPath(
  line: string,
  commentNode: any,
  context: any,
  cwd: string,
  storyDirs: string[],
  allowAbsolute: boolean,
  requireExt: boolean,
): void {
  const parts = line.split(/\s+/);
  const storyPath = parts[1];
  if (!storyPath) {
    return;
  }
  // Absolute path check
  if (path.isAbsolute(storyPath)) {
    if (!allowAbsolute) {
      context.report({
        node: commentNode,
        messageId: "invalidPath",
        data: { path: storyPath },
      });
    }
    return;
  }
  // Path traversal prevention
  if (storyPath.includes("..")) {
    const normalized = path.normalize(storyPath);
    const full = path.resolve(cwd, normalized);
    if (!full.startsWith(cwd + path.sep)) {
      context.report({
        node: commentNode,
        messageId: "invalidPath",
        data: { path: storyPath },
      });
      return;
    }
  }
  // Extension check
  if (requireExt && !storyPath.endsWith(".story.md")) {
    context.report({
      node: commentNode,
      messageId: "invalidExtension",
      data: { path: storyPath },
    });
    return;
  }
  // Build candidate paths and check existence
  const candidates = buildCandidates(storyPath, cwd, storyDirs);
  if (!existsAny(candidates)) {
    context.report({
      node: commentNode,
      messageId: "fileMissing",
      data: { path: storyPath },
    });
  }
}

/**
 * Handle a single comment node by processing its lines.
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-ANNOTATION-VALIDATION - Ensure each annotation line is parsed
 */
function handleComment(
  commentNode: any,
  context: any,
  sourceCode: any,
  cwd: string,
  storyDirs: string[],
  allowAbsolute: boolean,
  requireExt: boolean,
): void {
  const lines = commentNode.value.split(/\r?\n/).map((l: string) => l.trim());
  for (const line of lines) {
    if (line.startsWith("@story")) {
      validateStoryPath(
        line,
        commentNode,
        context,
        cwd,
        storyDirs,
        allowAbsolute,
        requireExt,
      );
    }
  }
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate that @story annotations reference existing .story.md files",
      recommended: "error",
    },
    messages: {
      fileMissing: "Story file '{{path}}' not found",
      invalidExtension:
        "Invalid story file extension for '{{path}}', expected '.story.md'",
      invalidPath: "Invalid story path '{{path}}'",
    },
    schema: [
      {
        type: "object",
        properties: {
          storyDirectories: {
            type: "array",
            items: { type: "string" },
          },
          allowAbsolutePaths: { type: "boolean" },
          requireStoryExtension: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const cwd = process.cwd();
    const opts = context.options[0] as
      | {
          storyDirectories?: string[];
          allowAbsolutePaths?: boolean;
          requireStoryExtension?: boolean;
        }
      | undefined;
    const storyDirs = opts?.storyDirectories || defaultStoryDirs;
    const allowAbsolute = opts?.allowAbsolutePaths || false;
    const requireExt = opts?.requireStoryExtension !== false;
    return {
      Program() {
        const comments = sourceCode.getAllComments() || [];
        for (const comment of comments) {
          handleComment(
            comment,
            context,
            sourceCode,
            cwd,
            storyDirs,
            allowAbsolute,
            requireExt,
          );
        }
      },
    };
  },
} as Rule.RuleModule;
