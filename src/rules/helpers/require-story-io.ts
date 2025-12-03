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
 * Shared predicate to determine if a given comment node contains an @story marker.
 * Also treats @implements annotations as satisfying story presence checks.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize @story detection logic for comment value inspection
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Treat @implements annotations as satisfying story presence checks
 */
function commentContainsStory(comment: any): boolean {
  if (typeof comment?.value !== "string") {
    return false;
  }
  return (
    comment.value.includes("@story") || comment.value.includes("@implements")
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
 * Generic helper to scan a range of physical source lines for the presence of an @story marker.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Reuse line scanning logic for story annotations across helpers
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Accept @implements annotations as valid markers during line scanning
 */
function scanLinesForMarker(
  lines: string[],
  from: number,
  to: number,
): boolean {
  // Walk each physical line in the configured lookback window to search for an inline @story or @implements marker.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Scan preceding lines for existing story annotations
  for (let i = from; i < to; i++) {
    const text = lines[i];
    // Treat any line containing "@story" or "@implements" as evidence that the function is already annotated.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - Detect explicit @story markers in raw source text
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Detect explicit @implements markers in raw source text
    if (
      typeof text === "string" &&
      (text.includes("@story") || text.includes("@implements"))
    ) {
      return true;
    }
  }
  return false;
}

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
         * @req REQ-ANNOTATION-REQUIRED - Detect @story in parent comments via value inspection
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
         * @req REQ-ANNOTATION-REQUIRED - Detect @story in parent leadingComments via value inspection
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
 * Fallback: inspect text immediately preceding the node in sourceCode.getText to find @story
 * Also accepts @implements annotations as satisfying story presence for this rule.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-ANNOTATION-REQUIRED - Provide fallback textual inspection when other heuristics fail
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Treat @implements annotations as satisfying story presence in fallback checks
 */
export function fallbackTextBeforeHasStory(
  sourceCode: any,
  node: any,
): boolean {
  // Skip fallback text inspection when the sourceCode API or node range information is not available.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Avoid throwing when source text or range metadata cannot be read
  if (
    typeof sourceCode?.getText !== "function" ||
    !Array.isArray((node && node.range) || [])
  ) {
    return false;
  }
  const range = node.range;
  // Guard against malformed range values that cannot provide a numeric start index for slicing.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Validate node range structure before computing fallback window
  if (!Array.isArray(range) || typeof range[0] !== "number") {
    return false;
  }
  try {
    // Limit the fallback inspection window to a bounded region immediately preceding the node.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - Restrict fallback text scanning to a safe, fixed-size window
    const start = Math.max(0, range[0] - FALLBACK_WINDOW);
    const textBefore = sourceCode.getText().slice(start, range[0]);
    // Detect any @story or @implements marker that appears within the bounded fallback window.
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - Recognize story annotations discovered via fallback text scanning
    // @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Recognize @implements annotations discovered via fallback text scanning
    if (
      typeof textBefore === "string" &&
      (textBefore.includes("@story") || textBefore.includes("@implements"))
    ) {
      return true;
    }
  } catch {
    /*
     * Swallow low-level IO or slicing errors so annotation detection never breaks lint execution.
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-ANNOTATION-REQUIRED - Treat fallback text inspection failures as "no annotation" instead of raising
     */
  }
  return false;
}
