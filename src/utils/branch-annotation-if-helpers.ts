import type { Rule } from "eslint";
import type { AnnotationPlacement } from "./branch-annotation-helpers";
import { scanCommentLinesInRange } from "./branch-annotation-helpers";

/**
 * Small shared helpers for IfStatement/else-if specific annotation handling.
 * Extracted from branch-annotation-helpers to keep that file within ESLint
 * max-lines limits while preserving behaviour.
 *
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 */

const PRE_COMMENT_OFFSET = 2; // kept in sync with main helpers

/**
 * Retrieve trimmed comment text for a given source line.
 * Used for associating inline branch-annotation comments with control-flow nodes.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION REQ-ANNOTATION-PARSING
 */
function getCommentTextAtLine(lines: string[], index: number): string | null {
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
 * Detect whether an IfStatement is an else-if branch of its parent.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-BRANCH-DETECTION
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
 */
export function isElseIfBranch(node: any, parent: any | undefined): boolean {
  return (
    node &&
    node.type === "IfStatement" &&
    parent &&
    parent.type === "IfStatement" &&
    parent.alternate === node
  );
}

/**
 * Guard helper ensuring the else-if node has the loc/range details we need to scan
 * between the condition and the consequent body.
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
 */
export function hasValidElseIfBlockLoc(node: any): boolean {
  const hasBlockConsequent =
    node.consequent &&
    node.consequent.type === "BlockStatement" &&
    node.consequent.loc &&
    node.consequent.loc.start;

  return !!(
    node.test &&
    node.test.loc &&
    node.test.loc.end &&
    hasBlockConsequent
  );
}

/**
 * Scan for annotation comments immediately preceding the else-if line.
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-POSITION-PRIORITY-ELSE-IF
 */
export function scanElseIfPrecedingComments(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;

  if (!node.loc || !node.loc.start || typeof node.loc.start.line !== "number") {
    return "";
  }

  const startLine = node.loc.start.line - 1;
  const comments: string[] = [];
  let i = startLine - 1;
  let scanned = 0;

  while (i >= 0 && scanned < PRE_COMMENT_OFFSET) {
    const commentText = getCommentTextAtLine(lines, i);
    if (!commentText) {
      break;
    }

    comments.unshift(commentText);
    i--;
    scanned++;
  }

  return comments.join(" ");
}

/**
 * Scan for annotation comments between the else-if condition and the consequent.
 * This is used as a fallback position when no annotations exist before the else-if keyword.
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC-ELSE-IF REQ-DUAL-POSITION-DETECTION-ELSE-IF
 */
export function scanElseIfBetweenConditionAndBody(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;
  const conditionEndLine: number = node.test.loc.end.line;
  const consequentStartLine: number = node.consequent.loc.start.line;

  const startIndex = conditionEndLine;
  const endIndexExclusive = consequentStartLine - 1;

  if (endIndexExclusive <= startIndex) {
    return "";
  }

  return scanCommentLinesInRange(lines, startIndex, endIndexExclusive - 1);
}

/**
 * Scan for annotation comments at the start of a BlockStatement consequent.
 * Used when `annotationPlacement: "inside"` is enabled.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-ALL-BLOCK-TYPES
 */
export function scanElseIfInsideBlockComments(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;
  const consequentStartLine: number = node.consequent.loc.start.line;

  const comments: string[] = [];
  let lineIndex = consequentStartLine;

  while (lineIndex < lines.length) {
    const lineText = getCommentTextAtLine(lines, lineIndex);
    if (!lineText) {
      break;
    }
    comments.push(lineText);
    lineIndex++;
  }

  return comments.join(" ");
}

/**
 * Retrieve else-if branch annotation text when inside-brace placement is active.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
export function getInsideElseIfCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  if (!hasValidElseIfBlockLoc(node)) {
    return "";
  }

  const insideText = scanElseIfInsideBlockComments(sourceCode, node);
  if (insideText) {
    return insideText;
  }

  return "";
}

/**
 * Gather the most relevant comment text for else-if branches, respecting the
 * configured annotation placement and else-if position priority rules.
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF REQ-POSITION-PRIORITY-ELSE-IF
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
export function gatherElseIfCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  options: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string {
  const { annotationPlacement, beforeText } = options;

  if (!isElseIfBranch(node, parent)) {
    return beforeText;
  }

  if (annotationPlacement === "inside") {
    return getInsideElseIfCommentText(sourceCode, node);
  }

  if (
    beforeText &&
    (/@story\b/.test(beforeText) ||
      /@req\b/.test(beforeText) ||
      /@supports\b/.test(beforeText))
  ) {
    return beforeText;
  }

  const beforeElseText = scanElseIfPrecedingComments(sourceCode, node);
  if (
    beforeElseText &&
    (/@story\b/.test(beforeElseText) ||
      /@req\b/.test(beforeElseText) ||
      /@supports\b/.test(beforeElseText))
  ) {
    return beforeElseText;
  }

  if (!hasValidElseIfBlockLoc(node)) {
    return beforeText;
  }

  const betweenText = scanElseIfBetweenConditionAndBody(sourceCode, node);
  if (betweenText) {
    return betweenText;
  }

  const insideText = scanElseIfInsideBlockComments(sourceCode, node);
  if (insideText) {
    return insideText;
  }

  return beforeText;
}
/**
 * Try to get comments from inside a node using getCommentsInside if available.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-ALL-BLOCK-TYPES
 */
function tryGetCommentsInsideNode(sourceCode: any, consequent: any): string {
  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;

  if (typeof getCommentsInside !== "function") {
    return "";
  }

  try {
    const insideComments =
      (getCommentsInside as (_node: any) => any[])(consequent) || [];
    /**
     * Extract the raw string value for a comment token.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ANNOTATION-PARSING
     */
    function extractCommentValue(c: any) {
      return c.value;
    }
    return insideComments.map(extractCommentValue).join(" ");
  } catch {
    return "";
  }
}

/**
 * Scan for comments at the start of a block using line-based fallback.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-ALL-BLOCK-TYPES
 */
function scanBlockStartComments(sourceCode: any, consequent: any): string {
  if (
    !consequent.loc ||
    !consequent.loc.start ||
    !consequent.loc.end ||
    typeof consequent.loc.start.line !== "number" ||
    typeof consequent.loc.end.line !== "number"
  ) {
    return "";
  }

  const lines = sourceCode.lines;
  const startIndex = consequent.loc.start.line - 1;
  const endIndex = consequent.loc.end.line - 1;

  const comments: string[] = [];
  const lastIndex = Math.min(endIndex, lines.length - 1);
  let i = startIndex + 1;

  while (i <= lastIndex) {
    const line = lines[i];
    if (!line || !line.trim() || !/^\s*(\/\/|\/\*)/.test(line)) {
      break;
    }
    comments.push(line.trim());
    i++;
  }

  return comments.join(" ");
}

/**
 * Gather comment text for a simple (non-else-if) if statement, optionally
 * using inside-brace placement semantics.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-INSIDE-BRACE-PLACEMENT REQ-ALL-BLOCK-TYPES
 */
export function gatherSimpleIfCommentText(
  sourceCode: any,
  node: any,
  annotationPlacement: "before" | "inside",
  beforeText: string,
): string {
  if (annotationPlacement !== "inside") {
    return beforeText;
  }

  if (!node.consequent || node.consequent.type !== "BlockStatement") {
    return "";
  }

  const consequent = node.consequent;

  const insideText = tryGetCommentsInsideNode(sourceCode, consequent);
  if (insideText) {
    return insideText;
  }

  return scanBlockStartComments(sourceCode, consequent);
}
