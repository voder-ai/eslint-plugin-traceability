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
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md
 * @story docs/stories/010.2-REQ-STORY-PATH-AUTOFIX.story.md
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 * @req REQ-AUTOFIX-SAFE - Auto-fix must be conservative and never broaden the referenced path
 * @req REQ-AUTOFIX-PRESERVE - Preserve surrounding formatting when normalizing story path suffixes
 */
export function getFixedStoryPath(original: string): string | null {
  // @story docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md | REQ-AUTOFIX-SAFE - Reject auto-fix when the path contains ".." traversal segments to avoid broadening the reference.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces correctness of the story identifier by rejecting paths that use unsafe traversal segments.
  if (original.includes("..")) {
    // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
    // @implements docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md REQ-AUTOFIX-SAFE
    return null;
  }

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md | REQ-AUTOFIX-FORMAT - Leave correctly formatted ".story.md" paths unchanged so diagnostics are not hidden by redundant fixes.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces correctness of the story identifier by recognizing already valid ".story.md" paths without altering them.
  if (/\.story\.md$/.test(original)) {
    // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT
    // @implements docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md REQ-AUTOFIX-FORMAT
    return null;
  }

  // @story docs/stories/008.0-DEV-AUTO-FIX.story.md | REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE - When ".story" is present but ".md" is missing, append only the extension without altering the base path.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces correctness of the story identifier by completing a partially correct ".story" suffix to the canonical ".story.md".
  if (/\.story$/.test(original)) {
    // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
    // @implements docs/stories/010.2-REQ-STORY-PATH-AUTOFIX.story.md REQ-AUTOFIX-FORMAT
    return `${original}.md`;
  }

  // @story docs/stories/010.2-REQ-STORY-PATH-AUTOFIX.story.md | REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE - Normalize plain ".md" doc paths to ".story.md" while keeping the rest of the path intact.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces correctness of the story identifier by transforming generic ".md" references into canonical ".story.md" story paths.
  if (/\.md$/.test(original)) {
    // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT
    // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE
    // @implements docs/stories/010.2-REQ-STORY-PATH-AUTOFIX.story.md REQ-AUTOFIX-FORMAT
    return original.replace(/\.md$/, ".story.md");
  }

  // @story docs/stories/010.2-REQ-STORY-PATH-AUTOFIX.story.md | REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE - For bare paths with no extension, append ".story.md" as a canonical story reference without touching the directory.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces presence and correctness of the story identifier by supplying the standard ".story.md" suffix when no extension is provided.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT
  // @implements docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-FORMAT REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE
  // @implements docs/stories/010.2-REQ-STORY-PATH-AUTOFIX.story.md REQ-AUTOFIX-FORMAT
  return `${original}.story.md`;
}

/**
 * Build a detailed error message for invalid @story annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
export function buildStoryErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
  options: ResolvedAnnotationOptions,
): string {
  const example = options.storyExample || STORY_EXAMPLE_PATH;

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md | REQ-ERROR-SPECIFICITY - Use a dedicated message variant when the @story value is completely missing.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces presence of the story identifier by emitting a targeted message when the @story value is absent.
  if (kind === "missing") {
    // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
    // @implements docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md REQ-ERROR-SPECIFICITY
    return `Missing story path for @story annotation. Expected a path like "${example}".`;
  }

  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
  // @implements docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md REQ-ERROR-SPECIFICITY
  return `Invalid story path "${value ?? ""}" for @story annotation. Expected a path like "${example}".`;
}

/**
 * Build a detailed error message for invalid @req annotations.
 *
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @story docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md
 * @req REQ-ERROR-SPECIFICITY - Provide specific error messages for different format violations
 * @req REQ-AUTOFIX-FORMAT - Provide safe, minimal automatic fixes for common format issues
 */
export function buildReqErrorMessage(
  kind: "missing" | "invalid",
  value: string | null,
  options: ResolvedAnnotationOptions,
): string {
  const example = options.reqExample || getDefaultReqExample();

  // @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md | REQ-ERROR-SPECIFICITY - Distinguish a completely missing @req from one that is present but malformed.
  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-REQ-FORMAT REQ-ERROR-SPECIFICITY - Enforces presence of the requirement identifier by emitting a specific message when the @req value is missing.
  if (kind === "missing") {
    // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
    // @implements docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md REQ-ERROR-SPECIFICITY
    return `Missing requirement ID for @req annotation. Expected an identifier like "${example}".`;
  }

  // @implements docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md REQ-ERROR-SPECIFICITY
  // @implements docs/stories/010.1-REQ-STORY-PATH-STRICTNESS.story.md REQ-ERROR-SPECIFICITY
  return `Invalid requirement ID "${value ?? ""}" for @req annotation. Expected an identifier like "${example}" (uppercase letters, numbers, and dashes only).`;
}
