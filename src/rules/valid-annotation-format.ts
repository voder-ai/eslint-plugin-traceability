/* eslint-disable traceability/require-branch-annotation */

import {
  resolveOptions,
  type ResolvedAnnotationOptions,
  getRuleSchema,
  getOptionErrors,
} from "./helpers/valid-annotation-options";
import {
  PendingAnnotation,
  normalizeCommentLine,
  isNonTraceabilityJSDocTagLine,
} from "./helpers/valid-annotation-format-internal";
import {
  validateImplementsAnnotation,
  finalizePendingAnnotation,
} from "./helpers/valid-annotation-format-validators";

/**
 * Handle a single normalized comment line that starts with `@supports`.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-SYNTAX-VALIDATION REQ-FORMAT-SPECIFICATION
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 */
function handleImplementsLine(
  normalized: string,
  pending: PendingAnnotation | null,
  deps: {
    context: any;
    comment: any;
    options: ResolvedAnnotationOptions;
  },
): PendingAnnotation | null {
  const { context, comment, options } = deps;
  // Only match `@supports` at the START of the normalized line to avoid
  // false matches when this keyword appears in prose
  const isImplements = /^@supports\b/.test(normalized);
  if (!isImplements) {
    return pending;
  }

  // Finalize any pending `@story`/`@req` annotation before processing `@supports`
  finalizePendingAnnotation(context, comment, options, pending);

  const implementsValue = normalized.replace(/^@supports\b/, "").trim();
  validateImplementsAnnotation(context, comment, implementsValue, options);
  return null; // Clear pending state since `@supports` is standalone
}

/**
 * Handle a single normalized comment line that starts with `@story` or `@req`.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-SYNTAX-VALIDATION REQ-MULTILINE-SUPPORT REQ-FLEXIBLE-PARSING
 */
function handleStoryOrReqLine(
  normalized: string,
  pending: PendingAnnotation | null,
  deps: {
    context: any;
    comment: any;
    options: ResolvedAnnotationOptions;
  },
): PendingAnnotation | null {
  const { context, comment, options } = deps;
  // Only match `@story`/`@req` at the START of the normalized line to avoid
  // false matches when these keywords appear in prose (e.g., "@returns ... `@story` annotations")
  const isStory = /^@story\b/.test(normalized);
  const isReq = /^@req\b/.test(normalized);

  if (!isStory && !isReq) {
    return pending;
  }

  finalizePendingAnnotation(context, comment, options, pending);
  const rawValue = normalized.replace(/^@story\b|^@req\b/, "");
  const trimmedValue = rawValue.trim();

  return {
    type: isStory ? "story" : "req",
    value: trimmedValue,
    hasValue: trimmedValue.length > 0,
  };
}

/**
 * Extend a pending multi-line `@story`/`@req` annotation value.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT REQ-FLEXIBLE-PARSING
 * @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-CONTINUATION-LOGIC
 */
function extendPendingAnnotation(
  normalized: string,
  pending: PendingAnnotation | null,
): PendingAnnotation | null {
  if (!pending) {
    return pending;
  }

  const continuation = normalized.trim();
  if (!continuation) {
    return pending;
  }

  const updatedValue = pending.value
    ? `${pending.value} ${continuation}`
    : continuation;

  return {
    ...pending,
    value: updatedValue,
    hasValue: pending.hasValue || continuation.length > 0,
  };
}

/**
 * Process a single normalized comment line and update the pending annotation state.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-SYNTAX-VALIDATION REQ-MULTILINE-SUPPORT
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 */
function processCommentLine({
  normalized,
  pending,
  context,
  comment,
  options,
}: {
  normalized: string;
  pending: PendingAnnotation | null;
  context: any;
  comment: any;
  options: ResolvedAnnotationOptions;
}): PendingAnnotation | null {
  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-FLEXIBLE-PARSING - Ignore empty normalized lines without affecting pending state
  if (!normalized) {
    return pending;
  }

  const afterImplements = handleImplementsLine(normalized, pending, {
    context,
    comment,
    options,
  });
  if (afterImplements !== pending) {
    return afterImplements;
  }

  const afterStoryOrReq = handleStoryOrReqLine(normalized, pending, {
    context,
    comment,
    options,
  });
  if (afterStoryOrReq !== pending) {
    return afterStoryOrReq;
  }

  // Implement JSDoc tag coexistence behavior: terminate `@story`/`@req` values when a new non-traceability JSDoc tag line (e.g., @param, @returns) is encountered.
  // @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-ANNOTATION-TERMINATION REQ-CONTINUATION-LOGIC
  if (isNonTraceabilityJSDocTagLine(normalized)) {
    finalizePendingAnnotation(context, comment, options, pending);
    return null;
  }

  // @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
  // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-MIXED-SUPPORT
  return extendPendingAnnotation(normalized, pending);
}

