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

export function isElseIfBranch(node: any, parent: any | undefined): boolean {
  return (
    node &&
    node.type === "IfStatement" &&
    parent &&
    parent.type === "IfStatement" &&
    parent.alternate === node
  );
}

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
