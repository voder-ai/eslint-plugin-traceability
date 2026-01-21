/* eslint-disable traceability/require-branch-annotation */

import { getDefaultReqExample } from "./valid-annotation-options";
import type { ResolvedAnnotationOptions } from "./valid-annotation-options";

/**
 * Shared constants and helpers for annotation-format validation.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
 */

/**
 * Constant to represent the "tag not found" index when searching
 * for `@story` or `@req` within a comment.
 *
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
export const TAG_NOT_FOUND_INDEX = -1;

export const STORY_EXAMPLE_PATH = "docs/stories/005.0-DEV-EXAMPLE.story.md";

/**
 * Collapse internal whitespace in an annotation value so that multi-line
 * annotations are treated as a single logical value.
 *
 * Example:
 *   "docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md" across
 *   multiple lines will be collapsed before validation.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
 */
export function collapseAnnotationValue(value: string): string {
  // @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT
  return value.replace(/\s+/g, "");
}

/**
 * Attempt a minimal, safe auto-fix for common `@story` path suffix issues.
 *
 * Only handles:
 *   - missing ".md"
 *   - missing ".story.md"
 * and skips any paths with traversal segments (e.g. "..").
 *
 * Returns the fixed path when safe, or null if no fix should be applied.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-PATH-FORMAT
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE
 */
export function getFixedStoryPath(original: string): string | null {
  // Reject auto-fix when the path contains ".." traversal segments to avoid broadening the reference.
  if (original.includes("..")) {
    // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
    return null;
  }

  // Leave correctly formatted ".story.md" paths unchanged so diagnostics are not hidden by redundant fixes.
  if (/\.story\.md$/.test(original)) {
    // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-IDEMPOTENT
    return null;
  }

  // When ".story" is present but ".md" is missing, append only the extension without altering the base path.
  if (/\.story$/.test(original)) {
    // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
    return `${original}.md`;
  }

  // Normalize plain ".md" doc paths to ".story.md" while keeping the rest of the path intact.
  if (/\.md$/.test(original)) {
    // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
    return original.replace(/\.md$/, ".story.md");
  }

  // For bare paths with no extension, append ".story.md" as a canonical story reference without touching the directory.
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE
  return `${original}.story.md`;
}

/**
 * Build a detailed error message for invalid `@story` annotations.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
 * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
 */
export function buildStoryErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
  options: ResolvedAnnotationOptions,
): string {
  const example = options.storyExample || STORY_EXAMPLE_PATH;

  // Use a dedicated message variant when the `@story` value is completely missing.
  if (kind === "missing") {
    // @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
    return `Missing story path for @story annotation. Expected a path like "${example}".`;
  }

  // @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
  // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
  return `Invalid story path "${value ?? ""}" for @story annotation. Expected a path like "${example}".`;
}

/**
 * Build a detailed error message for invalid `@req` annotations.
 *
 * @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
 * @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
 */
export function buildReqErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
  options: ResolvedAnnotationOptions,
): string {
  const example = options.reqExample || getDefaultReqExample();

  // Distinguish a completely missing `@req` from one that is present but malformed.
  if (kind === "missing") {
    // @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
    // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
    return `Missing requirement ID for @req annotation. Expected an identifier like "${example}".`;
  }

  // @supports docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
  // @supports docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md REQ-EXAMPLE-MESSAGES
  return `Invalid requirement ID "${value ?? ""}" for @req annotation. Expected an identifier like "${example}" (uppercase letters, numbers, and dashes only).`;
}