/**
 * Process a single comment node and validate any `@story`/`@req`/`@supports` annotations it contains.
 *
 * Supports `@story` and `@req` annotations whose values span multiple lines within the same
 * comment block, collapsing whitespace so that the logical value can be
 * validated against the configured patterns.
 *
 * `@supports` annotations are validated immediately per-line and are not
 * accumulated into pending multi-line state.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT REQ-FLEXIBLE-PARSING
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 */
function processCommentLines({
  context,
  comment,
  options,
}: {
  context: any;
  comment: any;
  options: ResolvedAnnotationOptions;
}): void {
  const rawLines = (comment.value || "").split(/\r?\n/);
  let pending: PendingAnnotation | null = null;

  rawLines.forEach((rawLine: string) => {
    const normalized = normalizeCommentLine(rawLine);
    pending = processCommentLine({
      normalized,
      pending,
      context,
      comment,
      options,
    });
  });

  finalizePendingAnnotation(context, comment, options, pending);
}

/**
 * Process a single comment node and validate any `@story`/`@req`/`@supports` annotations it contains.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-SYNTAX-VALIDATION REQ-FORMAT-SPECIFICATION
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
 */
function processComment(
  context: any,
  comment: any,
  options: ResolvedAnnotationOptions,
): void {
  processCommentLines({ context, comment, options });
}

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate format and syntax of @story, @req, and @supports annotations",
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
      /**
       * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
       * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-FORMAT-VALIDATION
       */
      invalidImplementsFormat: "Invalid annotation format: {{details}}.",
      /**
       * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
       * @req REQ-REGEX-VALIDATION - Surface configuration errors for invalid regex patterns
       * @req REQ-BACKWARD-COMPAT - Preserve behavior by falling back to default patterns on error
       */
      invalidRuleConfiguration:
        "Invalid configuration for valid-annotation-format: {{details}}",
    },
    schema: getRuleSchema(),
    /**
     * This rule's fixable support is limited to safe `@story` path suffix normalization per Story 008.0.
     * Fixes are limited strictly to adjusting the suffix portion of the `@story` path (e.g., adding
     * `.md` or `.story.md`), preserving all other comment text and whitespace exactly as written.
     *
     * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE
     * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION REQ-BACKWARD-COMPAT
     */
    fixable: "code",
  },
  /**
   * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-SYNTAX-VALIDATION REQ-FORMAT-SPECIFICATION
   * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
   * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION REQ-BACKWARD-COMPAT
   * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
   */
  create(context: any) {
    const sourceCode = context.getSourceCode();
    const options = resolveOptions(context.options || []);
    const optionErrors = getOptionErrors();

    return {
      /**
       * Program-level handler that inspects all comments for `@story`, `@req`, and `@supports` tags
       *
       * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-PATH-FORMAT REQ-REQ-FORMAT
       * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
       * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-REGEX-VALIDATION REQ-BACKWARD-COMPAT
       * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-SUPPORTS-PARSE REQ-FORMAT-VALIDATION REQ-MIXED-SUPPORT
       */
      Program(node: any) {
        // @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
        // @req REQ-REGEX-VALIDATION - Report any configuration errors discovered while resolving options
        if (optionErrors && optionErrors.length > 0) {
          optionErrors.forEach((details: string) => {
            context.report({
              node,
              messageId: "invalidRuleConfiguration",
              data: { details },
            });
          });
        }

        const comments = sourceCode.getAllComments() || [];
        comments.forEach((comment: any) => {
          processComment(context, comment, options);
        });
      },
    };
  },
} as any;
