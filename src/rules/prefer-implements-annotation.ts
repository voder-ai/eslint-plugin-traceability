/* eslint-disable traceability/require-branch-annotation */

/**
 * ESLint rule implementation for preferring the consolidated `@supports`
 * annotation over legacy combinations of `@story` and `@req` within JSDoc
 * block comments. This module provides:
 *
 * - Detection of legacy `@story` + `@req` patterns.
 * - Identification of multi-story comment blocks that are not safely
 *   auto-fixable.
 * - A conservative auto-fix that rewrites simple, single-story patterns into
 *   a single `@supports` annotation while preserving formatting.
 *
 * The rule is intended as an **optional migration aid** to help projects
 * gradually move to the newer `@supports` format without breaking existing
 * traceability links.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT REQ-AUTO-FIX REQ-BACKWARD-COMPAT-VALIDATION REQ-INLINE-COMMENT-SUPPORT REQ-ERROR-MESSAGE-PREFERENCE
 */
import type { Rule } from "eslint";
import fs from "fs";
import path from "path";
import { normalizeCommentLine } from "./helpers/valid-annotation-format-internal";
import {
  processInlineComments,
  type LineComment,
} from "./helpers/prefer-implements-inline";

// Module-level cache for story file requirement IDs
// Cleared between ESLint runs, reused within a single lint execution
// @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
const storyFileCache = new Map<string, Set<string> | null>();

// Maximum number of distinct `@story` paths allowed before treating as "multi-story".
// @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
const MULTI_STORY_THRESHOLD = 1;

// Minimum number of tokens required for a valid `@story` annotation line.
// @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
const MIN_STORY_TOKENS = 2;

// Minimum number of tokens required for a valid `@req` annotation line, aligned with story tokens.
const MIN_REQ_TOKENS = MIN_STORY_TOKENS;

// Length of the opening "/*" portion of a block comment prefix.
const COMMENT_PREFIX_LENGTH = 2;

/**
 * Extract requirement IDs defined in a story file.
 * Supports multiple markdown formats used in story files:
 * - Heading format: - **REQ-ID**: Description
 * - Acceptance format: - [x] REQ-ID: Description
 * - Code annotation format: @req REQ-ID
 *
 * Returns null if the story file cannot be found or read.
 * Returns Set<string> of requirement IDs if successful (may be empty if no requirements found).
 *
 * Results are cached for the duration of the ESLint run to avoid repeated file I/O.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
 */
function extractRequirementsFromStory(
  storyPath: string,
  context: Rule.RuleContext,
): Set<string> | null {
  // Check cache first
  if (storyFileCache.has(storyPath)) {
    return storyFileCache.get(storyPath)!;
  }

  // Resolve story path relative to CWD
  const cwd = context.getCwd ? context.getCwd() : process.cwd();

  // Validate story path: no traversal or absolute paths
  if (storyPath.includes("..") || path.isAbsolute(storyPath)) {
    storyFileCache.set(storyPath, null);
    return null;
  }

  const resolvedPath = path.resolve(cwd, storyPath);

  // Ensure resolved path is within cwd (security check)
  if (!resolvedPath.startsWith(cwd + path.sep) && resolvedPath !== cwd) {
    storyFileCache.set(storyPath, null);
    return null;
  }

  // Read and parse story file
  try {
    const content = fs.readFileSync(resolvedPath, "utf8");
    const found = new Set<string>();

    // Extract requirement IDs using regex pattern that matches:
    // - **REQ-ID**: in markdown headings
    // - [x] REQ-ID: in acceptance criteria
    // - @req REQ-ID in code annotations
    // - REQ-ID anywhere else in the file
    const regex = /REQ-[A-Z0-9-]+/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      found.add(match[0]);
    }

    storyFileCache.set(storyPath, found);
    return found;
  } catch {
    // File not found or read error
    storyFileCache.set(storyPath, null);
    return null;
  }
}

/**
 * Lightweight summary of traceability-related markers extracted from a
 * single block comment, used to decide whether migration recommendations
 * or auto-fix can safely be applied.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT
 */
interface CommentAnalysis {
  hasStory: boolean;
  hasReq: boolean;
  hasImplements: boolean;
  storyPaths: Set<string>;
}

