import type { Rule } from "eslint";

/**
 * Shared types and helpers for redundant-annotation detection.
 *
 * These utilities focus on parsing traceability annotations from comment
 * text and computing relationships between "scope" coverage and
 * statement-level annotations. They are intentionally small, pure
 * functions so that the ESLint rule can delegate most of its logic
 * here while keeping its own create/visitor code shallow.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION
 */

export const EXPECTED_RANGE_LENGTH = 2; // [start, end]

export type Strictness = "strict" | "moderate" | "permissive";

export interface RedundancyRuleOptions {
  strictness: Strictness;
  allowEmphasisDuplication: boolean;
  maxScopeDepth: number;
  alwaysCovered: readonly string[];
}

/**
 * Canonical representation of a single story+requirement pair.
 *
 * The key form `"<story>|<req>"` lets us compare pairs across scopes
 * without repeatedly allocating compound objects.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION REQ-DIFFERENT-REQUIREMENTS
 */
export type StoryReqKey = string; // "<story>|<req>" where either side may be empty

/**
 * Build a canonical key for a story/requirement pair.
 *
 * Empty story or requirement components are normalized to the empty
 * string so that comparisons remain stable even when some annotations
 * omit one side (for example, malformed or story-less `@req` lines).
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION REQ-DIFFERENT-REQUIREMENTS
 */
export function toStoryReqKey(
  storyPath: string | null,
  reqId: string,
): StoryReqKey {
  const story = storyPath ?? "";
  const req = reqId ?? "";
  return `${story}|${req}`;
}

/**
 * Extract story/requirement pairs from a snippet of comment text.
 *
 * Supported patterns:
 * - `@` + `story <path>` followed by one or more `@` + `req <ID>` lines.
 * - `@` + `supports <path> <REQ-ID-1> <REQ-ID-2> ...` where each `REQ-*`
 *   token is treated as a separate pair bound to the same story path.
 *
 * The parser is intentionally conservative: it only creates pairs when
 * it can confidently associate a requirement identifier with a story
 * path. This avoids false positives in REQ-DIFFERENT-REQUIREMENTS by
 * ensuring we never conflate different requirement IDs.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION REQ-DIFFERENT-REQUIREMENTS
 */
export function extractStoryReqPairsFromText(text: string): Set<StoryReqKey> {
  const pairs = new Set<StoryReqKey>();
  if (!text) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
    return pairs;
  }

  const lines = text.split(/\r?\n/);
  let currentStory: string | null = null;

  for (const rawLine of lines) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
    const line = rawLine.trim();
    if (!line) {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
      continue;
    }

    const storyMatch = line.match(/@story\s+(\S+)/);
    if (storyMatch) {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
      currentStory = storyMatch[1];
    }

    const reqMatch = line.match(/@req\s+(\S+)/);
    if (reqMatch && currentStory) {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
      pairs.add(toStoryReqKey(currentStory, reqMatch[1]));
    }

    const supportsMatch = line.match(/@supports\s+(\S+)\s+(.+)/);
    if (supportsMatch) {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
      const storyPath = supportsMatch[1];
      const tail = supportsMatch[2];
      const tokens = tail
        .split(/\s+/)
        .filter((t) => /^REQ-[A-Z0-9-]+$/.test(t));
      for (const reqId of tokens) {
        // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
        pairs.add(toStoryReqKey(storyPath, reqId));
      }
    }
  }

  return pairs;
}

/**
 * Extract story/requirement pairs from a list of ESLint comment nodes.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION
 */
export function extractStoryReqPairsFromComments(
  comments: any[],
): Set<StoryReqKey> {
  const pairs = new Set<StoryReqKey>();
  if (!Array.isArray(comments) || comments.length === 0) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
    return pairs;
  }

  const combinedText = comments
    .filter((comment) => comment && typeof comment.value === "string")
    .map((comment) => comment.value)
    .join("\n");

  const fromComments = extractStoryReqPairsFromText(combinedText);
  for (const key of fromComments) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
    pairs.add(key);
  }

  return pairs;
}

