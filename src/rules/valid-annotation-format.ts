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

  const implementsValue = normalized.replace(/^@supports\b/, "").trim();
  validateImplementsAnnotation(context, comment, implementsValue, options);
  return pending;
}

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
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SYNTAX-VALIDATION - Start new pending annotation when a tag is found
 * @req REQ-MULTILINE-SUPPORT - Treat subsequent lines as continuation for pending annotation
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-IMPLEMENTS-PARSE - Parse @supports annotations without affecting @story/@req
 * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
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

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
  // @req REQ-MULTILINE-SUPPORT - Extend value of existing pending annotation across lines
  // @req REQ-AUTOFIX-FORMAT - Maintain complete logical value for downstream validation and fixes
  // @req REQ-MIXED-SUPPORT - Leave non-annotation lines untouched when no pending state exists
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
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-IMPLEMENTS-PARSE - Parse @supports annotations without affecting @story/@req
 * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
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
       * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
       * @req REQ-ERROR-SPECIFIC - Provide specific details about invalid @supports annotation format
       * @req REQ-ERROR-CONTEXT - Include human-readable details about the expected @supports annotation format
       * @req REQ-ERROR-CONSISTENCY - Use shared "Invalid annotation format: {{details}}." message pattern across rules
       * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
       */
      invalidImplementsFormat: "Invalid annotation format: {{details}}.",
      /**
       * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
       * @req REQ-REGEX-VALIDATION - Surface configuration errors for invalid regex patterns
       * @req REQ-BACKWARD-COMP - Preserve behavior by falling back to default patterns on error
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
     * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
     * @req REQ-AUTOFIX-SAFE
     * @req REQ-AUTOFIX-PRESERVE
     * @req REQ-REGEX-VALIDATION - Ensure regex configuration does not affect fix safety
     * @req REQ-BACKWARD-COMP - Maintain previous auto-fix behavior under invalid configs
     */
    fixable: "code",
  },
  /**
   * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
   * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
   * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
   * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
   * @req REQ-SYNTAX-VALIDATION - Ensure rule create function validates annotations syntax
   * @req REQ-FORMAT-SPECIFICATION - Implement formatting checks per specification
   * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
   * @req REQ-REGEX-VALIDATION - Derive validation regexes from shared options helper
   * @req REQ-BACKWARD-COMP - Fall back to default patterns and continue validation on config errors
   * @req REQ-IMPLEMENTS-PARSE - Parse @supports annotations without affecting @story/@req
   * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
   * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
   */
  create(context: any) {
    const sourceCode = context.getSourceCode();
    const options = resolveOptions(context.options || []);
    const optionErrors = getOptionErrors();

    return {
      /**
       * Program-level handler that inspects all comments for `@story`, `@req`, and `@supports` tags
       *
       * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
       * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
       * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
       * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
       * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
       * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
       * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
       * @req REQ-REGEX-VALIDATION - Surface regex configuration errors without blocking validation
       * @req REQ-BACKWARD-COMP - Continue validating comments using default patterns on error
       * @req REQ-IMPLEMENTS-PARSE - Parse @supports annotations without affecting @story/@req
       * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
       * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
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
