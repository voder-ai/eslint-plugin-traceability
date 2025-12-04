import {
  getResolvedDefaults,
  resolveOptions,
  type ResolvedAnnotationOptions,
  getRuleSchema,
  getOptionErrors,
} from "./helpers/valid-annotation-options";
import {
  collapseAnnotationValue,
  TAG_NOT_FOUND_INDEX,
  getFixedStoryPath,
  buildStoryErrorMessage,
  buildReqErrorMessage,
} from "./helpers/valid-annotation-utils";
import {
  MIN_IMPLEMENTS_TOKENS,
  reportMissingImplementsReqIds,
  reportMissingImplementsValue,
  reportInvalidImplementsReqId,
  reportInvalidImplementsStoryPath,
  validateImplementsAnnotationHelper,
} from "./helpers/valid-implements-utils";
import {
  PendingAnnotation,
  normalizeCommentLine,
} from "./helpers/valid-annotation-format-internal";

/**
 * Report an invalid @story annotation without applying a fix.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
function reportInvalidStoryFormat(
  context: any,
  comment: any,
  collapsed: string,
  options: ResolvedAnnotationOptions,
): void {
  context.report({
    node: comment as any,
    messageId: "invalidStoryFormat",
    data: { details: buildStoryErrorMessage("invalid", collapsed, options) },
  });
}

/**
 * Compute the text replacement for an invalid @story annotation within a comment.
 *
 * This helper:
 *   - finds the @story tag in the raw comment text,
 *   - computes the character range of its value,
 *   - and returns an ESLint fix that replaces only that range.
 *
 * Returns null when the tag or value cannot be safely located.
 *
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-SAFE
 * @req REQ-AUTOFIX-PRESERVE
 */
