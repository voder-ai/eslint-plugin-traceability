/**
 * Comment detection utilities for require-story rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - File-level header for comment detection utilities
 */
import {
  linesBeforeHasStory,
  parentChainHasStory,
  fallbackTextBeforeHasStory,
} from "./require-story-io";
import {
  getFunctionInsideBodyCommentText as _getFunctionInsideBodyCommentText,
  supportsInsidePlacementForFunction as _supportsInsidePlacementForFunction,
} from "../../utils/function-annotation-helpers";
import {
  isNestedFunction,
  isEffectivelyAnonymousFunction,
} from "./require-story-node-utils";

/**
 * Check whether the JSDoc associated with node contains `@story`
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract JSDoc based detection into helper
 */
export function jsdocHasStory(sourceCode: any, node: any): boolean {
  if (typeof sourceCode?.getJSDocComment !== "function") {
    return false;
  }
  const jsdoc = sourceCode.getJSDocComment(node);
  return !!(
    jsdoc &&
    typeof jsdoc.value === "string" &&
    jsdoc.value.includes("@story")
  );
}

/**
 * Check whether comments returned by sourceCode.getCommentsBefore contain `@story`
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract comment-before detection into helper
 */
export function commentsBeforeHasStory(sourceCode: any, node: any): boolean {
  if (typeof sourceCode?.getCommentsBefore !== "function") {
    return false;
  }
  const commentsBefore = sourceCode.getCommentsBefore(node) || [];
  return (
    Array.isArray(commentsBefore) &&
    commentsBefore.some(
      (c: any) => typeof c.value === "string" && c.value.includes("@story"),
    )
  );
}

/**
 * Check whether leadingComments attached to the node contain `@story`
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract leadingComments detection into helper
 */
export function leadingCommentsHasStory(node: any): boolean {
  const leadingComments = (node && node.leadingComments) || [];
  return (
    Array.isArray(leadingComments) &&
    leadingComments.some(
      (c: any) => typeof c.value === "string" && c.value.includes("@story"),
    )
  );
}

/**
 * Check if `@story` annotation already present in JSDoc or preceding comments.
 * Consolidates a variety of heuristics through smaller helpers.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Detect existing story annotations in JSDoc or comments
 */
export function hasStoryAnnotation(sourceCode: any, node: any): boolean {
  try {
    // Direct, node-local checks always apply first.
    if (jsdocHasStory(sourceCode, node)) {
      return true;
    }
    if (commentsBeforeHasStory(sourceCode, node)) {
      return true;
    }
    if (leadingCommentsHasStory(node)) {
      return true;
    }
    if (!isNestedFunction(node) && linesBeforeHasStory(sourceCode, node)) {
      return true;
    }

    const canInherit =
      isNestedFunction(node) && isEffectivelyAnonymousFunction(node);

    // Only nodes that are allowed to inherit annotations (e.g., nested anonymous
    // callbacks) may treat parent-chain comments or broad fallback text as
    // satisfying the annotation requirement.
    if (canInherit && parentChainHasStory(sourceCode, node)) {
      return true;
    }
    if (canInherit && fallbackTextBeforeHasStory(sourceCode, node)) {
      return true;
    }

    if (canInherit) {
      return true;
    }
  } catch (error) {
    if (process.env.TRACEABILITY_DEBUG === "1") {
      console.error(
        "[traceability] hasStoryAnnotation failed for node",
        (error as Error)?.message ?? error,
      );
    }
  }

  return false;
}

/**
 * Placement-aware story detection helper used by core reporting.
 *
 * When annotationPlacement is "inside" and the node supports inside-brace
 * semantics, this helper only treats annotations found on the first
 * comment-only lines inside the function or method body as satisfying the
 * requirement. JSDoc and before-function comments are intentionally ignored so
 * that misplaced annotations are reported as violations under the inside
 * standard.
 *
 * For nodes that do not support inside placement (such as TS declarations,
 * signature-only nodes, or functions without block bodies), this helper
 * delegates to the existing hasStoryAnnotation heuristics so that they
 * continue to rely on before-function placement.
 *
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
export function hasStoryAnnotationWithPlacement(
  sourceCode: any,
  node: any,
  annotationPlacement: "before" | "inside",
): boolean {
  // Backward-compatible default: use existing heuristics when placement is
  // "before" or when the function does not support inside-brace semantics.
  if (
    annotationPlacement !== "inside" ||
    !_supportsInsidePlacementForFunction(node)
  ) {
    return hasStoryAnnotation(sourceCode, node);
  }

  try {
    const insideText = _getFunctionInsideBodyCommentText(sourceCode, node);
    if (
      typeof insideText === "string" &&
      (insideText.includes("@story") || insideText.includes("@supports"))
    ) {
      return true;
    }
  } catch (error) {
    if (process.env.TRACEABILITY_DEBUG === "1") {
      // Debug logging only when explicitly enabled for troubleshooting helper failures.
      console.error(
        "[traceability] hasStoryAnnotationWithPlacement failed for node",
        (error as Error)?.message ?? error,
      );
    }
  }

  // In inside-placement mode for block-bodied functions and methods we
  // intentionally do not fall back to before-function heuristics; callers
  // should treat this as a missing annotation so that misplaced comments are
  // reported as violations.
  return false;
}
