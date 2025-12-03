import type { Rule } from "eslint";
import { normalizeCommentLine } from "./helpers/valid-annotation-format-internal";

// Maximum number of distinct @story paths allowed before treating as "multi-story".
// @req REQ-MULTI-STORY-DETECT - Centralized threshold constant for detecting multi-story patterns
const MULTI_STORY_THRESHOLD = 1;

// Minimum number of tokens required for a valid @story annotation line.
// @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
// @req REQ-MULTI-STORY-DETECT
const MIN_STORY_TOKENS = 2;

interface CommentAnalysis {
  hasStory: boolean;
  hasReq: boolean;
  hasImplements: boolean;
  storyPaths: Set<string>;
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

    if (/^@implements\b/.test(normalized)) {
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
        reason:
          "comment mixes @story/@req with existing @implements annotations",
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

  context.report({
    node: comment as any,
    messageId: "preferImplements",
  });
}

/**
 * ESLint rule: prefer-implements-annotation
 *
 * Recommend migrating from legacy `@story` + `@req` annotations to the
 * newer `@implements` format. This rule is **disabled by default** and
 * is intended as an optional, opt-in migration aid.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
 * @req REQ-OPTIONAL-WARNING - Emit configurable recommendation diagnostics for legacy @story/@req usage
 * @req REQ-MULTI-STORY-DETECT - Detect multi-story patterns that cannot be auto-fixed
 * @req REQ-BACKWARD-COMP-VALIDATION - Keep legacy @story/@req annotations valid when the rule is disabled
 */
const preferImplementsAnnotationRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Recommend using @implements instead of legacy @story + @req annotations (optional migration rule)",
      recommended: false,
    },
    // Auto-fix support will be wired in a later iteration; the rule starts as
    // a recommendation-only warning with no code modifications.
    fixable: "code",
    messages: {
      /**
       * Recommend migrating simple, single-story @story + @req blocks to a
       * single @implements line. Auto-fix is provided where safe in a
       * follow-up iteration.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
       * @req REQ-OPTIONAL-WARNING
       */
      preferImplements:
        "Consider using @implements instead of @story + @req for clearer traceability. Run ESLint with --fix to auto-convert.",
      /**
       * Report situations where the rule detects a legacy annotation pattern
       * but cannot safely provide an automatic fix. The `reason` field gives
       * a short, human-readable explanation to guide manual migration.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
       * @req REQ-MULTI-STORY-DETECT
       */
      cannotAutoFix:
        "Cannot auto-fix: {{reason}}. Manual migration to @implements required.",
      /**
       * Specialized message for the most common non-fixable case where more
       * than one @story annotation appears in the same block, indicating a
       * likely multi-story integration that must be converted manually.
       *
       * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
       * @req REQ-MULTI-STORY-DETECT
       */
      multiStoryDetected:
        "Multiple @story annotations detected in the same comment block. Manually convert to separate @implements lines.",
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
   * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
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
       * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
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
