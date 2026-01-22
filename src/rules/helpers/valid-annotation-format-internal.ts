/**
 * Internal helpers and types for the valid-annotation-format rule.
 *
 * @supports docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md REQ-IGNORE-INLINE-CODE REQ-PRESERVE-BOUNDARIES REQ-CENTRALIZED-FILTER
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
 * This function trims whitespace, strips any inline code spans wrapped in
 * backticks (replacing them with spaces of equal length to preserve character
 * boundaries), keeps any annotation tags that appear later in the line, and
 * supports common JSDoc styles such as leading "*".
 *
 * It detects `@story`, `@req`, and `@supports` tags while preserving the rest
 * of the line for downstream logic.
 */
export function normalizeCommentLine(rawLine: string): string {
  const trimmed = rawLine.trim();
  if (!trimmed) {
    // @supports docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md REQ-CENTRALIZED-FILTER
    return "";
  }

  // @supports docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md REQ-IGNORE-INLINE-CODE REQ-PRESERVE-BOUNDARIES REQ-CENTRALIZED-FILTER
  // Strip backtick-wrapped content while preserving character positions by
  // replacing each matched segment with spaces of the same length.
  // This ensures annotations that appear outside code spans are still
  // detected at their original indices.
  const filtered = trimmed.replace(/`[^`]*`/g, (match) =>
    " ".repeat(match.length),
  );

  // Remove leading star first to normalize JSDoc format
  const withoutLeadingStar = filtered.replace(/^\*\s?/, "");

  // Check if the line starts with a non-traceability JSDoc tag (e.g., @param, @returns)
  // If so, return the whole line as-is to avoid false positives where annotation
  // keywords appear in the tag's description (e.g., "`@returns` ... `@story` annotations")
  if (/^@(?!story\b|req\b|supports\b)/.test(withoutLeadingStar)) {
    // @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-JSDOC-BOUNDARY-DETECTION REQ-JSDOC-TAG-COEXISTENCE
    return withoutLeadingStar;
  }

  // Otherwise, check for traceability annotations and slice to them if found
  const annotationMatch = withoutLeadingStar.match(
    /@story\b|@req\b|@supports\b/,
  );
  if (!annotationMatch || annotationMatch.index === undefined) {
    // @supports docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md REQ-CENTRALIZED-FILTER
    return withoutLeadingStar;
  }

  return withoutLeadingStar.slice(annotationMatch.index);
}

/**
 * Detect whether a normalized comment line starts with a non-traceability JSDoc tag.
 *
 * This is used to distinguish regular JSDoc tags (e.g. @param, @returns) from
 * traceability-related annotations such as `@story`, `@req`, and `@supports`.
 *
 * Supports coexistence with JSDoc by:
 * - Detecting boundaries between traceability tags and other tags
 * - Allowing regular JSDoc tags to live alongside traceability annotations
 *
 * Related requirements:
 * - REQ-JSDOC-BOUNDARY-DETECTION
 * - REQ-JSDOC-TAG-COEXISTENCE
 */
export function isNonTraceabilityJSDocTagLine(normalized: string): boolean {
  const trimmed = normalized.trimStart();
  if (!trimmed || !trimmed.startsWith("@")) {
    // @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-JSDOC-BOUNDARY-DETECTION
    return false;
  }

  if (/^@(story|req|supports)\b/.test(trimmed)) {
    // @supports docs/stories/022.0-DEV-JSDOC-COEXISTENCE.story.md REQ-JSDOC-TAG-COEXISTENCE
    return false;
  }

  return true;
}
