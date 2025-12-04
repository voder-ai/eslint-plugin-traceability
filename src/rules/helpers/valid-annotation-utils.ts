import { getDefaultReqExample } from "./valid-annotation-options";
import type { ResolvedAnnotationOptions } from "./valid-annotation-options";

/**
 * Shared constants and helpers for annotation-format validation.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */

/**
 * Constant to represent the "tag not found" index when searching
 * for @story or @req within a comment.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-PRESERVE - Avoid risky text replacements when the annotation tag cannot be located
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
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-MULTILINE-SUPPORT - Handle annotations split across multiple lines
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
export function collapseAnnotationValue(value: string): string {
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-MULTILINE-SUPPORT
  return value.replace(/\s+/g, "");
}

/**
 * Attempt a minimal, safe auto-fix for common @story path suffix issues.
 *
 * Only handles:
 *   - missing ".md"
 *   - missing ".story.md"
 * and skips any paths with traversal segments (e.g. "..").
 *
 * Returns the fixed path when safe, or null if no fix should be applied.
 *
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and never broaden the referenced path
 * @req REQ-AUTOFIX-PRESERVE - Preserve surrounding formatting when normalizing story path suffixes
 */
export function getFixedStoryPath(original: string): string | null {
  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md | REQ-AUTOFIX-SAFE - Skip auto-fix entirely for paths containing directory traversal segments ("..").
  if (original.includes("..")) {
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
    return null;
  }

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md | REQ-AUTOFIX-FORMAT - Do not modify paths that already end with ".story.md" since they are already in the correct format.
  if (/\.story\.md$/.test(original)) {
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
    return null;
  }

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md | REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE - Append the missing ".md" extension when the path already ends with ".story", preserving the existing base path.
  if (/\.story$/.test(original)) {
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
    return `${original}.md`;
  }

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md | REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE - Upgrade plain ".md" paths to ".story.md" while preserving the rest of the path unchanged.
  if (/\.md$/.test(original)) {
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
    return original.replace(/\.md$/, ".story.md");
  }

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md | REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE - For paths with no extension, conservatively append ".story.md" to create a canonical story file path.
  // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE
  return `${original}.story.md`;
}

/**
 * Build a detailed error message for invalid @story annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
export function buildStoryErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
  options: ResolvedAnnotationOptions,
): string {
  const example = options.storyExample || STORY_EXAMPLE_PATH;
  if (kind === "missing") {
    return `Missing story path for @story annotation. Expected a path like "${example}".`;
  }

  return `Invalid story path "${value ?? ""}" for @story annotation. Expected a path like "${example}".`;
}

/**
 * Build a detailed error message for invalid @req annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
export function buildReqErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
  options: ResolvedAnnotationOptions,
): string {
  const example = options.reqExample || getDefaultReqExample();
  if (kind === "missing") {
    return `Missing requirement ID for @req annotation. Expected an identifier like "${example}".`;
  }

  return `Invalid requirement ID "${value ?? ""}" for @req annotation. Expected an identifier like "${example}" (uppercase letters, numbers, and dashes only).`;
}
