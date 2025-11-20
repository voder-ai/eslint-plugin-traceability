/**
 * IO helpers for require-story detection moved to reduce helper module size
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract IO bound helpers to separate module
 */

/**
 * Number of source lines to inspect before a node when searching for @story markers.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Expose lookback size as constant for reuse
 */
export const LOOKBACK_LINES = 4;

/**
 * Number of characters to include in the fallback textual inspection window before a node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Expose fallback window size as constant for reuse
 */
export const FALLBACK_WINDOW = 800;

/**
 * Inspect a fixed number of physical source lines before the node for @story text
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract line-based detection into helper
 */
export function linesBeforeHasStory(
  sourceCode: any,
  node: any,
  lookback = LOOKBACK_LINES,
): boolean {
  const lines = sourceCode && sourceCode.lines;
  const startLine =
    node && node.loc && typeof node.loc.start?.line === "number"
      ? node.loc.start.line
      : null;
  if (!Array.isArray(lines) || typeof startLine !== "number") {
    return false;
  }
  const from = Math.max(0, startLine - 1 - lookback);
  const to = Math.max(0, startLine - 1);
  for (let i = from; i < to; i++) {
    const text = lines[i];
    if (typeof text === "string" && text.includes("@story")) {
      return true;
    }
  }
  return false;
}

/**
 * Walk parent chain and check comments before each parent and their leadingComments
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract parent-chain comment detection into helper
 */
export function parentChainHasStory(sourceCode: any, node: any): boolean {
  let p = node && node.parent;
  while (p) {
    const pComments =
      typeof sourceCode?.getCommentsBefore === "function"
        ? sourceCode.getCommentsBefore(p) || []
        : [];
    if (
      Array.isArray(pComments) &&
      pComments.some(
        /**
         * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
         * @req REQ-ANNOTATION-REQUIRED - Detect @story in parent comments via value inspection
         */
        (c: any) => typeof c.value === "string" && c.value.includes("@story"),
      )
    ) {
      return true;
    }
    const pLeading = p.leadingComments || [];
    if (
      Array.isArray(pLeading) &&
      pLeading.some(
        /**
         * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
         * @req REQ-ANNOTATION-REQUIRED - Detect @story in parent leadingComments via value inspection
         */
        (c: any) => typeof c.value === "string" && c.value.includes("@story"),
      )
    ) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

/**
 * Fallback: inspect text immediately preceding the node in sourceCode.getText to find @story
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Provide fallback textual inspection when other heuristics fail
 */
export function fallbackTextBeforeHasStory(
  sourceCode: any,
  node: any,
): boolean {
  if (
    typeof sourceCode?.getText !== "function" ||
    !Array.isArray((node && node.range) || [])
  ) {
    return false;
  }
  const range = node.range;
  if (!Array.isArray(range) || typeof range[0] !== "number") {
    return false;
  }
  try {
    // Limit the fallback inspect window to a reasonable size
    const start = Math.max(0, range[0] - FALLBACK_WINDOW);
    const textBefore = sourceCode.getText().slice(start, range[0]);
    if (typeof textBefore === "string" && textBefore.includes("@story")) {
      return true;
    }
  } catch {
    /* noop */
  }
  return false;
}
