/* eslint-disable traceability/require-branch-annotation */

import type { Rule } from "eslint";
import { reportMissingAnnotations } from "./branch-annotation-report-helpers";
import { gatherLoopCommentText } from "./branch-annotation-loop-helpers";
import {
  gatherElseIfCommentText,
  isElseIfBranch,
  gatherSimpleIfCommentText,
} from "./branch-annotation-if-helpers";
import { gatherSwitchCaseCommentText } from "./branch-annotation-switch-helpers";
import { createStoryFixer } from "./branch-annotation-story-fix-helpers";
import {
  getInsideCatchCommentText,
  getInsideTryBlockCommentText,
} from "./branch-annotation-catch-helpers";
import { validateBranchTypes as validateBranchTypesImpl } from "./branch-validation";
import {
  extractCommentValue,
  collectCommentLine,
} from "./comment-text-helpers";

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
  return validateBranchTypesImpl(context, DEFAULT_BRANCH_TYPES);
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
 * Handle try/catch branch annotation gathering with inside-placement support.
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
function handleTryCatchBranch(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  const { annotationPlacement, beforeText } = context;

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

  return null;
}

/**
 * Handle loop branch annotation gathering with inside-placement support.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-ANNOTATION REQ-LOOP-PLACEMENT-FLEXIBLE
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES REQ-PLACEMENT-CONFIG
 */
function handleLoopBranch(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  const { annotationPlacement, beforeText } = context;

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
 * Helper that gathers comment text for non-IfStatement branch types using
 * straightforward behavior (SwitchCase, CatchClause, and loop statements).
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function gatherNonIfBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  context: { annotationPlacement: AnnotationPlacement; beforeText: string },
): string | null {
  if (node.type === "SwitchCase") {
    const { annotationPlacement, beforeText } = context;
    return gatherSwitchCaseCommentText(
      sourceCode,
      node,
      annotationPlacement,
      beforeText,
    );
  }

  const tryCatchResult = handleTryCatchBranch(sourceCode, node, context);
  if (tryCatchResult != null) {
    return tryCatchResult;
  }

  const loopResult = handleLoopBranch(sourceCode, node, context);
  if (loopResult != null) {
    return loopResult;
  }

  return null;
}

/**
 * Helper that gathers comment text for IfStatement branches, including both
 * simple if and else-if specific logic.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-DEFAULT-BACKWARD-COMPAT
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
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
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

/**
 * Public wrapper for internal branch comment text gathering dispatcher.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-COMMENT-ASSOCIATION
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
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
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
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
 * Report missing `@story` annotation tag on a branch node when that branch lacks a corresponding `@story` reference in its comments.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse `@story` and `@req` annotations from branch comments
 */
export function reportMissingStory(
  context: Rule.RuleContext,
  node: any,
  options: {
    indent: string;
    insertPos: number;
    storyFixCountRef: { count: number };
    annotationPlacement: AnnotationPlacement;
    sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>;
  },
): void {
  const {
    indent,
    insertPos,
    storyFixCountRef,
    annotationPlacement,
    sourceCode,
  } = options;
  /**
   * Conditional branch deciding whether to offer an auto-fix for the missing story.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   */
  if (storyFixCountRef.count === 0) {
    const insertStoryFixer = createStoryFixer({
      annotationPlacement,
      sourceCode,
      node,
      insertPos,
      indent,
    });

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
 * Report missing `@req` annotation tag on a branch node when that branch has no linked requirement identifier in its associated comments.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse `@story` and `@req` annotations from branch comments
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
   */
  if (!missingStory) {
    /**
     * Fixer that inserts a default `@req` tag above the branch.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
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
