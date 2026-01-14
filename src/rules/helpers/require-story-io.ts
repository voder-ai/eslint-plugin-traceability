/**
 * IO helpers for require-story detection moved to reduce helper module size
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract IO bound helpers to separate module
 */

/**
 * Number of source lines to inspect before a node when searching for `@story` markers.
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
 * Shared predicate to determine if a given comment node contains an `@story` marker.
 * Also treats `@supports` annotations as satisfying story presence checks.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function commentContainsStory(comment: any): boolean {
  if (typeof comment?.value !== "string") {
    return false;
  }
  return (
    comment.value.includes("@story") || comment.value.includes("@supports")
  );
}

/**
 * Safely extract the physical source lines array from sourceCode for scanning.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize guards for safe access to source lines
 */
function getSourceLines(sourceCode: any): string[] | null {
  const lines = sourceCode && sourceCode.lines;
  return Array.isArray(lines) ? lines : null;
}

/**
 * Safely resolve the starting line number of a node for use in lookback scans.
 * Returns null when the node does not provide a valid numeric start line.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize guards for safe access to node location metadata
 */
function getNodeStartLine(node: any): number | null {
  if (!node || !node.loc) {
    return null;
  }
  const line = node.loc.start?.line;
  return typeof line === "number" ? line : null;
}

/**
 * Generic helper to scan a range of physical source lines for the presence of an `@story` marker.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function scanLinesForMarker(
  lines: string[],
  from: number,
  to: number,
): boolean {
  // Walk each physical line in the configured lookback window to search for an inline `@story` or `@supports` marker.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Scan preceding lines for existing story annotations
  for (let i = from; i < to; i++) {
    const text = lines[i];
    // Treat any line containing `@story` or `@supports` as evidence that the function is already annotated.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - Detect explicit `@story` markers in raw source text
    // @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
    if (
      typeof text === "string" &&
      (text.includes("@story") || text.includes("@supports"))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Inspect a fixed number of physical source lines before the node for `@story` text
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract line-based detection into helper
 */
export function linesBeforeHasStory(
  sourceCode: any,
  node: any,
  lookback = LOOKBACK_LINES,
): boolean {
  const lines = getSourceLines(sourceCode);
  const startLine = getNodeStartLine(node);
  // Guard against missing or non-array source lines or an invalid start line before scanning.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Fail gracefully when source lines or locations are unavailable
  if (!lines || typeof startLine !== "number") {
    return false;
  }
  const from = Math.max(0, startLine - 1 - lookback);
  const to = Math.max(0, startLine - 1);
  return scanLinesForMarker(lines, from, to);
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
         * @req REQ-ANNOTATION-REQUIRED - Detect `@story` in parent comments via value inspection
         */
        (c: any) => commentContainsStory(c),
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
         * @req REQ-ANNOTATION-REQUIRED - Detect `@story` in parent leadingComments via value inspection
         */
        (c: any) => commentContainsStory(c),
      )
    ) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

/**
 * Safely compute the starting range index for fallback text scanning.
 * Centralizes guards around sourceCode.getText and node.range structure.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize guards for fallback range computation
 */
function getFallbackRangeStart(sourceCode: any, node: any): number | null {
  if (typeof sourceCode?.getText !== "function") {
    return null;
  }
  const range = (node && node.range) || null;
  if (!Array.isArray(range) || typeof range[0] !== "number") {
    return null;
  }
  return range[0];
}

/**
 * Safely slice a bounded fallback text window immediately preceding the node start index.
 * Restricts scanning to a fixed-size window and treats IO/slicing failures as non-fatal.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Restrict fallback text scanning to a safe, fixed-size window and handle failures gracefully
 */
function getFallbackTextWindow(
  sourceCode: any,
  nodeStartIndex: number,
): string | null {
  const start = Math.max(0, nodeStartIndex - FALLBACK_WINDOW);
  try {
    const textBefore = sourceCode.getText().slice(start, nodeStartIndex);
    return typeof textBefore === "string" ? textBefore : null;
  } catch {
    /*
     * Swallow low-level IO or slicing errors so annotation detection never breaks lint execution.
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-ANNOTATION-REQUIRED - Treat fallback text inspection failures as "no annotation" instead of raising
     */
    return null;
  }
}

/**
 * Detect whether the provided fallback text window contains a story marker.
 * Recognizes both `@story` and `@supports` annotations in the inspected text.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
function fallbackTextHasMarker(textBefore: string | null): boolean {
  if (typeof textBefore !== "string") {
    return false;
  }
  return textBefore.includes("@story") || textBefore.includes("@supports");
}

/**
 * Fallback: inspect text immediately preceding the node in sourceCode.getText to find `@story`
 * Also accepts `@supports` annotations as satisfying story presence for this rule.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-REQUIRE-ACCEPTS-SUPPORTS
 */
export function fallbackTextBeforeHasStory(
  sourceCode: any,
  node: any,
): boolean {
  const nodeStartIndex = getFallbackRangeStart(sourceCode, node);
  if (nodeStartIndex === null) {
    return false;
  }
  const textBefore = getFallbackTextWindow(sourceCode, nodeStartIndex);
  return fallbackTextHasMarker(textBefore);
}
