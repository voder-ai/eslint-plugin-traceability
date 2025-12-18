import type { Rule } from "eslint";
import { reportMissingAnnotations } from "./branch-annotation-report-helpers";
import { gatherLoopCommentText } from "./branch-annotation-loop-helpers";
import {
  gatherElseIfCommentText,
  isElseIfBranch,
} from "./branch-annotation-if-helpers";
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
 * Placement options for branch annotations relative to their associated branch.
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @req REQ-PLACEMENT-CONFIG - Allow configuration of annotation placement (before/inside)
 */
export type AnnotationPlacement = "before" | "inside";

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

function getInsideCatchCommentText(
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
function getInsideTryBlockCommentText(
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

/**
 * Gather annotation text for CatchClause nodes, supporting both before-catch and inside-catch positions.
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @req REQ-DUAL-POSITION-DETECTION
 * @req REQ-FALLBACK-LOGIC
 */
function gatherCatchClauseCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  annotationPlacement: AnnotationPlacement,
  beforeText: string,
): string {
  if (annotationPlacement === "inside") {
    const insideText = getInsideCatchCommentText(sourceCode, node);
    if (insideText) {
      return insideText;
    }
    return "";
  }

  if (
    /@story\b/.test(beforeText) ||
    /@req\b/.test(beforeText) ||
    /@supports\b/.test(beforeText)
  ) {
    return beforeText;
  }

  const insideText = getInsideCatchCommentText(sourceCode, node);
  if (insideText) {
    return insideText;
  }

  return beforeText;
}

/**
 * Gather annotation text for simple IfStatement branches, honoring the configured placement.
 * When placement is "before", this helper preserves the existing behavior by returning the
 * leading comment text unchanged. When placement is "inside", it switches to inside-brace
 * semantics and scans for comments at the top of the consequent block.
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports REQ-INSIDE-BRACE-PLACEMENT
 * @supports REQ-PLACEMENT-CONFIG
 * @supports REQ-DEFAULT-BACKWARD-COMPAT
 */
function gatherSimpleIfCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  annotationPlacement: AnnotationPlacement,
  beforeText: string,
): string {
  if (annotationPlacement === "before") {
    return beforeText;
  }

  if (annotationPlacement !== "inside") {
    return beforeText;
  }

  if (!node.consequent || node.consequent.type !== "BlockStatement") {
    return "";
  }

  const consequent = node.consequent;
  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;

  if (typeof getCommentsInside === "function") {
    try {
      const insideComments =
        (getCommentsInside as (_node: any) => any[])(consequent) || [];
      const insideText = insideComments.map(extractCommentValue).join(" ");
      if (insideText) {
        return insideText;
      }
    } catch {
      // fall through to line-based fallback
    }
  }

  if (
    consequent.loc &&
    consequent.loc.start &&
    consequent.loc.end &&
    typeof consequent.loc.start.line === "number" &&
    typeof consequent.loc.end.line === "number"
  ) {
    const lines = sourceCode.lines;
    const startIndex = consequent.loc.start.line - 1;
    const endIndex = consequent.loc.end.line - 1;

    const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
    if (insideText) {
      return insideText;
    }
  }

  return "";
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
 * Helper that gathers comment text for non-IfStatement branch types using
 * straightforward behavior (SwitchCase, CatchClause, and loop statements).
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports REQ-COMMENT-ASSOCIATION
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports REQ-PLACEMENT-CONFIG
 */
function gatherNonIfBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  const { annotationPlacement, beforeText } = context;

  if (node.type === "SwitchCase") {
    return gatherSwitchCaseCommentText(sourceCode, node);
  }

  if (node.type === "TryStatement") {
    if (annotationPlacement === "inside") {
      const insideText = getInsideTryBlockCommentText(sourceCode, node);
      if (insideText) {
        return insideText;
      }
      return "";
    }
    return beforeText;
  }

  if (node.type === "CatchClause") {
    return gatherCatchClauseCommentText(
      sourceCode,
      node,
      annotationPlacement,
      beforeText,
    );
  }

  if (
    node.type === "ForStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement" ||
    node.type === "WhileStatement" ||
    node.type === "DoWhileStatement"
  ) {
    return gatherLoopCommentText(
      sourceCode,
      node,
      annotationPlacement,
      beforeText,
    );
  }

  return null;
}

/**
 * Helper that gathers comment text for IfStatement branches, including both
 * simple if and else-if specific logic.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports REQ-COMMENT-ASSOCIATION
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports REQ-PLACEMENT-CONFIG
 * @supports REQ-DEFAULT-BACKWARD-COMPAT
 */
function gatherIfBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  const { annotationPlacement, beforeText } = context;

  if (node.type !== "IfStatement") {
    return null;
  }

  if (isElseIfBranch(node, parent)) {
    return gatherElseIfCommentText(sourceCode, node, parent, {
      annotationPlacement,
      beforeText,
    });
  }

  return gatherSimpleIfCommentText(
    sourceCode,
    node,
    annotationPlacement,
    beforeText,
  );
}

/**
 * Internal helper that performs type-based dispatch for gathering branch comment text.
 * This keeps the public gatherBranchCommentTextByType wrapper small for ESLint limits.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports REQ-COMMENT-ASSOCIATION
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports REQ-PLACEMENT-CONFIG
 */
function gatherBranchCommentTextByTypeInternal(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  const nonIfResult = gatherNonIfBranchCommentText(sourceCode, node, context);
  if (nonIfResult != null) {
    return nonIfResult;
  }

  const ifResult = gatherIfBranchCommentText(sourceCode, node, parent, context);
  if (ifResult != null) {
    return ifResult;
  }

  return null;
}

function gatherBranchCommentTextByType(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  return gatherBranchCommentTextByTypeInternal(
    sourceCode,
    node,
    parent,
    context,
  );
}

/**
 * Gather leading comment text for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Associate inline comments with their corresponding code branches
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
export function gatherBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent?: any,
  annotationPlacement: AnnotationPlacement = "before",
): string {
  const beforeComments = sourceCode.getCommentsBefore(node) || [];
  const beforeText = beforeComments.map(extractCommentValue).join(" ");

  const handled = gatherBranchCommentTextByType(sourceCode, node, parent, {
    annotationPlacement,
    beforeText,
  });

  if (handled != null) {
    return handled;
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
