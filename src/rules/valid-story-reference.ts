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
  enforceProjectBoundary,
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
  const {
    line,
    commentNode,
    context,
    cwd,
    storyDirs,
    allowAbsolute,
    requireExt,
  } = opts;
  const parts = line.split(/\s+/);
  const storyPath = parts[1];
  if (!storyPath) return;
  processStoryPath({
    storyPath,
    commentNode,
    context,
    cwd,
    storyDirs,
    allowAbsolute,
    requireExt,
  });
}

/**
 * Report any problems related to the existence or accessibility of the
 * referenced story file. Filesystem and I/O errors are surfaced with a
 * dedicated diagnostic that differentiates them from missing files.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Ensure referenced files exist
 * @req REQ-ERROR-HANDLING - Differentiate missing files from filesystem errors
 */
function reportExistenceProblems(opts: {
  storyPath: string;
  commentNode: any;
  context: any;
  cwd: string;
  storyDirs: string[];
}): void {
  const { storyPath, commentNode, context, cwd, storyDirs } = opts;

  const result = normalizeStoryPath(storyPath, cwd, storyDirs);
  const existenceResult = result.existence;

  if (
    existenceResult &&
    existenceResult.status === "exists" &&
    existenceResult.matchedPath
  ) {
    const boundary = enforceProjectBoundary(existenceResult.matchedPath, cwd);
    if (!boundary.isWithinProject) {
      context.report({
        node: commentNode,
        messageId: "invalidPath",
        data: { path: storyPath },
      });
      return;
    }
  }

  if (!existenceResult || existenceResult.status === "exists") {
    return;
  }

  if (existenceResult.status === "missing") {
    context.report({
      node: commentNode,
      messageId: "fileMissing",
      data: { path: storyPath },
    });
    return;
  }

  if (existenceResult.status === "fs-error") {
    const rawError = existenceResult.error;
    let errorMessage: string;

    if (rawError == null) {
      errorMessage = "Unknown filesystem error";
    } else if (rawError instanceof Error) {
      errorMessage = rawError.message;
    } else {
      errorMessage = String(rawError);
    }

    context.report({
      node: commentNode,
      messageId: "fileAccessError",
      data: {
        path: storyPath,
        error: errorMessage,
      },
    });
  }
}

/**
 * Process and validate the story path for security, extension, and existence.
 * Filesystem and I/O errors are handled inside the underlying utilities
 * (e.g. storyExists) and surfaced as missing-file or filesystem-error
 * diagnostics where appropriate.
 *
 * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
 * @req REQ-FILE-EXISTENCE - Validate that story file paths reference existing files
 * @req REQ-PATH-RESOLUTION - Resolve relative paths correctly and enforce configuration
 * @req REQ-SECURITY-VALIDATION - Prevent path traversal and absolute path usage
 * @req REQ-ERROR-HANDLING - Delegate filesystem and I/O error handling to utilities and differentiate error types
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
  const {
    storyPath,
    commentNode,
    context,
    cwd,
    storyDirs,
    allowAbsolute,
    requireExt,
  } = opts;

  // Absolute path check
  if (path.isAbsolute(storyPath)) {
    if (!allowAbsolute) {
      context.report({
        node: commentNode,
        messageId: "invalidPath",
        data: { path: storyPath },
      });
      return;
    }
    // When absolute paths are allowed, we still enforce extension and
    // project-boundary checks below via the existence phase.
  }

  // Path traversal check
  if (containsPathTraversal(storyPath)) {
    const full = path.resolve(cwd, path.normalize(storyPath));
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
  if (requireExt && !hasValidExtension(storyPath)) {
    context.report({
      node: commentNode,
      messageId: "invalidExtension",
      data: { path: storyPath },
    });
    return;
  }

  /**
   * Existence check:
   * - Distinguish between missing files and filesystem errors.
   * - Filesystem and I/O errors are surfaced with a dedicated diagnostic.
   *
   * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
   * @req REQ-FILE-EXISTENCE - Ensure referenced files exist
   * @req REQ-ERROR-HANDLING - Differentiate missing files from filesystem errors
   */
  reportExistenceProblems({
    storyPath,
    commentNode,
    context,
    cwd,
    storyDirs,
  });
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
  const { commentNode, context, cwd, storyDirs, allowAbsolute, requireExt } =
    opts;
  const lines = commentNode.value
    .split(/\r?\n/)
    /**
     * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
     * @req REQ-ANNOTATION-VALIDATION - Ensure each annotation line is parsed
     */
    .map((l: string) => l.replace(/^[^@]*/, "").trim());
  for (const line of lines) {
    if (line.startsWith("@story")) {
      validateStoryPath({
        line,
        commentNode,
        context,
        cwd,
        storyDirs,
        allowAbsolute,
        requireExt,
      });
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
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
       * @req REQ-ERROR-SPECIFIC - Provide specific diagnostics when a referenced story file cannot be found
       * @req REQ-ERROR-CONTEXT - Include the original story path in the error message for troubleshooting
       * @req REQ-ERROR-CONSISTENCY - Use consistent file-related error wording and placeholders across rules
       */
      fileMissing: "Story file '{{path}}' not found",
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
       * @req REQ-ERROR-SPECIFIC - Indicate that the story file extension is invalid and what is expected
       * @req REQ-ERROR-CONTEXT - Include the provided path so developers can see which reference is wrong
       * @req REQ-ERROR-CONSISTENCY - Reuse the same pattern of "{{path}}" placeholder across file validation messages
       */
      invalidExtension:
        "Invalid story file extension for '{{path}}', expected '.story.md'",
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
       * @req REQ-ERROR-SPECIFIC - Explain that the story path is invalid due to absolute or unsafe traversal
       * @req REQ-ERROR-CONTEXT - Surface the offending path to assist with correcting the reference
       * @req REQ-ERROR-CONSISTENCY - Maintain a consistent template for invalid path diagnostics across rules
       */
      invalidPath: "Invalid story path '{{path}}'",
      /**
       * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
       * @req REQ-ERROR-HANDLING - Provide clear diagnostics for filesystem errors
       */
      fileAccessError:
        "Could not validate story file '{{path}}' due to a filesystem error: {{error}}. Please check file existence and permissions.",
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
  create(context: Rule.RuleContext) {
    const cwd = (context as any).cwd ?? process.cwd();
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
      /**
       * Program-level handler: iterate comments and validate @story annotations.
       * Filesystem and I/O errors are handled by underlying utilities and
       * surfaced as missing-file or filesystem-error diagnostics where appropriate.
       *
       * @story docs/stories/006.0-DEV-FILE-VALIDATION.story.md
       * @req REQ-ANNOTATION-VALIDATION - Discover and dispatch @story annotations for validation
       * @req REQ-FILE-EXISTENCE - Ensure referenced files exist
       * @req REQ-PATH-RESOLUTION - Resolve using cwd and configured story directories
       * @req REQ-ERROR-HANDLING - Delegate filesystem and I/O error handling to utilities
       */
      Program() {
        const comments = context.getSourceCode().getAllComments() || [];
        for (const comment of comments) {
          handleComment({
            commentNode: comment,
            context,
            cwd,
            storyDirs,
            allowAbsolute,
            requireExt,
          });
        }
      },
    };
  },
} as Rule.RuleModule;