/**
 * Determine whether all story/requirement pairs in `child` are already
 * covered by `parent`.
 *
 * This implements the core notion of redundancy: if a statement-level
 * annotation only repeats the exact same story+requirement pairs that
 * are already declared on its containing scope, it does not add any
 * new traceability information.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION REQ-DIFFERENT-REQUIREMENTS REQ-SCOPE-INHERITANCE
 */
export function arePairsFullyCovered(
  child: Set<StoryReqKey>,
  parent: Set<StoryReqKey>,
): boolean {
  if (child.size === 0) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION
    return false;
  }
  if (parent.size === 0) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION
    return false;
  }

  for (const key of child) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION
    if (!parent.has(key)) {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-DUPLICATION-DETECTION
      return false;
    }
  }

  return true;
}

/**
 * Decide whether a given statement node type should be considered
 * "simple" or "significant" for redundancy detection, based on the
 * configured strictness and alwaysCovered lists.
 *
 * - In `strict` mode, all non-branch statements are eligible.
 * - In `moderate` mode (default), only statement types listed in
 *   `alwaysCovered` plus bare expression statements are treated as
 *   candidates for redundancy.
 * - In `permissive` mode, only `alwaysCovered` types are considered.
 *
 * This keeps REQ-STATEMENT-SIGNIFICANCE and REQ-CONFIGURABLE-STRICTNESS
 * aligned with the story's configuration model.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE REQ-CONFIGURABLE-STRICTNESS
 */
export function isStatementEligibleForRedundancy(
  node: any,
  options: RedundancyRuleOptions,
  branchTypes: readonly string[],
): boolean {
  if (!node || typeof node.type !== "string") {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE
    return false;
  }

  if (branchTypes.includes(node.type)) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE
    return false;
  }

  const alwaysCoveredSet = new Set(options.alwaysCovered);
  if (alwaysCoveredSet.has(node.type)) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE
    return true;
  }

  if (options.strictness === "permissive") {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-CONFIGURABLE-STRICTNESS
    return false;
  }

  if (options.strictness === "moderate") {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-CONFIGURABLE-STRICTNESS
    // Treat side-effecting expression statements (e.g. assignments or
    // simple calls) as eligible while still excluding more complex
    // control-flow constructs.
    return node.type === "ExpressionStatement";
  }

  // strict: any non-branch statement may be considered.
  return true;
}

/**
 * Compute the character range that should be removed when auto-fixing a
 * redundant annotation comment.
 *
 * The implementation is conservative to satisfy REQ-SAFE-REMOVAL:
 *
 * - When the comment occupies its own line (only whitespace before the
 *   comment token), the removal range is expanded to include that
 *   leading whitespace and the trailing newline, so the entire line is
 *   removed.
 * - When there is other code before the comment on the same line, only
 *   the comment text itself is removed, leaving surrounding code and
 *   whitespace intact.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
 */
// eslint-disable-next-line max-lines-per-function
export function getCommentRemovalRange(
  comment: any,
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
): [number, number] {
  const fullText = sourceCode.getText();
  const range: number[] | undefined = comment && comment.range;

  if (!Array.isArray(range) || range.length !== EXPECTED_RANGE_LENGTH) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
    return [0, 0];
  }

  let [start, end] = range as [number, number];

  // Find the start of the current line.
  let lineStart = start;
  while (lineStart > 0) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
    const ch = fullText.charAt(lineStart - 1);
    if (ch === "\n" || ch === "\r") {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
      break;
    }
    lineStart -= 1;
  }

  const leadingText = fullText.slice(lineStart, start);
  const onlyWhitespaceBeforeComment = leadingText.trim().length === 0;

  let removalStart = start;
  let removalEnd = end;

  if (onlyWhitespaceBeforeComment) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
    removalStart = lineStart;
  }

  while (removalEnd < fullText.length) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
    const ch = fullText.charAt(removalEnd);
    if (ch === " " || ch === "	") {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
      removalEnd += 1;
    } else {
      break;
    }
  }

  if (onlyWhitespaceBeforeComment && removalEnd < fullText.length) {
    // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
    const ch = fullText.charAt(removalEnd);
    if (ch === "\r") {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
      removalEnd += 1;
      if (fullText.charAt(removalEnd) === "\n") {
        // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
        removalEnd += 1;
      }
    } else if (ch === "\n") {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
      removalEnd += 1;
    }
  }

  return [removalStart, removalEnd];
}
