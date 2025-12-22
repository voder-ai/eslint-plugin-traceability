/**
 * Inline comment processing for prefer-implements-annotation rule.
 * Handles migration of inline comment story and requirement patterns to supports format.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
import type { Rule } from "eslint";
import { normalizeCommentLine } from "../helpers/valid-annotation-format-internal";

export type LineComment = { type: "Line" } & any;

const MIN_STORY_TOKENS = 2;
const MIN_REQ_TOKENS = 2;

/**
 * Extract the leading whitespace and `//` prefix from a line comment's full
 * source text so that new inline annotations can be inserted with matching
 * indentation and formatting.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function getLinePrefixFromText(fullText: string): string {
  const match = fullText.match(/^(\s*\/\/\s*)/);
  return match ? match[1] : "";
}

/**
 * Attempt to construct an inline auto-fix that replaces a contiguous
 * sequence of `@story` and `@req` line comments with a single `@supports`
 * annotation while preserving the original comment prefix.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function tryBuildInlineAutoFix(
  context: Rule.RuleContext,
  comments: LineComment[],
  storyIndex: number,
  reqIndices: number[],
): Rule.ReportFixer | null {
  const sourceCode = context.getSourceCode();

  const storyComment = comments[storyIndex];
  const storyNormalized = normalizeCommentLine(storyComment.value || "");
  if (!storyNormalized || !/^@story\b/.test(storyNormalized)) {
    return null;
  }

  const storyParts = storyNormalized.split(/\s+/);
  if (storyParts.length !== MIN_STORY_TOKENS) {
    return null;
  }
  const storyPath = storyParts[1];

  const reqIds: string[] = [];
  for (const idx of reqIndices) {
    const reqComment = comments[idx];
    const reqNormalized = normalizeCommentLine(reqComment.value || "");
    if (!reqNormalized || !/^@req\b/.test(reqNormalized)) {
      return null;
    }
    const reqParts = reqNormalized.split(/\s+/);
    if (reqParts.length !== MIN_REQ_TOKENS) {
      return null;
    }
    reqIds.push(reqParts[1]);
  }

  if (!reqIds.length) {
    return null;
  }

  const fullText = sourceCode.text.slice(
    storyComment.range[0],
    storyComment.range[1],
  );
  const linePrefix = getLinePrefixFromText(fullText);

  const implAnnotation = `@supports ${storyPath} ${reqIds.join(" ")}`;
  const implLine = `${linePrefix}${implAnnotation}`;

  const start = storyComment.range[0];
  const end = comments[reqIndices[reqIndices.length - 1]].range[1];

  return (fixer) => fixer.replaceTextRange([start, end], implLine);
}

/**
 * Coordinate detection and optional migration of a single inline `@story`
 * comment and its following `@req` comments, reporting diagnostics and
 * scheduling auto-fixes where safe.
 *
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-MIGRATE-INLINE
 */
function collectReqIndicesAfterStory(
  group: LineComment[],
  startIndex: number,
): { reqIndices: number[]; nextIndex: number } {
  const n = group.length;
  const reqIndices: number[] = [];
  let j = startIndex + 1;

  while (j < n) {
    const next = group[j];
    const nextNormalized = normalizeCommentLine(next.value || "");
    if (!nextNormalized || /^@supports\b/.test(nextNormalized)) {
      break;
    }
    if (/^@req\b/.test(nextNormalized)) {
      reqIndices.push(j);
      j += 1;
      continue;
    }
    break;
  }

  return { reqIndices, nextIndex: j };
}

function handleInlineStorySequence(
  context: Rule.RuleContext,
  group: LineComment[],
  startIndex: number,
): number {
  const current = group[startIndex];
  const normalized = normalizeCommentLine(current.value || "");

  if (!normalized || !/^@story\b/.test(normalized)) {
    return startIndex + 1;
  }

  const { reqIndices, nextIndex } = collectReqIndicesAfterStory(
    group,
    startIndex,
  );

  if (reqIndices.length === 0) {
    return startIndex + 1;
  }

  const fix = tryBuildInlineAutoFix(context, group, startIndex, reqIndices);

  context.report({
    node: current as any,
    messageId: "preferImplements",
    fix: fix || undefined,
  });

  return nextIndex;
}

function advanceInlineGroupIndex(
  context: Rule.RuleContext,
  group: LineComment[],
  i: number,
): number {
  if (i >= group.length) {
    return i;
  }

  return handleInlineStorySequence(context, group, i);
}

function processInlineGroup(
  context: Rule.RuleContext,
  group: LineComment[],
): void {
  let i = 0;
  while (i < group.length) {
    i = advanceInlineGroupIndex(context, group, i);
  }
}

/**
 * Scan sequences of Line comments for inline legacy story and requirement patterns
 * and report diagnostics with optional auto-fixes.
 */
export function processInlineComments(
  context: Rule.RuleContext,
  lineComments: LineComment[],
): void {
  if (!lineComments.length) return;

  // Group by contiguous line numbers
  let group: LineComment[] = [lineComments[0]];

  const flushGroup = () => {
    processInlineGroup(context, group);
    group = [];
  };

  for (let idx = 1; idx < lineComments.length; idx++) {
    const prev = lineComments[idx - 1];
    const curr = lineComments[idx];
    if (
      curr.loc.start.line === prev.loc.start.line + 1 &&
      curr.loc.start.column === prev.loc.start.column
    ) {
      group.push(curr);
    } else {
      flushGroup();
      group.push(curr);
    }
  }
  flushGroup();
}
