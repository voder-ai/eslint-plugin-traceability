import type { Rule } from "eslint";
import { reportMissingAnnotations } from "./branch-annotation-report-helpers";
import { gatherLoopCommentText } from "./branch-annotation-loop-helpers";
const PRE_COMMENT_OFFSET = 2; // number of lines above branch to inspect for comments

/**
 * Valid branch types for require-branch-annotation rule.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-SIGNIFICANCE-CRITERIA - Define criteria for which branches require annotations
 */
export const DEFAULT_BRANCH_TYPES = [
  "IfStatement",
  "SwitchCase",
  "TryStatement",
  "CatchClause",
  "ForStatement",
  "ForOfStatement",
  "ForInStatement",
  "WhileStatement",
  "DoWhileStatement",
] as const;

/**
 * Type for branch nodes supported by require-branch-annotation rule.
 */
export type BranchType = (typeof DEFAULT_BRANCH_TYPES)[number];

/**
 * Validate branchTypes configuration option and return branch types to enforce,
 * or return an ESLint listener if configuration is invalid.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement
 */
export function validateBranchTypes(
  context: Rule.RuleContext,
): BranchType[] | Rule.RuleListener {
  const options: any = context.options[0] || {};

  /**
   * Conditional branch checking whether branchTypes option was provided.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-CONDITIONAL - Trace configuration branch existence check
   */
  if (Array.isArray(options.branchTypes)) {
    /**
     * Predicate to determine whether a provided branch type is invalid.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FILTER-CALLBACK - Trace filter callback for invalid branch type detection
     */
    function isInvalidType(t: any): boolean {
      return !DEFAULT_BRANCH_TYPES.includes(t as BranchType);
    }

    const invalidTypes = options.branchTypes.filter(isInvalidType);
    /**
     * Conditional branch checking whether any invalid types were found.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-INVALID-DETECTION - Trace handling when invalid types are detected
     */
    if (invalidTypes.length > 0) {
      /**
       * Program listener produced when configuration is invalid.
       * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
       * @req REQ-TRACEABILITY-PROGRAM-LISTENER - Trace Program listener reporting invalid config values
       */
      function ProgramHandler(node: any) {
        /**
         * Report a single invalid type for the given Program node.
         * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
         * @req REQ-TRACEABILITY-FOR-EACH-CALLBACK - Trace reporting for each invalid type
         */
        function reportInvalidType(t: any) {
          context.report({
            node,
            message: `Value "${t}" should be equal to one of the allowed values: ${DEFAULT_BRANCH_TYPES.join(
              ", ",
            )}`,
          });
        }
        invalidTypes.forEach(reportInvalidType);
      }
      return { Program: ProgramHandler };
    }
  }

  return Array.isArray(options.branchTypes)
    ? (options.branchTypes as BranchType[])
    : Array.from(DEFAULT_BRANCH_TYPES);
}

/**
 * Extract the raw value from a comment node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-TRACEABILITY-MAP-CALLBACK - Trace mapping of comment nodes to their text values
 */
function extractCommentValue(_c: any): string {
  return _c.value;
}

/**
 * Extract trimmed comment text for a given source line index or return null
 * when the line is blank or not a comment. This helper centralizes the
 * formatter-aware rules used by branch helpers when scanning for contiguous
 * comment lines around branches.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
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
 * Collect a single contiguous comment line at the given index, appending its
 * trimmed text to the accumulator. Returns true when a valid comment was
 * collected and false when scanning should stop (blank or non-comment line).
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF
 */
function collectCommentLine(
  lines: string[],
  index: number,
  comments: string[],
): boolean {
  const commentText = getCommentTextAtLine(lines, index);
  if (!commentText) {
    return false;
  }

  comments.push(commentText);
  return true;
}

/**
 * Scan contiguous formatter-aware comment lines between the provided 0-based
 * start and end indices (inclusive), stopping when a non-comment or blank line
 * is encountered. This helper is used as a line-based fallback when
 * structured comment APIs are not available for branch bodies.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-FALLBACK-LOGIC-ELSE-IF
 */