/**
 * Collect line indices and metadata for `@story` and `@req` annotations within a
 * single block comment. This helper isolates the parsing logic used by the
 * auto-fix path so that complex or ambiguous patterns can be detected and
 * safely rejected.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-AUTO-FIX REQ-MULTI-STORY-DETECT
 */
function collectStoryAndReqMetadata(comment: any): {
  storyLineIndices: number[];
  reqLineIndices: number[];
  reqIds: string[];
  storyPath: string | null;
} {
  const rawValue: string = comment.value || "";
  const rawLines: string[] = rawValue.split(/\r?\n/);

  const storyLineIndices: number[] = [];
  const reqLineIndices: number[] = [];
  const reqIds: string[] = [];
  let storyPath: string | null = null;

  rawLines.forEach((rawLine, index) => {
    const normalized = normalizeCommentLine(rawLine);
    if (!normalized) return;

    if (/^@supports\b/.test(normalized)) {
      // Mixed `@supports` usage should have been filtered out earlier
      return;
    }

    if (/^@story\b/.test(normalized)) {
      const parts = normalized.split(/\s+/);
      if (parts.length === MIN_STORY_TOKENS) {
        storyLineIndices.push(index);
        storyPath = parts[1];
      } else {
        storyPath = null;
      }
      return;
    }

    if (/^@req\b/.test(normalized)) {
      const parts = normalized.split(/\s+/);
      if (parts.length === MIN_REQ_TOKENS) {
        reqLineIndices.push(index);
        reqIds.push(parts[1]);
      } else {
        // Complex `@req` form; bail out entirely.
        storyPath = null;
      }
    }
  });

  return { storyLineIndices, reqLineIndices, reqIds, storyPath };
}

/**
 * Apply the `@supports` replacement for simple, single-story legacy blocks,
 * constructing a fixed comment body that preserves existing indentation and
 * prefix formatting while removing the original `@story`/`@req` lines.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-AUTO-FIX
 */
function applyImplementsReplacement(
  context: Rule.RuleContext,
  comment: any,
  details: {
    storyIdx: number;
    allIndicesToRemove: Set<number>;
    storyPath: string;
    reqIds: string[];
  },
): Rule.ReportFixer {
  const { storyIdx, allIndicesToRemove, storyPath, reqIds } = details;

  const rawValue: string = comment.value || "";
  const rawLines: string[] = rawValue.split(/\r?\n/);

  const implAnnotation = `@supports ${storyPath} ${reqIds.join(" ")}`;

  // Determine the leading prefix (indentation and `*`) from the original `@story` line
  const storyRawLine = rawLines[storyIdx];
  const prefixMatch = storyRawLine.match(/^(\s*\*?\s*)/);
  const linePrefix = prefixMatch ? prefixMatch[1] : "";

  const implementsLine = `${linePrefix}${implAnnotation}`;

  const fixedLines: string[] = [];
  rawLines.forEach((line, index) => {
    if (index === storyIdx) {
      fixedLines.push(implementsLine);
      return;
    }
    if (allIndicesToRemove.has(index)) {
      return;
    }
    fixedLines.push(line);
  });

  const fixedValue = fixedLines.join("\n");
  const sourceCode = context.getSourceCode();

  return (fixer) =>
    fixer.replaceTextRange(
      [comment.range[0], comment.range[1]],
      sourceCode.text.slice(
        comment.range[0],
        comment.range[0] + COMMENT_PREFIX_LENGTH,
      ) +
        fixedValue +
        "*/",
    );
}

/**
 * Build an ESLint auto-fix for simple single-story `@story` + `@req` JSDoc
 * blocks, converting them to a single `@supports` annotation while
 * preserving the original comment formatting.
 *
 * The fixer is intentionally conservative and only activates when:
 * This rule requires that there is exactly one distinct `@story` path.
 * It also requires that exactly one `@story` line is present.
 * It requires that at least one `@req` line is present.
 * It also requires that each `@req` line has the simple form (no extra tokens).
 *
 * When applicable, the fix:
 * It removes the original `@story` and `@req` lines.
 * It then inserts a single `@supports` line in their place, preserving the
 * original leading comment prefix (indentation and `*` markers).
 *
 * More complex patterns remain diagnostics-only with no fix to avoid
 * producing invalid or ambiguous output.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-AUTO-FIX REQ-MULTI-STORY-DETECT
 */
