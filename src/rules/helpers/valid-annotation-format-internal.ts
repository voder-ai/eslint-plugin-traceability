/**
 * Internal helpers and types for the valid-annotation-format rule.
 *
 * This logic is validated against multiple documentation stories focused on:
 * - This rule covers DEV annotation validation
 * - This rule covers DEV auto-fix behavior
 * - This rule covers DEV multi-story support
 *
 * Requirements covered:
 * - This helper supports REQ-MULTILINE-SUPPORT: Handle annotations split across multiple lines
 * - This helper supports REQ-FLEXIBLE-PARSING: Support reasonable variations in whitespace and formatting
 * - This helper supports REQ-AUTOFIX-FORMAT: Provide safe, minimal automatic fixes for common format issues
 * - This helper supports REQ-SUPPORTS-PARSE: Parse @supports annotations without affecting @story/@req
 * - This helper supports REQ-MIXED-SUPPORT: Support mixed @story/@req/@implements usage in comments
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

/**
 * Detect whether a normalized comment line starts with a non-traceability JSDoc tag.
 *
 * This is used to distinguish regular JSDoc tags (e.g. @param, @returns) from
 * traceability-related annotations such as @story, @req, and @supports.
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
    return false;
  }

  if (/^@(story|req|supports)\b/.test(trimmed)) {
    return false;
  }

  return true;
}