export function scanCommentLinesInRange(
  lines: string[],
  startIndex: number,
  endIndexInclusive: number,
): string {
  if (!Array.isArray(lines) || lines.length === 0) {
    return "";
  }

  if (
    startIndex < 0 ||
    startIndex >= lines.length ||
    startIndex > endIndexInclusive
  ) {
    return "";
  }

  const comments: string[] = [];
  const lastIndex = Math.min(endIndexInclusive, lines.length - 1);
  let i = startIndex;

  while (i <= lastIndex) {
    if (!collectCommentLine(lines, i, comments)) {
      break;
    }
    i++;
  }

  return comments.join(" ");
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function isElseIfBranch(node: any, parent: any | undefined): boolean {
  return (
    node &&
    node.type === "IfStatement" &&
    parent &&
    parent.type === "IfStatement" &&
    parent.alternate === node
  );
}
/**
 * Gather annotation text for CatchClause nodes, supporting both before-catch and inside-catch positions.
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @req REQ-DUAL-POSITION-DETECTION
 * @req REQ-FALLBACK-LOGIC
 */
function gatherCatchClauseCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  beforeText: string,
): string {
  if (/@story\b/.test(beforeText) || /@req\b/.test(beforeText)) {
    return beforeText;
  }

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

  return beforeText;
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function scanElseIfPrecedingComments(
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

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function hasValidElseIfBlockLoc(node: any): boolean {
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

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function scanElseIfBetweenConditionAndBody(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;
  const conditionEndLine: number = node.test.loc.end.line;
  const consequentStartLine: number = node.consequent.loc.start.line;

  // Lines in sourceCode are 0-based indexes, but loc.line values are 1-based.
  // We want to scan comments strictly between the condition and the
  // consequent body, so we start at the line after the condition's end and
  // stop at the line immediately before the consequent's starting line.
  const startIndex = conditionEndLine; // already the next logical line index when 0-based
  const endIndexExclusive = consequentStartLine - 1;

  if (endIndexExclusive <= startIndex) {
    return "";
  }

  return scanCommentLinesInRange(lines, startIndex, endIndexExclusive - 1);
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function scanElseIfInsideBlockComments(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;
  const consequentStartLine: number = node.consequent.loc.start.line;

  const comments: string[] = [];
  // Intentionally start from the block's start line (using the same 1-based line value as provided by the parser)
  // so that, when indexing into sourceCode.lines, this corresponds to the first logical line inside the block body
  // for typical formatter layouts.
  let lineIndex = consequentStartLine;

  while (lineIndex < lines.length) {
    if (!collectCommentLine(lines, lineIndex, comments)) {
      break;
    }
    lineIndex++;
  }

  return comments.join(" ");
}

/**
 * Gather annotation text for IfStatement else-if branches, supporting comments placed
 * before the else keyword, between the else-if condition and the consequent body,
 * and in the first comment-only lines inside the consequent block body.
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 * @supports REQ-FALLBACK-LOGIC
 */
function gatherElseIfCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  beforeText: string,
): string {
  if (
    beforeText &&
    (/@story\b/.test(beforeText) ||
      /@req\b/.test(beforeText) ||
      /@supports\b/.test(beforeText))
  ) {
    return beforeText;
  }

  if (!isElseIfBranch(node, parent)) {
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

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function gatherSwitchCaseCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;
  const startLine = node.loc.start.line;
  let i = startLine - PRE_COMMENT_OFFSET;
  const comments: string[] = [];
  while (i >= 0 && /^\s*(\/\/|\/\*)/.test(lines[i])) {
    comments.unshift(lines[i].trim());
    i--;
  }
  return comments.join(" ");
}

/**
 * Gather leading comment text for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Associate inline comments with their corresponding code branches
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 */
export function gatherBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent?: any,
): string {
  /**
   * Conditional branch for SwitchCase nodes that may include inline comments.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-SWITCHCASE-COMMENTS - Trace collection of preceding comments for SwitchCase
   */
  if (node.type === "SwitchCase") {
    return gatherSwitchCaseCommentText(sourceCode, node);
  }

  const beforeComments = sourceCode.getCommentsBefore(node) || [];
  const beforeText = beforeComments.map(extractCommentValue).join(" ");

  if (node.type === "CatchClause") {
    return gatherCatchClauseCommentText(sourceCode, node, beforeText);
  }

  /**
   * Conditional branch for IfStatement else-if nodes that may include inline comments
   * after the else-if condition but before the consequent body.
   * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
   * @supports REQ-DUAL-POSITION-DETECTION
   */
  if (node.type === "IfStatement") {
    return gatherElseIfCommentText(sourceCode, node, parent, beforeText);
  }

  /**
   * Conditional branch for loop nodes that may include annotations either on the loop
   * statement itself or at the top of the loop body, allowing flexible placement.
   * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-ANNOTATION REQ-LOOP-PLACEMENT-FLEXIBLE
   */
  if (
    node.type === "ForStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement" ||
    node.type === "WhileStatement" ||
    node.type === "DoWhileStatement"
  ) {
    return gatherLoopCommentText(sourceCode, node, beforeText);
  }

  return beforeText;
}

/**
 * Report missing @story annotation tag on a branch node when that branch lacks a corresponding @story reference in its comments.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
export function reportMissingStory(
  context: Rule.RuleContext,
  node: any,
  options: {
    indent: string;
    insertPos: number;
    storyFixCountRef: { count: number };
  },
): void {
  const { indent, insertPos, storyFixCountRef } = options;
  /**
   * Conditional branch deciding whether to offer an auto-fix for the missing story.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-FIX-DECISION - Trace decision to provide fixer for missing @story
   */
  if (storyFixCountRef.count === 0) {
    /**
     * Fixer that inserts a default @story tag above the branch.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FIX-ARROW - Trace fixer function used to insert missing @story
     */
    function insertStoryFixer(fixer: any) {
      return fixer.insertTextBeforeRange(
        [insertPos, insertPos],
        `${indent}// @story <story-file>.story.md\n`,
      );
    }

    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@story" },
      fix: insertStoryFixer,
    });
    storyFixCountRef.count++;
  } else {
    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@story" },
    });
  }
}

/**
 * Report missing @req annotation tag on a branch node when that branch has no linked requirement identifier in its associated comments.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
export function reportMissingReq(
  context: Rule.RuleContext,
  node: any,
  options: { indent: string; insertPos: number; missingStory: boolean },
): void {
  const { indent, insertPos, missingStory } = options;
  /**
   * Conditional branch deciding whether to offer an auto-fix for the missing req.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-FIX-DECISION - Trace decision to provide fixer for missing @req
   */
  if (!missingStory) {
    /**
     * Fixer that inserts a default @req tag above the branch.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FIX-ARROW - Trace fixer function used to insert missing @req
     */
    function insertReqFixer(fxer: any) {
      return fxer.insertTextBeforeRange(
        [insertPos, insertPos],
        `${indent}// @req <REQ-ID>\n`,
      );
    }

    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@req" },
      fix: insertReqFixer,
    });
  } else {
    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@req" },
    });
  }
}

export { reportMissingAnnotations };