function buildImplementsAutoFix(
  context: Rule.RuleContext,
  comment: any,
  storyPaths: Set<string>,
): Rule.ReportFixer | null {
  if (storyPaths.size !== 1) return null;

  const { storyLineIndices, reqLineIndices, reqIds, storyPath } =
    collectStoryAndReqMetadata(comment);

  if (
    storyPaths.size !== 1 ||
    storyLineIndices.length !== 1 ||
    reqLineIndices.length < 1 ||
    storyPath === null
  ) {
    return null;
  }

  // NEW: Validate `@req` IDs against story file content
  // This implements REQ-MULTI-STORY-DETECT requirement to detect when
  // `@req` IDs don't match the referenced `@story`
  // @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
  const storyReqs = extractRequirementsFromStory(storyPath, context);

  // If story file not found or unreadable, cannot safely auto-fix
  if (storyReqs === null) {
    return null;
  }

  // Check for mismatched `@req` IDs (IDs not defined in the story)
  const mismatchedReqs = reqIds.filter((reqId) => !storyReqs.has(reqId));

  // If any `@req` IDs don't match the story, cannot safely auto-fix
  // This likely indicates a multi-story implementation that needs manual migration
  if (mismatchedReqs.length > 0) {
    return null;
  }

  const storyIdx = storyLineIndices[0];
  const allIndicesToRemove = new Set<number>([
    ...storyLineIndices,
    ...reqLineIndices,
  ]);

  return applyImplementsReplacement(context, comment, {
    storyIdx,
    allIndicesToRemove,
    storyPath,
    reqIds,
  });
}

/**
 * Analyze a block comment to detect legacy `@story`/`@req` usage, existing
 * `@supports` lines, and the presence of multiple distinct `@story` paths.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT
 */
function analyzeComment(comment: any): CommentAnalysis {
  const rawLines: string[] = (comment.value || "").split(/\r?\n/);

  let hasStory = false;
  let hasReq = false;
  let hasImplements = false;
  const storyPaths = new Set<string>();

  rawLines.forEach((rawLine) => {
    const normalized = normalizeCommentLine(rawLine);
    if (!normalized) return;

    if (/^@supports\b/.test(normalized)) {
      hasImplements = true;
      return;
    }

    if (/^@story\b/.test(normalized)) {
      hasStory = true;
      const parts = normalized.split(/\s+/);
      if (parts.length >= MIN_STORY_TOKENS) {
        storyPaths.add(parts[1]);
      }
      return;
    }

    if (/^@req\b/.test(normalized)) {
      hasReq = true;
    }
  });

  return { hasStory, hasReq, hasImplements, storyPaths };
}

/**
 * Check whether a given set of story paths represents multiple story/req
 * blocks within the same comment, which cannot be safely auto-migrated.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
 */
function hasMultipleStories(storyPaths: Set<string>): boolean {
  // @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
  return storyPaths.size > MULTI_STORY_THRESHOLD;
}

/**
 * Check for and report requirement identifier mismatches when auto-fix is not available.
 * Provides detailed error messages when requirement identifiers don't match the story file content.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
 */
function reportMismatchIfNeeded(
  comment: any,
  context: Rule.RuleContext,
): boolean {
  const { storyLineIndices, reqLineIndices, reqIds, storyPath } =
    collectStoryAndReqMetadata(comment);

  // Only check for mismatch if we have valid structure
  if (
    storyPath === null ||
    storyLineIndices.length !== 1 ||
    reqLineIndices.length < 1
  ) {
    return false;
  }

  const storyReqs = extractRequirementsFromStory(storyPath, context);

  if (storyReqs === null) {
    // Story file not found or unreadable
    context.report({
      node: comment as any,
      messageId: "cannotAutoFix",
      data: {
        reason: `story file '${storyPath}' not found or cannot be read`,
      },
    });
    return true;
  }

  const mismatchedReqs = reqIds.filter((reqId) => !storyReqs.has(reqId));

  if (mismatchedReqs.length > 0) {
    // Found mismatched requirement identifiers
    context.report({
      node: comment as any,
      messageId: "cannotAutoFix",
      data: {
        reason: `@req '${mismatchedReqs.join("', '")}' not found in story '${storyPath}'. This may indicate a multi-story implementation`,
      },
    });
    return true;
  }

  return false;
}

