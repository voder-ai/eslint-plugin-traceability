import type { Rule } from "eslint";
import { scanCommentLinesInRange } from "./branch-annotation-helpers";
import { extractCommentValue } from "./comment-text-helpers";

/**
 * Gather comment text from inside a CatchClause body.
 *
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @req REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 */
export function getInsideCatchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;
  if (node.body && typeof getCommentsInside === "function") {
    try {
      const insideComments =
        (getCommentsInside as (_node: any) => any[])(node.body) || [];
      const insideText = insideComments.map(extractCommentValue).join(" ");
      if (insideText) {
        return insideText;
      }
    } catch {
      // fall through to line-based fallback
    }
  }

  if (node.body && node.body.loc && node.body.loc.start && node.body.loc.end) {
    const lines = sourceCode.lines;
    const startIndex = node.body.loc.start.line - 1;
    const endIndex = node.body.loc.end.line - 1;

    const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
    if (insideText) {
      return insideText;
    }
  }

  return "";
}

/**
 * Gather comment text from the first contiguous comment lines inside a TryStatement block body.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
export function getInsideTryBlockCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const block = node && node.block;
  if (
    !block ||
    block.type !== "BlockStatement" ||
    !block.loc ||
    !block.loc.start ||
    !block.loc.end ||
    typeof block.loc.start.line !== "number" ||
    typeof block.loc.end.line !== "number"
  ) {
    return "";
  }

  const lines = sourceCode.lines;
  const startIndex = block.loc.start.line - 1;
  const endIndex = block.loc.end.line - 1;

  const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
  if (insideText) {
    return insideText;
  }

  return "";
}