function createStoryFix(
  context: any,
  comment: any,
  fixed: string,
): null | (() => any) {
  const sourceCode = context.getSourceCode();
  const commentText = sourceCode.getText(comment);
  const search = "@story";
  const tagIndex = commentText.indexOf(search);
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @req REQ-AUTOFIX-SAFE - Skip auto-fix when @story tag cannot be reliably located
  if (tagIndex === TAG_NOT_FOUND_INDEX) {
    return null;
  }

  const afterTagIndex = tagIndex + search.length;
  const rest = commentText.slice(afterTagIndex);
  const valueMatch = rest.match(/[^\S\r\n]*([^\r\n*]+)/);
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @req REQ-AUTOFIX-SAFE - Abort auto-fix when story value range cannot be safely determined
  if (!valueMatch || valueMatch.index === undefined) {
    return null;
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

  return () => (fixer: any) => fixer.replaceTextRange(fixRange, fixed);
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
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
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
  const fixFactory = createStoryFix(context, comment, fixed);
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @req REQ-AUTOFIX-SAFE - Fall back to reporting without fix when safe fix cannot be created
  if (!fixFactory) {
    reportInvalidStoryFormat(
      context,
      comment,
      collapsed,
      getResolvedDefaults(),
    );
    return;
  }

  context.report({
    node: comment as any,
    messageId: "invalidStoryFormat",
    data: {
      details: buildStoryErrorMessage(
        "invalid",
        collapsed,
        getResolvedDefaults(),
      ),
    },
    fix: fixFactory(),
  });
}

/**
 * Validate a @story annotation value and report detailed errors when needed.
 * Where safe and unambiguous, apply an automatic fix for missing suffixes.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-REGEX-VALIDATION - Validate configurable story regex patterns and fall back safely
 * @req REQ-BACKWARD-COMP - Preserve behavior when invalid regex config is supplied
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
function validateStoryAnnotation(
  context: any,
  comment: any,
  rawValue: string,
  options: ResolvedAnnotationOptions,
): void {
  const trimmed = rawValue.trim();
  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-PATH-FORMAT - Treat missing @story value as a specific validation error
  if (!trimmed) {
    context.report({
      node: comment as any,
      messageId: "invalidStoryFormat",
      data: { details: buildStoryErrorMessage("missing", null, options) },
    });
    return;
  }

  const collapsed = collapseAnnotationValue(trimmed);
  const pathPattern = options.storyPattern;

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-PATH-FORMAT - Accept @story value when it matches configured storyPattern
  if (pathPattern.test(collapsed)) {
    return;
  }

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-PATH-FORMAT - Reject @story values containing internal whitespace as invalid
  if (/\s/.test(trimmed)) {
    reportInvalidStoryFormat(context, comment, collapsed, options);
    return;
  }

  const fixed = getFixedStoryPath(collapsed);

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @req REQ-AUTOFIX-FORMAT - Apply suffix-only auto-fix when it yields a pattern-compliant path
  if (fixed && pathPattern.test(fixed)) {
    reportInvalidStoryFormatWithFix(context, comment, collapsed, fixed);
    return;
  }

  reportInvalidStoryFormat(context, comment, collapsed, options);
}

/**
 * Validate a @req annotation value and report detailed errors when needed.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-REGEX-VALIDATION - Validate configurable requirement regex patterns and fall back safely
 * @req REQ-BACKWARD-COMP - Preserve behavior when invalid regex config is supplied
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
function validateReqAnnotation(
  context: any,
  comment: any,
  rawValue: string,
  options: ResolvedAnnotationOptions,
): void {
  const trimmed = rawValue.trim();
  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-REQ-FORMAT - Treat missing @req value as a specific validation error
  if (!trimmed) {
    context.report({
      node: comment as any,
      messageId: "invalidReqFormat",
      data: { details: buildReqErrorMessage("missing", null, options) },
    });
    return;
  }

  const collapsed = collapseAnnotationValue(trimmed);
  const reqPattern = options.reqPattern;

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-REQ-FORMAT - Flag @req identifiers that do not match the configured pattern
  if (!reqPattern.test(collapsed)) {
    context.report({
      node: comment as any,
      messageId: "invalidReqFormat",
      data: { details: buildReqErrorMessage("invalid", collapsed, options) },
    });
  }
}

/**
 * Validate an @implements annotation value and report detailed errors when needed.
 *
 * Expected format:
 *   @implements <storyPath> <REQ-ID> [<REQ-ID> ...]
 *
 * Validation rules:
 *   - Value must include at least a story path and one requirement ID.
 *   - Story path must match the same storyPattern used for @story (no auto-fix).
 *   - Each subsequent token must match reqPattern and is validated individually.
 *
 * Story path issues are reported with "invalidImplementsFormat" and
 * requirement ID issues reuse the existing "invalidReqFormat" message.
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req
 * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
function validateImplementsAnnotation(
  context: any,
  comment: any,
  rawValue: string,
  options: ResolvedAnnotationOptions,
): void {
  const deps = {
    MIN_IMPLEMENTS_TOKENS,
    reportMissingImplementsReqIds,
    reportMissingImplementsValue,
    reportInvalidImplementsReqId,
    reportInvalidImplementsStoryPath,
  };

  validateImplementsAnnotationHelper(deps, context, comment, {
    rawValue,
    options,
  });
}

/**
 * Finalize and validate the currently pending annotation, if any.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
function finalizePendingAnnotation(
  context: any,
  comment: any,
  options: ResolvedAnnotationOptions,
  pending: PendingAnnotation | null,
): PendingAnnotation | null {
  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-MULTILINE-SUPPORT - Do nothing when there is no pending multi-line annotation to finalize
  if (!pending) {
    return null;
  }

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @req REQ-SYNTAX-VALIDATION - Dispatch to @story or @req validator based on pending annotation type
  // @req REQ-AUTOFIX-FORMAT - Route to story validator which may apply safe auto-fixes
  // @req REQ-MIXED-SUPPORT - Ensure @story and @req annotations are handled independently
  if (pending.type === "story") {
    validateStoryAnnotation(context, comment, pending.value, options);
  } else {
    validateReqAnnotation(context, comment, pending.value, options);
  }

  return null;
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
 * @req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req
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

  const isStory = /@story\b/.test(normalized);
  const isReq = /@req\b/.test(normalized);
  const isImplements = /@implements\b/.test(normalized);

  // Handle @implements as an immediate, single-line annotation
  // @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
  // @req REQ-IMPLEMENTS-PARSE - Immediately validate @implements without starting multi-line state
  if (isImplements) {
    const implementsValue = normalized.replace(/^@implements\b/, "").trim();
    validateImplementsAnnotation(context, comment, implementsValue, options);
    return pending;
  }

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
  // @req REQ-SYNTAX-VALIDATION - Start new pending annotation when a tag is found
  // @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
  // @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
  if (isStory || isReq) {
    finalizePendingAnnotation(context, comment, options, pending);
    const value = normalized.replace(/^@story\b|^@req\b/, "").trim();
    return {
      type: isStory ? "story" : "req",
      value,
      hasValue: value.trim().length > 0,
    };
  }

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
  // @req REQ-MULTILINE-SUPPORT - Extend value of existing pending annotation across lines
  // @req REQ-AUTOFIX-FORMAT - Maintain complete logical value for downstream validation and fixes
  // @req REQ-MIXED-SUPPORT - Leave non-annotation lines untouched when no pending state exists
  if (pending) {
    const continuation = normalized.trim();
    // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
    // @req REQ-MULTILINE-SUPPORT - Skip blank continuation lines without altering pending annotation
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

  return pending;
}

/**
 * Process a single comment node and validate any @story/@req/@implements annotations it contains.
 *
 * Supports @story and @req annotations whose values span multiple lines within the same
 * comment block, collapsing whitespace so that the logical value can be
 * validated against the configured patterns.
 *
 * @implements annotations are validated immediately per-line and are not
 * accumulated into pending multi-line state.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req
 * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
function processComment(
  context: any,
  comment: any,
  options: ResolvedAnnotationOptions,
): void {
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

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate format and syntax of @story, @req, and @implements annotations",
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
       * @req REQ-ERROR-SPECIFIC - Provide specific details about invalid @implements annotation format
       * @req REQ-ERROR-CONTEXT - Include human-readable details about the expected @implements annotation format
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
     * This rule's fixable support is limited to safe @story path suffix normalization per Story 008.0.
     * Fixes are limited strictly to adjusting the suffix portion of the @story path (e.g., adding
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
   * @req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req
   * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
   * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
   */
  create(context: any) {
    const sourceCode = context.getSourceCode();
    const options = resolveOptions(context.options || []);
    const optionErrors = getOptionErrors();

    return {
      /**
       * Program-level handler that inspects all comments for @story, @req, and @implements tags
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
       * @req REQ-IMPLEMENTS-PARSE - Parse @implements annotations without affecting @story/@req
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