/**
 * End-to-end processing for a single block comment: classify its
 * traceability annotations, decide whether to report recommendations only
 * or emit an auto-fix, and surface the appropriate message ID.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT REQ-AUTO-FIX
 */
function processBlockComment(comment: any, context: Rule.RuleContext): void {
  const { hasStory, hasReq, hasImplements, storyPaths } =
    analyzeComment(comment);

  if (!hasStory || !hasReq) {
    return;
  }

  if (hasImplements) {
    context.report({
      node: comment as any,
      messageId: "cannotAutoFix",
      data: {
        reason: "comment mixes @story/@req with existing @supports annotations",
      },
    });
    return;
  }

  if (hasMultipleStories(storyPaths)) {
    context.report({
      node: comment as any,
      messageId: "multiStoryDetected",
    });
    return;
  }

  // Attempt to build auto-fix
  // Will return null if story file not found or requirement identifiers don't match story
  const fix = buildImplementsAutoFix(context, comment, storyPaths);

  // If no fix available, check if it's due to mismatch and provide helpful message
  if (fix === null) {
    const reported = reportMismatchIfNeeded(comment, context);
    if (reported) {
      return;
    }
  }

  context.report({
    node: comment as any,
    messageId: "preferImplements",
    fix: fix ?? undefined,
  });
}

/**
 * ESLint rule: prefer-implements-annotation
 *
 * Recommend migrating from legacy `@story` + `@req` annotations to the
 * newer `@supports` format. This rule is **disabled by default** and
 * is intended as an optional, opt-in migration aid.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT REQ-BACKWARD-COMPAT-VALIDATION REQ-ERROR-MESSAGE-PREFERENCE
 */

/**
 * ESLint rule: prefer-implements-annotation
 *
 * Recommend migrating from legacy `@story` + `@req` annotations to the
 * newer `@supports` format. This rule is **disabled by default** and
 * is intended as an optional, opt-in migration aid.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT REQ-BACKWARD-COMPAT-VALIDATION REQ-ERROR-MESSAGE-PREFERENCE
 */
const preferImplementsAnnotationRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Recommend using @supports instead of legacy @story + @req annotations (optional migration rule)",
      recommended: false,
    },
    // Auto-fix support will be wired in a later iteration; the rule starts as
    // a recommendation-only warning with no code modifications.
    fixable: "code",
    messages: {
      /**
       * Recommend migrating simple, single-story `@story` + `@req` blocks to a
       * single `@supports` line. Auto-fix is provided where safe in a
       * follow-up iteration.
       *
       * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-ERROR-MESSAGE-PREFERENCE
       */
      preferImplements:
        "Consider using @supports instead of @story + @req for clearer traceability. Run ESLint with --fix to auto-convert.",
      /**
       * Report situations where the rule detects a legacy annotation pattern
       * but cannot safely provide an automatic fix. The `reason` field gives
       * a short, human-readable explanation to guide manual migration.
       *
       * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
       */
      cannotAutoFix:
        "Cannot auto-fix: {{reason}}. Manual migration to @supports required.",
      /**
       * Specialized message for the most common non-fixable case where more
       * than one `@story` annotation appears in the same block, indicating a
       * likely multi-story integration that must be converted manually.
       *
       * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-MULTI-STORY-DETECT
       */
      multiStoryDetected:
        "Multiple @story annotations detected in the same comment block. Manually convert to separate @supports lines.",
    },
    schema: [],
  },

  /**
   * Rule entrypoint.
   *
   * This initial implementation focuses on **detection and messaging only**:
   * it surfaces recommendations when legacy `@story` + `@req` combinations are
   * present but does not yet perform automatic code modifications.
   *
   * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT
   */
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      /**
       * Program-level visitor that scans all comments for legacy
       * `@story` + `@req` usage and emits recommendation diagnostics.
       *
       * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT
       */
      Program() {
        const comments = sourceCode.getAllComments() || [];

        const blockComments = comments.filter(
          (comment: any) => comment.type === "Block",
        );
        blockComments.forEach((comment: any) => {
          processBlockComment(comment, context);
        });

        const lineComments = comments.filter(
          (comment: any) => comment.type === "Line",
        ) as LineComment[];

        processInlineComments(context, lineComments);
      },
    };
  },
};

export default preferImplementsAnnotationRule;
