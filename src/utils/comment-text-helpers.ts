/* eslint-disable traceability/require-branch-annotation */

/**
 * Low-level comment text extraction helpers for branch annotation processing.
 *
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Extract and normalize comment text from various comment node types
 */

/**
 * Extract the raw value from a comment node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Extract and normalize comment text from various comment node types
 */
export function extractCommentValue(_c: any): string {
  return _c.value;
}

/**
 * Extract trimmed comment text for a given source line index or return null
 * when the line is blank or not a comment. This helper centralizes the
 * formatter-aware rules used by branch helpers when scanning for contiguous
 * comment lines around branches.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
 */
export function getCommentTextAtLine(
  lines: string[],
  index: number,
): string | null {
  const line = lines[index];
  if (!line || !line.trim()) {
    return null;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    return null;
  }

  return line.trim();
}

/**
 * Collect a single contiguous comment line at the given index, appending its
 * trimmed text to the accumulator. Returns true when a valid comment was
 * collected and false when scanning should stop (blank or non-comment line).
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
 */
export function collectCommentLine(
  lines: string[],
  index: number,
  comments: string[],
): boolean {
  const commentText = getCommentTextAtLine(lines, index);
  if (!commentText) {
    return false;
  }

  comments.push(commentText);
  return true;
}
