/**
 * Validators and helper functions for the valid-annotation-format rule.
 *
 * This module contains the core validation logic that was originally
 * embedded in src/rules/valid-annotation-format.ts. The logic is extracted
 * into this helper to keep the main rule implementation smaller and easier
 * to read while still preserving all existing behavior.
 *
 * The implementation in this module supports:
 * - validation of @story annotations
 * - validation of @req annotations
 * - validation of @implements/@supports-style annotations
 * - safe, minimal auto-fixes for certain invalid formats
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-FORMAT-SPECIFICATION
 * @req REQ-SYNTAX-VALIDATION
 * @req REQ-PATH-FORMAT
 * @req REQ-REQ-FORMAT
 * @req REQ-MULTILINE-SUPPORT
 * @req REQ-AUTOFIX-FORMAT
 * @req REQ-ERROR-SPECIFICITY
 * @req REQ-REGEX-VALIDATION
 * @req REQ-BACKWARD-COMP
 * @req REQ-SUPPORTS-PARSE
 * @req REQ-FORMAT-VALIDATION
 * @req REQ-MIXED-SUPPORT
 */

import type { ResolvedAnnotationOptions } from "./valid-annotation-options";
import {
  collapseAnnotationValue,
  TAG_NOT_FOUND_INDEX,
  getFixedStoryPath,
  buildStoryErrorMessage,
  buildReqErrorMessage,
} from "./valid-annotation-utils";
import {
  MIN_IMPLEMENTS_TOKENS,
  reportMissingImplementsReqIds,
  reportMissingImplementsValue,
  reportInvalidImplementsReqId,
  reportInvalidImplementsStoryPath,
  validateImplementsAnnotationHelper,
} from "./valid-implements-utils";
import type { PendingAnnotation } from "./valid-annotation-format-internal";
import { getResolvedDefaults } from "./valid-annotation-options";

/**
 * Report an invalid @story annotation without applying a fix.
 *
 * The invalid @story annotation is detected and reported but left unchanged.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
export function reportInvalidStoryFormat(
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
export function createStoryFix(
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
 * Reporting includes both the original invalid value and, where applicable,
 * a suggested corrected story path that only adjusts the suffix.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and avoid changing semantics
 * @req REQ-AUTOFIX-PRESERVE - Auto-fix must preserve surrounding formatting and comments
 */
export function reportInvalidStoryFormatWithFix(
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
 * Processing of @story values includes:
 *   - trimming whitespace,
 *   - collapsing multi-line text,
 *   - matching against the configured story regex,
 *   - and attempting a conservative suffix-only correction when possible.
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
export function validateStoryAnnotation(
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
  // @req REQ-PATH-FORMAT - Reject @story values containing internal whitespace that do not collapse into a valid story path
  if (/\s/.test(trimmed) && !pathPattern.test(collapsed)) {
    reportInvalidStoryFormat(context, comment, collapsed, options);
    return;
  }

  const fixed = getFixedStoryPath(collapsed);

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md
  // @req REQ-AUTOFIX-FORMAT - Apply suffix-only auto-fix when it yields a pattern-compliant path
  if (fixed && pathPattern.test(fixed)) {
    if (options.autoFix !== false) {
      reportInvalidStoryFormatWithFix(context, comment, collapsed, fixed);
      return;
    }

    reportInvalidStoryFormat(context, comment, collapsed, options);
    return;
  }

  reportInvalidStoryFormat(context, comment, collapsed, options);
}

/**
 * Validate a @req annotation value and report detailed errors when needed.
 *
 * This behavior covers:
 *   - detecting missing identifiers,
 *   - collapsing multi-line requirement identifiers,
 *   - and validating the final identifier against the configured regex.
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
export function validateReqAnnotation(
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
  // Allow mixed @req/@supports lines to pass without additional @req validation,
  // while still validating simple multi-line @req identifiers that collapse
  // to a single token.
  if (collapsed.includes("@supports")) {
    return;
  }

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
 * Validate an @supports annotation value and report detailed errors when needed.
 *
 * Expected format:
 *   @supports <storyPath> <REQ-ID> [<REQ-ID> ...]
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
 * @req REQ-SUPPORTS-PARSE - Parse @supports annotations without affecting @story/@req
 * @req REQ-FORMAT-VALIDATION - Validate @implements story path and requirement IDs
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
export function validateImplementsAnnotation(
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
 * Pending annotation state is produced by earlier parsing of multi-line
 * comments. This function dispatches that accumulated value to the
 * appropriate validator and then clears the pending state.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */
export function finalizePendingAnnotation(
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
