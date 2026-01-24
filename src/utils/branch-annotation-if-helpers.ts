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
    // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
    return null;
  }
  if (!/^\s*(\/\/|\/\*)/.test(line)) {
    // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ANNOTATION-PARSING
    return null;
  }

  return line.trim();
}

/**
 * Detect whether a comment text includes any traceability annotations.
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function hasTraceabilityAnnotations(text: string): boolean {
  return (
    /@story\b/.test(text) || /@req\b/.test(text) || /@supports\b/.test(text)
  );
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
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
    return "";
  }

  const startLine = node.loc.start.line - 1;
  const comments: string[] = [];
  let i = startLine - 1;
  let scanned = 0;

  while (i >= 0 && scanned < PRE_COMMENT_OFFSET) {
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
    const commentText = getCommentTextAtLine(lines, i);
    if (!commentText) {
      // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
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
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC-ELSE-IF
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
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    const lineText = getCommentTextAtLine(lines, lineIndex);
    if (!lineText) {
      // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
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
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    return "";
  }

  const insideText = scanElseIfInsideBlockComments(sourceCode, node);
  if (insideText) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
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
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
    return beforeText;
  }

  if (beforeText && hasTraceabilityAnnotations(beforeText)) {
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-POSITION-PRIORITY-ELSE-IF
    return beforeText;
  }

  const beforeElseText = scanElseIfPrecedingComments(sourceCode, node);
  if (beforeElseText && hasTraceabilityAnnotations(beforeElseText)) {
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-POSITION-PRIORITY-ELSE-IF
    return beforeElseText;
  }

  if (!hasValidElseIfBlockLoc(node)) {
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC-ELSE-IF
    return beforeText;
  }

  const betweenText = scanElseIfBetweenConditionAndBody(sourceCode, node);
  if (betweenText && hasTraceabilityAnnotations(betweenText)) {
    // @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC-ELSE-IF
    return betweenText;
  }

  // For inside-placement mode, also accept annotations at the start of the
  // else-if block body as a last-resort position.
  const insideText = scanElseIfInsideBlockComments(sourceCode, node);
  if (insideText && hasTraceabilityAnnotations(insideText)) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    return insideText;
  }

  if (annotationPlacement === "inside" && insideText) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
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
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    return "";
  }

  try {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
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
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
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
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    return "";
  }

  const lines = sourceCode.lines;
  const startIndex = consequent.loc.start.line - 1;
  const endIndex = consequent.loc.end.line - 1;

  const comments: string[] = [];
  const lastIndex = Math.min(endIndex, lines.length - 1);
  let i = startIndex + 1;

  while (i <= lastIndex) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    const line = lines[i];
    if (!line || !line.trim() || !/^\s*(\/\/|\/\*)/.test(line)) {
      // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
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
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
    return beforeText;
  }

  if (!node.consequent || node.consequent.type !== "BlockStatement") {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES
    return "";
  }

  const consequent = node.consequent;

  const insideText = tryGetCommentsInsideNode(sourceCode, consequent);
  if (insideText) {
    // @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
    return insideText;
  }

  return scanBlockStartComments(sourceCode, consequent);
}
