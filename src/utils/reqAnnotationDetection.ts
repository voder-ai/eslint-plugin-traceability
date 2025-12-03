/**
 * Shared @req detection helpers used by annotation-checker utilities.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers around function-like nodes
 */
import {
  FALLBACK_WINDOW,
  LOOKBACK_LINES,
} from "../rules/helpers/require-story-io";

/**
 * Predicate helper to check whether a comment contains a requirement annotation.
 * Treats both @req and @implements annotations as satisfying requirement presence checks.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req tag inside a comment
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Accept @implements as requirement annotation
 */
function commentContainsReq(c: any): boolean {
  return (
    c &&
    typeof c.value === "string" &&
    (c.value.includes("@req") || c.value.includes("@implements"))
  );
}

/**
 * Line-based helper adapted from linesBeforeHasStory to detect requirement annotations.
 * Lines containing either @req or @implements are treated as annotated.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in preceding source lines
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Accept @implements in preceding source lines
 */
function linesBeforeHasReq(sourceCode: any, node: any): boolean {
  const lines = sourceCode && sourceCode.lines;
  const startLine =
    node && node.loc && typeof node.loc.start?.line === "number"
      ? node.loc.start.line
      : null;

  // Guard against missing or malformed source/loc information before scanning.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Avoid false positives when sourceCode/loc is incomplete
  if (!Array.isArray(lines) || typeof startLine !== "number") {
    return false;
  }

  const from = Math.max(0, startLine - 1 - LOOKBACK_LINES);
  const to = Math.max(0, startLine - 1);

  // Scan each physical line in the configured lookback window for @req or @implements markers.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Search preceding lines for @req text
  // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Search preceding lines for @implements text
  for (let i = from; i < to; i++) {
    const text = lines[i];
    // When a line contains @req or @implements we treat the function as already annotated.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req marker in raw source lines
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Detect @implements marker in raw source lines
    if (
      typeof text === "string" &&
      (text.includes("@req") || text.includes("@implements"))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Parent-chain helper adapted from parentChainHasStory to detect requirement annotations.
 * Accepts both @req and @implements in parent-chain comments as satisfying requirement presence.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in parent-chain comments
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Accept @implements in parent-chain comments
 */
function parentChainHasReq(sourceCode: any, node: any): boolean {
  let p = node && node.parent;

  // Walk up the parent chain and inspect comments attached to each ancestor.
  // Accept both @req and @implements markers when local comments are absent.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Traverse parent nodes when local comments are absent
  // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Allow @implements to satisfy requirement on parents
  while (p) {
    const pComments =
      typeof sourceCode?.getCommentsBefore === "function"
        ? sourceCode.getCommentsBefore(p) || []
        : [];

    // Look for @req or @implements in comments immediately preceding each parent node.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers in parent comments
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Detect @implements markers in parent comments
    if (Array.isArray(pComments) && pComments.some(commentContainsReq)) {
      return true;
    }

    const pLeading = p.leadingComments || [];

    // Also inspect leadingComments attached directly to the parent node, accepting @req or @implements.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers in parent leadingComments
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Detect @implements markers in parent leadingComments
    if (Array.isArray(pLeading) && pLeading.some(commentContainsReq)) {
      return true;
    }

    p = p.parent;
  }
  return false;
}

/**
 * Fallback text window helper adapted from fallbackTextBeforeHasStory to detect requirement annotations.
 * Treats both @req and @implements in the fallback text window as requirement presence.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in fallback text window before node
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Accept @implements in fallback text window before node
 */
function fallbackTextBeforeHasReq(sourceCode: any, node: any): boolean {
  // Guard against unsupported sourceCode or nodes without a usable range.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Ensure we only inspect text when range information is available
  if (
    typeof sourceCode?.getText !== "function" ||
    !Array.isArray((node && node.range) || [])
  ) {
    return false;
  }
  const range = node.range;

  // Guard when the node range cannot provide a numeric start index.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Avoid scanning when range start is not a number
  if (!Array.isArray(range) || typeof range[0] !== "number") {
    return false;
  }
  try {
    const start = Math.max(0, range[0] - FALLBACK_WINDOW);
    const textBefore = sourceCode.getText().slice(start, range[0]);

    // Detect @req or @implements in the bounded text window immediately preceding the node.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req marker in fallback text window
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Detect @implements marker in fallback text window
    if (
      typeof textBefore === "string" &&
      (textBefore.includes("@req") || textBefore.includes("@implements"))
    ) {
      return true;
    }
  } catch {
    // Swallow detection errors to avoid breaking lint runs due to malformed source.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Treat IO/detection failures as "no annotation" instead of throwing
    /* noop */
  }
  return false;
}

/**
 * Helper to determine whether a JSDoc or any nearby comments contain a requirement annotation.
 * Treats both @req and @implements annotations as evidence of requirement coverage.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Accept @implements as requirement coverage
 */
export function hasReqAnnotation(
  jsdoc: any,
  comments: any[],
  context?: any,
  node?: any,
): boolean {
  try {
    const sourceCode =
      context && typeof context.getSourceCode === "function"
        ? context.getSourceCode()
        : undefined;

    // Prefer robust, location-based heuristics when sourceCode and node are available.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Use multiple heuristics to detect @req markers around the node
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Use multiple heuristics to detect @implements markers around the node
    if (sourceCode && node) {
      if (
        linesBeforeHasReq(sourceCode, node) ||
        parentChainHasReq(sourceCode, node) ||
        fallbackTextBeforeHasReq(sourceCode, node)
      ) {
        return true;
      }
    }
  } catch {
    // Swallow detection errors and fall through to simple checks.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Fail gracefully when advanced detection heuristics throw
  }

  // BRANCH requirement detection on JSDoc or comments, accepting both @req and @implements.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS
  return (
    (jsdoc &&
      typeof jsdoc.value === "string" &&
      (jsdoc.value.includes("@req") || jsdoc.value.includes("@implements"))) ||
    comments.some(commentContainsReq)
  );
}
