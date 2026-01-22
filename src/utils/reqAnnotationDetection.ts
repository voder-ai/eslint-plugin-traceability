/**
 * Shared `@req` detection helpers used by annotation-checker utilities.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
import {
  FALLBACK_WINDOW,
  LOOKBACK_LINES,
} from "../rules/helpers/require-story-io";

/**
 * Predicate helper to check whether a comment contains a requirement annotation.
 * Treats both `@req` and `@supports` annotations as satisfying requirement presence checks.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function commentContainsReq(c: any): boolean {
  return (
    c &&
    typeof c.value === "string" &&
    (c.value.includes("@req") || c.value.includes("@supports"))
  );
}

/**
 * Line-based helper adapted from linesBeforeHasStory to detect requirement annotations.
 * Lines containing either `@req` or `@supports` are treated as annotated.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function linesBeforeHasReq(sourceCode: any, node: any): boolean {
  const lines = sourceCode && sourceCode.lines;
  const startLine =
    node && node.loc && typeof node.loc.start?.line === "number"
      ? node.loc.start.line
      : null;

  // Guard against missing or malformed source/loc information before scanning.
  // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
  if (!Array.isArray(lines) || typeof startLine !== "number") {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    return false;
  }

  const from = Math.max(0, startLine - 1 - LOOKBACK_LINES);
  const to = Math.max(0, startLine - 1);

  // Scan each physical line in the configured lookback window for `@req` or `@supports` markers.
  // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
  // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
  for (let i = from; i < to; i++) {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    const text = lines[i];
    // When a line contains `@req` or `@supports` we treat the function as already annotated.
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    if (
      typeof text === "string" &&
      (text.includes("@req") || text.includes("@supports"))
    ) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
      // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
      return true;
    }
  }
  return false;
}

/**
 * Parent-chain helper adapted from parentChainHasStory to detect requirement annotations.
 * Accepts both `@req` and `@supports` in parent-chain comments as satisfying requirement presence.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function parentChainHasReq(sourceCode: any, node: any): boolean {
  let p = node && node.parent;

  // Walk up the parent chain and inspect comments attached to each ancestor.
  // Accept both `@req` and `@supports` markers when local comments are absent.
  // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
  // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
  while (p) {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    const pComments =
      typeof sourceCode?.getCommentsBefore === "function"
        ? sourceCode.getCommentsBefore(p) || []
        : [];

    // Look for `@req` or `@supports` in comments immediately preceding each parent node.
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    if (Array.isArray(pComments) && pComments.some(commentContainsReq)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
      // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
      return true;
    }

    const pLeading = p.leadingComments || [];

    // Also inspect leadingComments attached directly to the parent node, accepting `@req` or `@supports`.
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    if (Array.isArray(pLeading) && pLeading.some(commentContainsReq)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
      // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
      return true;
    }

    p = p.parent;
  }
  return false;
}

/**
 * Fallback text window helper adapted from fallbackTextBeforeHasStory to detect requirement annotations.
 * Treats both `@req` and `@supports` in the fallback text window as requirement presence.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function fallbackTextBeforeHasReq(sourceCode: any, node: any): boolean {
  // Guard against unsupported sourceCode or nodes without a usable range.
  // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
  if (
    typeof sourceCode?.getText !== "function" ||
    !Array.isArray((node && node.range) || [])
  ) {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    return false;
  }
  const range = node.range;

  // Guard when the node range cannot provide a numeric start index.
  // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
  if (!Array.isArray(range) || typeof range[0] !== "number") {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    return false;
  }
  try {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    const start = Math.max(0, range[0] - FALLBACK_WINDOW);
    const textBefore = sourceCode.getText().slice(start, range[0]);

    // Detect `@req` or `@supports` in the bounded text window immediately preceding the node.
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    if (
      typeof textBefore === "string" &&
      (textBefore.includes("@req") || textBefore.includes("@supports"))
    ) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
      // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
      return true;
    }
  } catch {
    // Swallow detection errors to avoid breaking lint runs due to malformed source.
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    /* noop */
  }
  return false;
}

/**
 * Helper to combine advanced, location-based heuristics for requirement detection.
 * Uses preceding lines, parent-chain comments, and fallback text windows to find `@req`/`@supports`.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function hasReqInAdvancedHeuristics(sourceCode: any, node: any): boolean {
  if (!sourceCode || !node) {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    return false;
  }

  return (
    linesBeforeHasReq(sourceCode, node) ||
    parentChainHasReq(sourceCode, node) ||
    fallbackTextBeforeHasReq(sourceCode, node)
  );
}

/**
 * Helper to check JSDoc and nearby comments for requirement annotations.
 * Accepts both `@req` and `@supports` markers as evidence of requirement coverage.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function hasReqInJsdocOrComments(jsdoc: any, comments: any[]): boolean {
  if (
    jsdoc &&
    typeof jsdoc.value === "string" &&
    (jsdoc.value.includes("@req") || jsdoc.value.includes("@supports"))
  ) {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    return true;
  }

  return comments.some(commentContainsReq);
}

/**
 * Helper to determine whether a JSDoc or any nearby comments contain a requirement annotation.
 * Treats both `@req` and `@supports` annotations as evidence of requirement coverage.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
export function hasReqAnnotation(
  jsdoc: any,
  comments: any[],
  context?: any,
  node?: any,
): boolean {
  try {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    const sourceCode =
      context && typeof context.getSourceCode === "function"
        ? context.getSourceCode()
        : undefined;

    if (hasReqInAdvancedHeuristics(sourceCode, node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
      // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
      return true;
    }
  } catch {
    // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
    // swallow and fall through to simple checks
  }

  return hasReqInJsdocOrComments(jsdoc, comments);
}
