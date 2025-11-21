/**
 * Rule to validate @story and @req annotation format and syntax. When run with
 * ESLint's `--fix` option, this rule performs only safe @story path suffix
 * normalization (for example, adding `.md` or `.story.md`) and never changes
 * directories or infers new story names, in line with Story 008.0.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-FORMAT-SPECIFICATION - Define clear format rules for @story and @req annotations
 * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix behavior must be conservative and non-destructive
 */
interface PendingAnnotation {
  type: "story" | "req";
  value: string;
  hasValue: boolean;
}

const STORY_EXAMPLE_PATH = "docs/stories/005.0-DEV-EXAMPLE.story.md";

/**
 * Constant to represent the "tag not found" index when searching
 * for @story or @req within a comment.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-PRESERVE - Avoid risky text replacements when the annotation tag cannot be located
 */
const TAG_NOT_FOUND_INDEX = -1;

/**
 * Normalize a raw comment line to make annotation parsing more robust.
 *
 * This function trims whitespace, keeps any annotation tags that appear
 * later in the line, and supports common JSDoc styles such as leading "*".
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function normalizeCommentLine(rawLine: string): string {
  const trimmed = rawLine.trim();
  if (!trimmed) {
    return "";
  }

  const annotationMatch = trimmed.match(/@story\b|@req\b/);
  if (!annotationMatch || annotationMatch.index === undefined) {
    const withoutLeadingStar = trimmed.replace(/^\*\s?/, "");
    return withoutLeadingStar;
  }

  return trimmed.slice(annotationMatch.index);
}

/**
 * Collapse internal whitespace in an annotation value so that multi-line
 * annotations are treated as a single logical value.
 *
 * Example:
 *   "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md" across
 *   multiple lines will be collapsed before validation.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function collapseAnnotationValue(value: string): string {
  return value.replace(/\s+/g, "");
}

/**
 * Build a detailed error message for invalid @story annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function buildStoryErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
): string {
  if (kind === "missing") {
    return `Missing story path for @story annotation. Expected a path like "${STORY_EXAMPLE_PATH}".`;
  }

  return `Invalid story path "${value ?? ""}" for @story annotation. Expected a path like "${STORY_EXAMPLE_PATH}".`;
}

/**
 * Build a detailed error message for invalid @req annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function buildReqErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
): string {
  if (kind === "missing") {
    return 'Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".';
  }

  return `Invalid requirement ID "${value ?? ""}" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).`;
}

/**
 * Attempt a minimal, safe auto-fix for common @story path suffix issues.
 *
 * Only handles:
 *   - missing ".md"
 *   - missing ".story.md"
 * and skips any paths with traversal segments (e.g. "..").
 *
 * Returns the fixed path when safe, or null if no fix should be applied.
 *
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and never broaden the referenced path
 * @req REQ-AUTOFIX-PRESERVE - Preserve surrounding formatting when normalizing story path suffixes
 */
function getFixedStoryPath(original: string): string | null {
  if (original.includes("..")) {
    return null;
  }

  if (/\.story\.md$/.test(original)) {
    return null;
  }

  if (/\.story$/.test(original)) {
    return `${original}.md`;
  }

  if (/\.md$/.test(original)) {
    return original.replace(/\.md$/, ".story.md");
  }

  return `${original}.story.md`;
}

/**
 * Report an invalid @story annotation without applying a fix.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function reportInvalidStoryFormat(
  context: any,
  comment: any,
  collapsed: string,
): void {
  context.report({
    node: comment as any,
    messageId: "invalidStoryFormat",
    data: { details: buildStoryErrorMessage("invalid", collapsed) },
  });
}

/**
 * Report an invalid @story annotation and attempt a minimal, safe auto-fix
 * for common path suffix issues by locating and replacing the path text
 * within the original comment.
 *
 * This helper:
 *   - only adjusts the story path suffix when a safe, well-understood
 *     transformation is available, satisfying REQ-AUTOFIX-SAFE.
 *   - preserves all surrounding comment formatting, spacing, and text
 *     outside the path substring, satisfying REQ-AUTOFIX-PRESERVE.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and avoid changing semantics
 * @req REQ-AUTOFIX-PRESERVE - Auto-fix must preserve surrounding formatting and comments
 */
function reportInvalidStoryFormatWithFix(
  context: any,
  comment: any,
  collapsed: string,
  fixed: string,
): void {
  const sourceCode = context.getSourceCode();
  const commentText = sourceCode.getText(comment);
  const search = "@story";
  const tagIndex = commentText.indexOf(search);
  if (tagIndex === TAG_NOT_FOUND_INDEX) {
    reportInvalidStoryFormat(context, comment, collapsed);
    return;
  }

  const afterTagIndex = tagIndex + search.length;
  const rest = commentText.slice(afterTagIndex);
  const valueMatch = rest.match(/[^\S\r\n]*([^\r\n*]+)/);
  if (!valueMatch || valueMatch.index === undefined) {
    reportInvalidStoryFormat(context, comment, collapsed);
    return;
  }

  const valueStartInComment =
    afterTagIndex +
    valueMatch.index +
    (valueMatch[0].length - valueMatch[1].length);
  const valueEndInComment = valueStartInComment + valueMatch[1].length;

  const start = comment.range[0];
  const fixRange: [number, number] = [
    start + valueStartInComment,
    start + valueEndInComment,
  ];

  context.report({
    node: comment as any,
    messageId: "invalidStoryFormat",
    data: { details: buildStoryErrorMessage("invalid", collapsed) },
    fix(fixer: any) {
      return fixer.replaceTextRange(fixRange, fixed);
    },
  });
}

