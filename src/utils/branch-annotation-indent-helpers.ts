/* eslint-disable traceability/require-traceability */

import type { Rule } from "eslint";
import type { AnnotationPlacement } from "./branch-annotation-helpers";

/**
 * Shared helpers for computing inside-brace indentation and insert positions
 * for branch nodes used by require-branch-annotation. This module isolates
 * the inside-placement logic so that the main report helpers stay small and
 * within ESLint's max-lines-per-function limits.
 *
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG REQ-INDENTATION-CORRECT
 */

type SourceCode = ReturnType<Rule.RuleContext["getSourceCode"]>;

type IndentHelperContext = {
  getInsideBlockIndentAndInsertPos: (
    _sourceCode: SourceCode,
    _blockNode: any,
    _baseFallbackIndent: string,
  ) => { indent: string; insertPos: number };
  getIndentAndInsertPosForLine: (
    _sourceCode: SourceCode,
    _line: number,
    _fallbackIndent: string,
  ) => { indent: string; insertPos: number };
};

type BranchIndentOptions = {
  sourceCode: SourceCode;
  node: any;
  indent: string;
};

function isLoopNode(node: any): boolean {
  return (
    node.type === "ForStatement" ||
    node.type === "ForInStatement" ||
    node.type === "ForOfStatement" ||
    node.type === "WhileStatement" ||
    node.type === "DoWhileStatement"
  );
}

function computeInsideCatchIndentAndInsertPos(
  sourceCode: SourceCode,
  node: any,
  currentIndent: string,
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  if (!(node.type === "CatchClause" && node.body)) {
    return null;
  }

  const bodyNode: any = node.body;
  if (!bodyNode.loc || !bodyNode.loc.start) {
    return null;
  }

  return context.getInsideBlockIndentAndInsertPos(
    sourceCode,
    bodyNode,
    currentIndent,
  );
}

function computeInsideLoopIndentAndInsertPos(
  options: BranchIndentOptions,
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  const { sourceCode, node, indent } = options;

  if (
    !isLoopNode(node) ||
    !node.body ||
    node.body.type !== "BlockStatement" ||
    !node.body.loc ||
    !node.body.loc.start
  ) {
    return null;
  }

  return context.getInsideBlockIndentAndInsertPos(
    sourceCode,
    node.body,
    indent,
  );
}

function computeInsideTryOrSwitchIndentAndInsertPos(
  sourceCode: SourceCode,
  node: any,
  currentIndent: string,
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  if (
    !(
      (node.type === "TryStatement" || node.type === "SwitchCase") &&
      node.consequent &&
      Array.isArray(node.consequent) &&
      node.consequent.length > 0
    )
  ) {
    return null;
  }

  const firstStatement = node.consequent[0];
  if (!firstStatement || !firstStatement.loc || !firstStatement.loc.start) {
    return null;
  }

  const commentLineInfo = context.getIndentAndInsertPosForLine(
    sourceCode,
    firstStatement.loc.start.line,
    currentIndent,
  );
  return {
    indent: commentLineInfo.indent,
    insertPos: commentLineInfo.insertPos,
  };
}

function computeInsideTryBlockIndentAndInsertPos(
  options: BranchIndentOptions,
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  const { sourceCode, node, indent } = options;

  if (
    !(
      node.type === "TryStatement" &&
      node.block &&
      node.block.type === "BlockStatement" &&
      node.block.loc &&
      node.block.loc.start
    )
  ) {
    return null;
  }

  return context.getInsideBlockIndentAndInsertPos(
    sourceCode,
    node.block,
    indent,
  );
}

function computeInsideSwitchCaseIndentAndInsertPos(
  options: BranchIndentOptions,
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  const { sourceCode, node, indent } = options;

  if (
    !(
      node.type === "SwitchCase" &&
      node.consequent &&
      Array.isArray(node.consequent) &&
      node.consequent.length > 0
    )
  ) {
    return null;
  }

  const firstStatement = node.consequent[0];
  if (!firstStatement || !firstStatement.loc || !firstStatement.loc.start) {
    return null;
  }

  // Prefer line-based helper for consistency with other callers.
  const commentLineInfo = context.getIndentAndInsertPosForLine(
    sourceCode,
    firstStatement.loc.start.line,
    indent,
  );
  return {
    indent: commentLineInfo.indent,
    insertPos: commentLineInfo.insertPos,
  };
}

function computeInsideCatchBlockIndentAndInsertPos(
  options: BranchIndentOptions,
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  const { sourceCode, node, indent } = options;

  if (
    !(
      node.type === "CatchClause" &&
      node.body &&
      node.body.type === "BlockStatement" &&
      node.body.loc &&
      node.body.loc.start
    )
  ) {
    return null;
  }

  return context.getInsideBlockIndentAndInsertPos(
    sourceCode,
    node.body,
    indent,
  );
}

/**
 * Inside-placement helper used by getBaseBranchIndentAndInsertPos to select the
 * correct inside-placement strategy for the base branch.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
export function computeInsideBaseIndentAndInsertPos(
  options: {
    sourceCode: SourceCode;
    node: any;
    annotationPlacement: AnnotationPlacement;
    currentIndent: string;
  },
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  const { sourceCode, node, annotationPlacement, currentIndent } = options;

  if (annotationPlacement !== "inside") {
    return null;
  }

  const catchInside = computeInsideCatchIndentAndInsertPos(
    sourceCode,
    node,
    currentIndent,
    context,
  );
  if (catchInside) {
    return catchInside;
  }

  const loopInside = computeInsideLoopIndentAndInsertPos(
    { sourceCode, node, indent: currentIndent },
    context,
  );
  if (loopInside) {
    return loopInside;
  }

  const tryOrSwitchInside = computeInsideTryOrSwitchIndentAndInsertPos(
    sourceCode,
    node,
    currentIndent,
    context,
  );
  if (tryOrSwitchInside) {
    return tryOrSwitchInside;
  }

  return null;
}

/**
 * Apply inside-placement overrides for non-if branches (switch, try, loops, catch).
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */
export function applyInsidePlacementOverridesForBranch(
  options: BranchIndentOptions & { annotationPlacement: AnnotationPlacement },
  context: IndentHelperContext,
): { indent: string; insertPos: number } | null {
  const { annotationPlacement } = options;

  if (annotationPlacement !== "inside") {
    return null;
  }

  const calculators = [
    computeInsideSwitchCaseIndentAndInsertPos,
    computeInsideTryBlockIndentAndInsertPos,
    computeInsideLoopIndentAndInsertPos,
    computeInsideCatchBlockIndentAndInsertPos,
  ];

  for (const calculator of calculators) {
    const result = calculator(options, context);
    if (result) {
      return result;
    }
  }

  return null;
}
