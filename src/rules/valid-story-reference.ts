/* eslint-disable traceability/require-branch-annotation */

/**
 * This rule validates that `@story` annotation references refer to existing story files.
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-PATH-RESOLUTION REQ-SECURITY-VALIDATION
 */
import type { Rule } from "eslint";
import {
  normalizeStoryPath,
  hasValidExtension,
} from "../utils/storyReferenceUtils";
import {
  performSecurityValidations,
  handleProjectBoundaryForExistence,
} from "./helpers/valid-story-reference-helpers";

const defaultStoryDirs = ["docs/stories", "stories"];

/**
 * Shared helper to report an invalid story path. Centralizes the
 * `invalidPath` diagnostic so callers don't repeat the same
 * `context.report` shape.
 *
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PROJECT-BOUNDARY
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-CONSISTENCY
 */
function reportInvalidPath(opts: {
  storyPath: string;
  commentNode: any;
  context: any;
}): void {
  const { storyPath, commentNode, context } = opts;
  context.report({
    node: commentNode,
    messageId: "invalidPath",
    data: { path: storyPath },
  });
}

/**
 * Extracts the story path from the annotation line and delegates validation.
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-ANNOTATION-VALIDATION
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
 * Handles existence status and reports appropriate diagnostics for missing
 * or filesystem-error conditions, assuming project-boundary checks have
 * already been applied.
 *
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-ERROR-HANDLING
 */
function reportExistenceStatus(
  existenceResult: ReturnType<typeof normalizeStoryPath>["existence"],
  storyPath: string,
  commentNode: any,
  context: any,
): void {
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
 * Reports any problems related to the existence or accessibility of the
 * referenced story file. Filesystem and I/O errors are surfaced with a
 * dedicated diagnostic that differentiates them from missing files.
 *
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-ERROR-HANDLING REQ-PROJECT-BOUNDARY REQ-CONFIGURABLE-PATHS
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

  const candidates = result.candidates || [];

  const invalidByBoundary = handleProjectBoundaryForExistence({
    storyPath,
    commentNode,
    context,
    cwd,
    candidates,
    existenceResult,
    reportInvalidPath,
  });

  if (invalidByBoundary) {
    return;
  }

  reportExistenceStatus(existenceResult, storyPath, commentNode, context);
}

/**
 * Processes and validates the story path for security, extension, and existence.
 * Filesystem and I/O errors are handled inside the underlying utilities
 * (e.g. storyExists) and surfaced as missing-file or filesystem-error
 * diagnostics where appropriate.
 *
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-PATH-RESOLUTION REQ-SECURITY-VALIDATION REQ-ERROR-HANDLING
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

  const securityOk = performSecurityValidations({
    storyPath,
    commentNode,
    context,
    cwd,
    allowAbsolute,
    reportInvalidPath,
  });

  if (!securityOk) {
    return;
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
   * Performs the existence check:
   * - Distinguishes between missing files and filesystem errors.
   * - Surfaces filesystem and I/O errors with a dedicated diagnostic.
   *
   * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-ERROR-HANDLING
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
 * Handles a single comment node by processing its lines and looking for
 * `@story` annotations that should be validated.
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-ANNOTATION-VALIDATION
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
     * Processes each line of the comment to extract and normalize `@story` annotations.
     * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-ANNOTATION-VALIDATION
     */
    .map((l: string) => l.replace(/^[^@]*/, "").trim());
  for (const line of lines) {
    // Check if line starts with `@story` or `@supports` followed by whitespace (actual annotation)
    // This prevents matching prose that mentions these keywords in backticks or mid-sentence
    if (line.startsWith("@story ") || line.startsWith("@supports ")) {
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

/**
 * ESLint rule factory: configures and returns visitors that validate story
 * references in `@story` and `@supports` annotations across all comments.
 *
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-ANNOTATION-VALIDATION
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate that `@story` annotations reference existing .story.md files",
      recommended: "error",
    },
    messages: {
      /**
       * Reports that a referenced story file could not be found.
       * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
       */
      fileMissing: "Story file '{{path}}' not found",
      /**
       * Reports that the provided story file path has an invalid extension.
       * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
       */
      invalidExtension:
        "Invalid story file extension for '{{path}}', expected '.story.md'",
      /**
       * Reports that the referenced story path is invalid due to being absolute
       * or containing unsafe traversal.
       * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
       */
      invalidPath: "Invalid story path '{{path}}'",
      /**
       * Reports a filesystem error that occurred while validating the story file.
       * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-ERROR-HANDLING
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
  /**
   * ESLint rule entrypoint.
   * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-ANNOTATION-VALIDATION REQ-CONFIGURABLE-PATHS REQ-FILE-EXISTENCE
   */
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
       * Program-level handler: iterates comments and validates `@story` annotations.
       * Filesystem and I/O errors are handled by underlying utilities and
       * surfaced as missing-file or filesystem-error diagnostics where appropriate.
       *
       * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-ANNOTATION-VALIDATION REQ-FILE-EXISTENCE REQ-PATH-RESOLUTION REQ-ERROR-HANDLING
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