/**
 * Validate a @story annotation value and report detailed errors when needed.
 * Where safe and unambiguous, apply an automatic fix for missing suffixes.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function validateStoryAnnotation(
  context: any,
  comment: any,
  rawValue: string,
): void {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    context.report({
      node: comment as any,
      messageId: "invalidStoryFormat",
      data: { details: buildStoryErrorMessage("missing", null) },
    });
    return;
  }

  const collapsed = collapseAnnotationValue(trimmed);
  const pathPattern = /^docs\/stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/;

  if (pathPattern.test(collapsed)) {
    return;
  }

  if (/\s/.test(trimmed)) {
    reportInvalidStoryFormat(context, comment, collapsed);
    return;
  }

  const fixed = getFixedStoryPath(collapsed);

  if (fixed && pathPattern.test(fixed)) {
    reportInvalidStoryFormatWithFix(context, comment, collapsed, fixed);
    return;
  }

  reportInvalidStoryFormat(context, comment, collapsed);
}

/**
 * Validate a @req annotation value and report detailed errors when needed.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 */
function validateReqAnnotation(
  context: any,
  comment: any,
  rawValue: string,
): void {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    context.report({
      node: comment as any,
      messageId: "invalidReqFormat",
      data: { details: buildReqErrorMessage("missing", null) },
    });
    return;
  }

  const collapsed = collapseAnnotationValue(trimmed);
  const reqPattern = /^REQ-[A-Z0-9-]+$/;

  if (!reqPattern.test(collapsed)) {
    context.report({
      node: comment as any,
      messageId: "invalidReqFormat",
      data: { details: buildReqErrorMessage("invalid", collapsed) },
    });
  }
}

/**
 * Process a single comment node and validate any @story/@req annotations it contains.
 *
 * Supports annotations whose values span multiple lines within the same
 * comment block, collapsing whitespace so that the logical value can be
 * validated against the configured patterns.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function processComment(context: any, comment: any): void {
  const rawLines = (comment.value || "").split(/\r?\n/);
  let pending: PendingAnnotation | null = null;

  /**
   * Finalize and validate the currently pending annotation, if any.
   *
   * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
   * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
   * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
   * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
   */
  function finalizePending() {
    if (!pending) {
      return;
    }

    // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
    // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
    // @req REQ-SYNTAX-VALIDATION - Dispatch validation based on annotation type
    // @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
    if (pending.type === "story") {
      validateStoryAnnotation(context, comment, pending.value);
    } else {
      validateReqAnnotation(context, comment, pending.value);
    }

    pending = null;
  }

  rawLines.forEach((rawLine: string) => {
    const normalized = normalizeCommentLine(rawLine);
    if (!normalized) {
      return;
    }

    const isStory = /@story\b/.test(normalized);
    const isReq = /@req\b/.test(normalized);

    // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
    // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
    // @req REQ-SYNTAX-VALIDATION - Start new pending annotation when a tag is found
    // @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
    if (isStory || isReq) {
      finalizePending();
      const value = normalized.replace(/^@story\b|^@req\b/, "").trim();
      pending = {
        type: isStory ? "story" : "req",
        value,
        hasValue: value.trim().length > 0,
      };
      return;
    }

    // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
    // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
    // @req REQ-MULTILINE-SUPPORT - Treat subsequent lines as continuation for pending annotation
    // @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
    if (pending) {
      const continuation = normalized.trim();
      if (!continuation) {
        return;
      }
      pending.value = pending.value
        ? `${pending.value} ${continuation}`
        : continuation;
      pending.hasValue = pending.hasValue || continuation.length > 0;
    }
  });

  finalizePending();
}

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Validate format and syntax of @story and @req annotations",
      recommended: "error",
    },
    messages: {
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-SPECIFIC - Provide specific details about invalid @story annotation format
       * @req REQ-ERROR-CONTEXT - Include human-readable details about the expected @story annotation format
       * @req REQ-ERROR-CONSISTENCY - Use shared "Invalid annotation format: {{details}}." message pattern across rules
       */
      invalidStoryFormat: "Invalid annotation format: {{details}}.",
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-SPECIFIC - Provide specific details about invalid @req annotation format
       * @req REQ-ERROR-CONTEXT - Include human-readable details about the expected @req annotation format
       * @req REQ-ERROR-CONSISTENCY - Use shared "Invalid annotation format: {{details}}." message pattern across rules
       */
      invalidReqFormat: "Invalid annotation format: {{details}}.",
    },
    schema: [],
    /**
     * This rule's fixable support is limited to safe @story path suffix normalization per Story 008.0.
     * Fixes are limited strictly to adjusting the suffix portion of the @story path (e.g., adding
     * `.md` or `.story.md`), preserving all other comment text and whitespace exactly as written.
     *
     * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
     * @req REQ-AUTOFIX-SAFE
     * @req REQ-AUTOFIX-PRESERVE
     */
    fixable: "code",
  },
  /**
   * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
   * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
   * @req REQ-SYNTAX-VALIDATION - Ensure rule create function validates annotations syntax
   * @req REQ-FORMAT-SPECIFICATION - Implement formatting checks per specification
   * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
   */
  create(context: any) {
    const sourceCode = context.getSourceCode();
    return {
      /**
       * Program-level handler that inspects all comments for @story and @req tags
       *
       * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
       * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
       * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
       * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
       * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
       */
      Program() {
        const comments = sourceCode.getAllComments() || [];
        comments.forEach((comment: any) => {
          processComment(context, comment);
        });
      },
    };
  },
} as any;
