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
 * Predicate helper to check whether a comment contains a @req annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req tag inside a comment
 */
function commentContainsReq(c: any): boolean {
  return c && typeof c.value === "string" && c.value.includes("@req");
}

/**
 * Line-based helper adapted from linesBeforeHasStory to detect @req.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in preceding source lines
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

  // Scan each physical line in the configured lookback window for an @req marker.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Search preceding lines for @req text
  for (let i = from; i < to; i++) {
    const text = lines[i];
    // When a line contains @req we treat the function as already annotated.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req marker in raw source lines
    if (typeof text === "string" && text.includes("@req")) {
      return true;
    }
  }
  return false;
}

/**
 * Parent-chain helper adapted from parentChainHasStory to detect @req.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in parent-chain comments
 */
function parentChainHasReq(sourceCode: any, node: any): boolean {
  let p = node && node.parent;

  // Walk up the parent chain and inspect comments attached to each ancestor.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION - Traverse parent nodes when local comments are absent
  while (p) {
    const pComments =
      typeof sourceCode?.getCommentsBefore === "function"
        ? sourceCode.getCommentsBefore(p) || []
        : [];

    // Look for @req in comments immediately preceding each parent node.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers in parent comments
    if (Array.isArray(pComments) && pComments.some(commentContainsReq)) {
      return true;
    }

    const pLeading = p.leadingComments || [];

    // Also inspect leadingComments attached directly to the parent node.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req markers in parent leadingComments
    if (Array.isArray(pLeading) && pLeading.some(commentContainsReq)) {
      return true;
    }

    p = p.parent;
  }
  return false;
}

/**
 * Fallback text window helper adapted from fallbackTextBeforeHasStory to detect @req.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Detect @req in fallback text window before node
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

    // Detect @req in the bounded text window immediately preceding the node.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQ-DETECTION - Detect @req marker in fallback text window
    if (typeof textBefore === "string" && textBefore.includes("@req")) {
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
 * Helper to determine whether a JSDoc or any nearby comments contain a @req annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation
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

  // BRANCH @req detection on JSDoc or comments
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  return (
    (jsdoc &&
      typeof jsdoc.value === "string" &&
      jsdoc.value.includes("@req")) ||
    comments.some(commentContainsReq)
  );
}
