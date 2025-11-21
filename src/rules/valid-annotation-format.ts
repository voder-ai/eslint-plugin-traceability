/**
 * Rule to validate @story and @req annotation format and syntax
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION - Define clear format rules for @story and @req annotations
 * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 */
interface PendingAnnotation {
  type: "story" | "req";
  value: string;
  hasValue: boolean;
}

const STORY_EXAMPLE_PATH = "docs/stories/005.0-DEV-EXAMPLE.story.md";

/**
 * Normalize a raw comment line to make annotation parsing more robust.
 *
 * This function trims whitespace, keeps any annotation tags that appear
 * later in the line, and supports common JSDoc styles such as leading "*".
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
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
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 */
function collapseAnnotationValue(value: string): string {
  return value.replace(/\s+/g, "");
}

/**
 * Build a detailed error message for invalid @story annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
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
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
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
 * Validate a @story annotation value and report detailed errors when needed.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
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

  if (!pathPattern.test(collapsed)) {
    context.report({
      node: comment as any,
      messageId: "invalidStoryFormat",
      data: { details: buildStoryErrorMessage("invalid", collapsed) },
    });
  }
}

/**
 * Validate a @req annotation value and report detailed errors when needed.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
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
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 */
function processComment(context: any, comment: any): void {
  const rawLines = (comment.value || "").split(/\r?\n/);
  let pending: PendingAnnotation | null = null;

  /**
   * Finalize and validate the currently pending annotation, if any.
   *
   * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
   * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
   */
  function finalizePending() {
    if (!pending) {
      return;
    }

    // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
    // @req REQ-SYNTAX-VALIDATION - Dispatch validation based on annotation type
    if (pending.type === "story") {
      validateStoryAnnotation(context, comment, pending.value);
    } else {
      validateReqAnnotation(context, comment, pending.value);
    }

    pending = null;
  }

  rawLines.forEach((rawLine) => {
    const normalized = normalizeCommentLine(rawLine);
    if (!normalized) {
      return;
    }

    const isStory = /@story\b/.test(normalized);
    const isReq = /@req\b/.test(normalized);

    // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
    // @req REQ-SYNTAX-VALIDATION - Start new pending annotation when a tag is found
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
    // @req REQ-MULTILINE-SUPPORT - Treat subsequent lines as continuation for pending annotation
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
      invalidStoryFormat: "{{details}}",
      invalidReqFormat: "{{details}}",
    },
    schema: [],
  },
  /**
   * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
   * @req REQ-SYNTAX-VALIDATION - Ensure rule create function validates annotations syntax
   * @req REQ-FORMAT-SPECIFICATION - Implement formatting checks per specification
   */
  create(context: any) {
    const sourceCode = context.getSourceCode();
    return {
      /**
       * Program-level handler that inspects all comments for @story and @req tags
       *
       * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
       * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
       * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
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
