/**
 * Internal helpers and types for the valid-annotation-format rule.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-FLEXIBLE-PARSING - Support reasonable variations in whitespace and formatting
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-SUPPORTS-PARSE - Parse @supports annotations without affecting @story/@req
 * @req REQ-MIXED-SUPPORT - Support mixed @story/@req/@implements usage in comments
 */

/**
 * Pending annotation state tracked while iterating through comment lines.
 */
export interface PendingAnnotation {
  type: "story" | "req";
  value: string;
  hasValue: boolean;
}

/**
 * Normalize a raw comment line to make annotation parsing more robust.
 *
 * This function trims whitespace, keeps any annotation tags that appear
 * later in the line, and supports common JSDoc styles such as leading "*".
 *
 * It detects @story, @req, and @supports tags while preserving the rest
 * of the line for downstream logic.
 */
export function normalizeCommentLine(rawLine: string): string {
  const trimmed = rawLine.trim();
  if (!trimmed) {
    return "";
  }

  const annotationMatch = trimmed.match(/@story\b|@req\b|@supports\b/);
  if (!annotationMatch || annotationMatch.index === undefined) {
    const withoutLeadingStar = trimmed.replace(/^\*\s?/, "");
    return withoutLeadingStar;
  }

  return trimmed.slice(annotationMatch.index);
}
