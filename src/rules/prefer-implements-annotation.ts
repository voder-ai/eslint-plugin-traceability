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
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-OPTIONAL-WARNING - Emit configurable recommendation diagnostics for legacy @story/@req usage in favor of @supports
 * @req REQ-MULTI-STORY-DETECT - Detect multi-story patterns that cannot be auto-fixed
 * @req REQ-SINGLE-STORY-FIX - Restrict auto-fix to single-story, single-path cases
 * @req REQ-PRESERVE-FORMAT - Preserve original JSDoc indentation and prefix formatting
 * @req REQ-VALID-OUTPUT - Avoid emitting auto-fixes for complex or ambiguous patterns
 * @req REQ-BACKWARD-COMP-VALIDATION - Keep legacy @story/@req annotations valid when the rule is disabled
 * @req REQ-AUTO-FIX - Provide safe, opt-in auto-fix for simple legacy patterns
 */
import type { Rule } from "eslint";
import { normalizeCommentLine } from "./helpers/valid-annotation-format-internal";

// Maximum number of distinct @story paths allowed before treating as "multi-story".
// @req REQ-MULTI-STORY-DETECT - Centralized threshold constant for detecting multi-story patterns
const MULTI_STORY_THRESHOLD = 1;

// Minimum number of tokens required for a valid @story annotation line.
// @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
// @req REQ-MULTI-STORY-DETECT
const MIN_STORY_TOKENS = 2;

// Minimum number of tokens required for a valid @req annotation line, aligned with story tokens.
const MIN_REQ_TOKENS = MIN_STORY_TOKENS;

// Length of the opening "/*" portion of a block comment prefix.
const COMMENT_PREFIX_LENGTH = 2;

interface CommentAnalysis {
  hasStory: boolean;
  hasReq: boolean;
  hasImplements: boolean;
  storyPaths: Set<string>;
}

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
      // Mixed @supports usage should have been filtered out earlier
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
        // Complex @req form; bail out entirely.
        storyPath = null;
      }
    }
  });

  return { storyLineIndices, reqLineIndices, reqIds, storyPath };
}

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

  // Determine the leading prefix (indentation and `*`) from the original @story line
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
 * - There is exactly one distinct `@story` path.
 * - Exactly one `@story` line is present.
 * - At least one `@req` line is present.
 * - Each `@req` line has the simple form `@req <REQ-ID>` (no extra tokens).
 *
 * When applicable, the fix:
 * - Removes the original `@story` and `@req` lines.
 * - Inserts a single `@supports` line in their place, preserving the
 *   original leading comment prefix (indentation and `*` markers).
 *
 * More complex patterns remain diagnostics-only with no fix to avoid
 * producing invalid or ambiguous output.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-AUTO-FIX - Provide safe, opt-in auto-fix for simple legacy patterns
 * @req REQ-SINGLE-STORY-FIX - Restrict auto-fix to single-story, single-path cases
 * @req REQ-PRESERVE-FORMAT - Preserve original JSDoc indentation and prefix formatting
 * @req REQ-VALID-OUTPUT - Avoid emitting auto-fixes for complex or ambiguous patterns
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

function hasMultipleStories(storyPaths: Set<string>): boolean {
  // @req REQ-MULTI-STORY-DETECT - Use named threshold constant instead of a magic number
  return storyPaths.size > MULTI_STORY_THRESHOLD;
}

function processComment(comment: any, context: Rule.RuleContext): void {
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

  const fix = buildImplementsAutoFix(context, comment, storyPaths);

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
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-OPTIONAL-WARNING - Emit configurable recommendation diagnostics for legacy @story/@req usage
 * @req REQ-MULTI-STORY-DETECT - Detect multi-story patterns that cannot be auto-fixed
 * @req REQ-BACKWARD-COMP-VALIDATION - Keep legacy @story/@req annotations valid when the rule is disabled
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
       * Recommend migrating simple, single-story @story + @req blocks to a
       * single @supports line. Auto-fix is provided where safe in a
       * follow-up iteration.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
       * @req REQ-OPTIONAL-WARNING
       */
      preferImplements:
        "Consider using @supports instead of @story + @req for clearer traceability. Run ESLint with --fix to auto-convert.",
      /**
       * Report situations where the rule detects a legacy annotation pattern
       * but cannot safely provide an automatic fix. The `reason` field gives
       * a short, human-readable explanation to guide manual migration.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
       * @req REQ-MULTI-STORY-DETECT
       */
      cannotAutoFix:
        "Cannot auto-fix: {{reason}}. Manual migration to @supports required.",
      /**
       * Specialized message for the most common non-fixable case where more
       * than one @story annotation appears in the same block, indicating a
       * likely multi-story integration that must be converted manually.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
       * @req REQ-MULTI-STORY-DETECT
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
   * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
   * @req REQ-OPTIONAL-WARNING
   * @req REQ-MULTI-STORY-DETECT
   */
  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      /**
       * Program-level visitor that scans all comments for legacy
       * `@story` + `@req` usage and emits recommendation diagnostics.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
       * @req REQ-OPTIONAL-WARNING - Emit recommendations when legacy annotations are detected
       * @req REQ-MULTI-STORY-DETECT - Detect multi-story and mixed annotation patterns
       */
      Program() {
        const comments = sourceCode.getAllComments() || [];

        comments
          .filter((comment: any) => comment.type === "Block")
          .forEach((comment: any) => {
            processComment(comment, context);
          });
      },
    };
  },
};

export default preferImplementsAnnotationRule;
