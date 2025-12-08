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
 * Collect line indices and metadata for @story and @req annotations within a
 * single block comment. This helper isolates the parsing logic used by the
 * auto-fix path so that complex or ambiguous patterns can be detected and
 * safely rejected.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-AUTO-FIX REQ-SINGLE-STORY-FIX REQ-VALID-OUTPUT
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

/**
 * Apply the @supports replacement for simple, single-story legacy blocks,
 * constructing a fixed comment body that preserves existing indentation and
 * prefix formatting while removing the original @story/@req lines.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-AUTO-FIX REQ-SINGLE-STORY-FIX REQ-PRESERVE-FORMAT REQ-VALID-OUTPUT
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
 * This rule requires that there is exactly one distinct `@story` path.
 * It also requires that exactly one `@story` line is present.
 * It requires that at least one `@req` line is present.
 * It also requires that each `@req` line has the simple form `@req <REQ-ID>` (no extra tokens).
 *
 * When applicable, the fix:
 * It removes the original `@story` and `@req` lines.
 * It then inserts a single `@supports` line in their place, preserving the
 * original leading comment prefix (indentation and `*` markers).
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

/**
 * Analyze a block comment to detect legacy @story/@req usage, existing
 * @supports lines, and the presence of multiple distinct @story paths.
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
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function hasMultipleStories(storyPaths: Set<string>): boolean {
  // @req REQ-MULTI-STORY-DETECT - Use named threshold constant instead of a magic number
  return storyPaths.size > MULTI_STORY_THRESHOLD;
}

/**
 * End-to-end processing for a single block comment: classify its
 * traceability annotations, decide whether to report recommendations only
 * or emit an auto-fix, and surface the appropriate message ID.
 *
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-OPTIONAL-WARNING REQ-MULTI-STORY-DETECT REQ-AUTO-FIX REQ-VALID-OUTPUT
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

  const fix = buildImplementsAutoFix(context, comment, storyPaths);

  context.report({
    node: comment as any,
    messageId: "preferImplements",
    fix: fix ?? undefined,
  });
}

/**
 * Helpers for processing inline `//` comments that contain legacy
 * @story + @req patterns.
 */

type LineComment = { type: "Line" } & any;

/**
 * Extract the leading whitespace and `//` prefix from a line comment's full
 * source text so that new inline annotations can be inserted with matching
 * indentation and formatting.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function getLinePrefixFromText(fullText: string): string {
  const match = fullText.match(/^(\s*\/\/\s*)/);
  return match ? match[1] : "";
}

/**
 * Attempt to construct an inline auto-fix that replaces a contiguous
 * sequence of `@story` and `@req` line comments with a single `@supports`
 * annotation while preserving the original comment prefix.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function tryBuildInlineAutoFix(
  context: Rule.RuleContext,
  comments: LineComment[],
  storyIndex: number,
  reqIndices: number[],
): Rule.ReportFixer | null {
  const sourceCode = context.getSourceCode();

  const storyComment = comments[storyIndex];
  const storyNormalized = normalizeCommentLine(storyComment.value || "");
  if (!storyNormalized || !/^@story\b/.test(storyNormalized)) {
    return null;
  }

  const storyParts = storyNormalized.split(/\s+/);
  if (storyParts.length !== MIN_STORY_TOKENS) {
    return null;
  }
  const storyPath = storyParts[1];

  const reqIds: string[] = [];
  for (const idx of reqIndices) {
    const reqComment = comments[idx];
    const reqNormalized = normalizeCommentLine(reqComment.value || "");
    if (!reqNormalized || !/^@req\b/.test(reqNormalized)) {
      return null;
    }
    const reqParts = reqNormalized.split(/\s+/);
    if (reqParts.length !== MIN_REQ_TOKENS) {
      return null;
    }
    reqIds.push(reqParts[1]);
  }

  if (!reqIds.length) {
    return null;
  }

  const fullText = sourceCode.text.slice(
    storyComment.range[0],
    storyComment.range[1],
  );
  const linePrefix = getLinePrefixFromText(fullText);

  const implAnnotation = `@supports ${storyPath} ${reqIds.join(" ")}`;
  const implLine = `${linePrefix}${implAnnotation}`;

  const start = storyComment.range[0];
  const end = comments[reqIndices[reqIndices.length - 1]].range[1];

  return (fixer) => fixer.replaceTextRange([start, end], implLine);
}

/**
 * Coordinate detection and optional migration of a single inline `@story`
 * comment and its following `@req` comments, reporting diagnostics and
 * scheduling auto-fixes where safe.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function handleInlineStorySequence(
  context: Rule.RuleContext,
  group: LineComment[],
  startIndex: number,
): number {
  const n = group.length;
  const current = group[startIndex];
  const normalized = normalizeCommentLine(current.value || "");

  if (!normalized || !/^@story\b/.test(normalized)) {
    return startIndex + 1;
  }

  if (/^@supports\b/.test(normalized)) {
    return startIndex + 1;
  }

  const storyIndex = startIndex;
  const reqIndices: number[] = [];
  let j = startIndex + 1;

  while (j < n) {
    const next = group[j];
    const nextNormalized = normalizeCommentLine(next.value || "");
    if (!nextNormalized || /^@supports\b/.test(nextNormalized)) {
      break;
    }
    if (/^@req\b/.test(nextNormalized)) {
      reqIndices.push(j);
      j += 1;
      continue;
    }
    break;
  }

  if (reqIndices.length === 0) {
    context.report({
      node: current as any,
      messageId: "preferImplements",
    });
    return startIndex + 1;
  }

  const fix = tryBuildInlineAutoFix(context, group, storyIndex, reqIndices);

  if (fix) {
    context.report({
      node: current as any,
      messageId: "preferImplements",
      fix,
    });
  } else {
    context.report({
      node: current as any,
      messageId: "preferImplements",
    });
  }

  return reqIndices[reqIndices.length - 1] + 1;
}

/**
 * Process a contiguous group of inline line comments, identifying legacy
 * `@story`/`@req` sequences and scheduling the corresponding diagnostics
 * and potential auto-fixes for migration to `@supports`.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function processInlineGroup(
  context: Rule.RuleContext,
  group: LineComment[],
): void {
  if (group.length === 0) return;

  const n = group.length;
  let i = 0;

  while (i < n) {
    const current = group[i];
    const normalized = normalizeCommentLine(current.value || "");
    if (!normalized || !/^@story\b/.test(normalized)) {
      i += 1;
      continue;
    }

    i = handleInlineStorySequence(context, group, i);
  }
}

/**
 * Scan sequences of Line comments for inline legacy @story/@req patterns and
 * report diagnostics and optional auto-fixes.
 */
function processInlineComments(
  context: Rule.RuleContext,
  lineComments: LineComment[],
): void {
  if (!lineComments.length) return;

  // Group by contiguous line numbers
  let group: LineComment[] = [lineComments[0]];

  const flushGroup = () => {
    processInlineGroup(context, group);
    group = [];
  };

  for (let idx = 1; idx < lineComments.length; idx++) {
    const prev = lineComments[idx - 1];
    const curr = lineComments[idx];
    if (
      curr.loc.start.line === prev.loc.start.line + 1 &&
      curr.loc.start.column === prev.loc.start.column
    ) {
      group.push(curr);
    } else {
      flushGroup();
      group.push(curr);
    }
  }
  flushGroup();
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
