/* eslint-disable traceability/require-branch-annotation */

import type { Rule } from "eslint";
import {
  gatherBranchCommentText,
  reportMissingStory,
  reportMissingReq,
  AnnotationPlacement,
} from "./branch-annotation-helpers";
import {
  computeInsideBaseIndentAndInsertPos,
  applyInsidePlacementOverridesForBranch,
} from "./branch-annotation-indent-helpers";

/**
 * Compute indentation and insert position for the start of a given 1-based line
 * number. This keeps indentation and fixer insert positions consistent across
 * branch helpers that need to align auto-inserted comments with existing
 * source formatting.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ANNOTATION-PARSING
 */
function getIndentAndInsertPosForLine(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  line: number,
  fallbackIndent: string,
): { indent: string; insertPos: number } {
  const lines = sourceCode.lines;
  let indent = fallbackIndent;

  const safeLine =
    Array.isArray(lines) && lines.length > 0
      ? Math.min(Math.max(line, 1), lines.length)
      : 1;

  if (safeLine >= 1 && safeLine <= lines.length) {
    const rawLine = lines[safeLine - 1];
    indent = rawLine.match(/^(\s*)/)?.[1] || fallbackIndent;
  }

  const insertPos = sourceCode.getIndexFromLoc({
    line: safeLine,
    column: 0,
  });

  return { indent, insertPos };
}

/**
 * Compute indentation and insert position for the first "inner" line of a
 * BlockStatement, used for inside-brace insertion.
 * Falls back to the block's own line with one extra indent step if it has no
 * body statements.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-INDENTATION-CORRECT
 */
function getInsideBlockIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  blockNode: any,
  baseFallbackIndent: string,
): { indent: string; insertPos: number } {
  let indent = baseFallbackIndent;
  let insertPos = sourceCode.getIndexFromLoc({
    line: blockNode.loc.start.line,
    column: 0,
  });

  const bodyStatements: any[] | undefined = Array.isArray(blockNode.body)
    ? blockNode.body
    : undefined;
  const firstStatement: any | undefined =
    bodyStatements && bodyStatements.length > 0 ? bodyStatements[0] : undefined;

  if (firstStatement && firstStatement.loc && firstStatement.loc.start) {
    const firstLine = firstStatement.loc.start.line;
    const firstLineInfo = getIndentAndInsertPosForLine(
      sourceCode,
      firstLine,
      baseFallbackIndent,
    );
    indent = firstLineInfo.indent;
    insertPos = firstLineInfo.insertPos;
  } else if (blockNode.loc && blockNode.loc.start) {
    const blockLine = blockNode.loc.start.line;
    const blockLineInfo = getIndentAndInsertPosForLine(
      sourceCode,
      blockLine,
      baseFallbackIndent,
    );
    const innerIndent = `${blockLineInfo.indent}  `;
    indent = innerIndent;
    insertPos = blockLineInfo.insertPos;
  }

  return { indent, insertPos };
}

/**
 * Apply the base catch-clause indentation/insert-position fallback used by
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES REQ-INDENTATION-CORRECT
 * getBaseBranchIndentAndInsertPos when no inside-placement override is applied.
 */
function applyCatchClauseBaseIndentFallback(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  currentIndent: string,
  currentInsertPos: number,
): { indent: string; insertPos: number } {
  let indent = currentIndent;
  let insertPos = currentInsertPos;

  if (node.type === "CatchClause" && node.body) {
    const bodyNode: any = node.body;
    const bodyStatements: any[] | undefined = Array.isArray(bodyNode.body)
      ? bodyNode.body
      : undefined;
    const firstStatement: any | undefined =
      bodyStatements && bodyStatements.length > 0
        ? bodyStatements[0]
        : undefined;

    if (firstStatement && firstStatement.loc && firstStatement.loc.start) {
      const firstLine = firstStatement.loc.start.line;
      const firstLineInfo = getIndentAndInsertPosForLine(
        sourceCode,
        firstLine,
        "",
      );

      indent = firstLineInfo.indent;
      insertPos = firstLineInfo.insertPos;
    } else if (bodyNode.loc && bodyNode.loc.start) {
      const blockLine = bodyNode.loc.start.line;
      const blockLineInfo = getIndentAndInsertPosForLine(
        sourceCode,
        blockLine,
        "",
      );
      const innerIndent = `${blockLineInfo.indent}  `;

      indent = innerIndent;
      insertPos = blockLineInfo.insertPos;
    }
  }

  return { indent, insertPos };
}

/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function getBaseBranchIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  annotationPlacement: AnnotationPlacement,
): { indent: string; insertPos: number } {
  let { indent, insertPos } = getIndentAndInsertPosForLine(
    sourceCode,
    node.loc.start.line,
    "",
  );

  const indentHelpers = {
    getInsideBlockIndentAndInsertPos,
    getIndentAndInsertPosForLine,
  };

  const insideBase = computeInsideBaseIndentAndInsertPos(
    {
      sourceCode,
      node,
      annotationPlacement,
      currentIndent: indent,
    },
    indentHelpers,
  );
  if (insideBase) {
    return insideBase;
  }

  return applyCatchClauseBaseIndentFallback(
    sourceCode,
    node,
    indent,
    insertPos,
  );
}

type IfIndentContext = { indent: string; insertPos: number };

/**
 * Compute indentation and insertion point for inside-brace annotation placement
 * for IfStatement blocks.
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-INDENTATION-CORRECT
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-PRETTIER-AUTOFIX-ELSE-IF
 */
function getInsideIfBlockIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  blockNode: any,
  currentIndent: string,
): IfIndentContext {
  const blockStatements: any[] = Array.isArray(blockNode.body)
    ? blockNode.body
    : [];
  const firstStatement: any | undefined =
    blockStatements.length > 0 ? blockStatements[0] : undefined;

  if (firstStatement && firstStatement.loc && firstStatement.loc.start) {
    return getIndentAndInsertPosForLine(
      sourceCode,
      firstStatement.loc.start.line,
      currentIndent,
    );
  }

  const baseLineInfo = getIndentAndInsertPosForLine(
    sourceCode,
    blockNode.loc.start.line,
    currentIndent,
  );

  // Insert immediately after the opening brace when the block has no
  // statements (e.g. `if (x) {}`) to avoid out-of-range line lookups.
  const braceColumnAfter =
    blockNode.loc &&
    blockNode.loc.start &&
    typeof blockNode.loc.start.column === "number"
      ? blockNode.loc.start.column + 1
      : 0;

  return {
    indent: `${baseLineInfo.indent}  `,
    insertPos: sourceCode.getIndexFromLoc({
      line: blockNode.loc.start.line,
      column: braceColumnAfter,
    }),
  };
}

/**
 * Compute indentation and insert position for IfStatement branches, handling
 * both simple if and else-if cases, respecting the configured annotation
 * placement and indentation rules.
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG REQ-INDENTATION-CORRECT
 */
function getIfStatementIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  options: {
    parent: any | undefined;
    annotationPlacement: AnnotationPlacement;
  },
  context: IfIndentContext,
): IfIndentContext {
  const { annotationPlacement } = options;
  const { indent } = context;

  const hasBlockConsequent =
    node.consequent &&
    node.consequent.type === "BlockStatement" &&
    node.consequent.loc &&
    node.consequent.loc.start;

  if (!hasBlockConsequent) {
    return context;
  }

  if (annotationPlacement !== "inside") {
    return context;
  }

  const blockNode: any = node.consequent;
  const insideInfo = getInsideIfBlockIndentAndInsertPos(
    sourceCode,
    blockNode,
    indent,
  );

  context.indent = insideInfo.indent;
  context.insertPos = insideInfo.insertPos;

  return context;
}

/**
 * Compute which annotations are missing for a branch based on its gathered comment text.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function getBranchMissingFlags(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  annotationPlacement: AnnotationPlacement,
): { missingStory: boolean; missingReq: boolean } {
  const text = gatherBranchCommentText(
    sourceCode,
    node,
    parent,
    annotationPlacement,
  );
  const hasSupports = /@supports\b/.test(text);
  const missingStory = !/@story\b/.test(text) && !hasSupports;
  const missingReq = !/@req\b/.test(text) && !hasSupports;
  return { missingStory, missingReq };
}

/**
 * Compute indentation and insert position used for auto-fix insertion on a branch.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function getBranchIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  annotationPlacement: AnnotationPlacement,
): { indent: string; insertPos: number } {
  const base = getBaseBranchIndentAndInsertPos(
    sourceCode,
    node,
    annotationPlacement,
  );
  let { indent, insertPos } = base;

  if (node.type === "IfStatement") {
    const context: IfIndentContext = { indent, insertPos };
    const updatedContext = getIfStatementIndentAndInsertPos(
      sourceCode,
      node,
      { parent, annotationPlacement },
      context,
    );
    return {
      indent: updatedContext.indent,
      insertPos: updatedContext.insertPos,
    };
  }

  const indentHelpers = {
    getInsideBlockIndentAndInsertPos,
    getIndentAndInsertPosForLine,
  };

  const insideOverride = applyInsidePlacementOverridesForBranch(
    {
      sourceCode,
      node,
      indent,
      annotationPlacement,
    },
    indentHelpers,
  );
  if (insideOverride) {
    return insideOverride;
  }

  return { indent, insertPos };
}

/**
 * Compute annotation-related metadata for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse `@story` and `@req` annotations from branch comments
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function getBranchAnnotationInfo(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  annotationPlacement: AnnotationPlacement,
): {
  missingStory: boolean;
  missingReq: boolean;
  indent: string;
  insertPos: number;
} {
  const { missingStory, missingReq } = getBranchMissingFlags(
    sourceCode,
    node,
    parent,
    annotationPlacement,
  );
  const { indent, insertPos } = getBranchIndentAndInsertPos(
    sourceCode,
    node,
    parent,
    annotationPlacement,
  );
  return { missingStory, missingReq, indent, insertPos };
}
/**
 * Execute reporting actions for missing annotations on a branch.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ANNOTATION-PARSING
 */
function processMissingAnnotationActions(
  context: Rule.RuleContext,
  node: any,
  actions: Array<{ missing: boolean; fn: Function; args: any[] }>,
): void {
  /**
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ANNOTATION-PARSING
   */
  function processAction(item: {
    missing: boolean;
    fn: Function;
    args: any[];
  }) {
    if (item.missing) {
      item.fn(...item.args);
    }
  }

  actions.forEach(processAction);
}

/**
 * Report missing annotations on a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse `@story` and `@req` annotations from branch comments
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
export function reportMissingAnnotations(
  context: Rule.RuleContext,
  node: any,
  storyFixCountRef: { count: number },
): void {
  const sourceCode = context.getSourceCode();

  const rawOptions: any = context.options && context.options[0];
  const annotationPlacement: AnnotationPlacement =
    rawOptions &&
    (rawOptions.annotationPlacement === "inside" ||
      rawOptions.annotationPlacement === "before")
      ? rawOptions.annotationPlacement
      : "inside";

  const parent = (node as any).parent;

  const { missingStory, missingReq, indent, insertPos } =
    getBranchAnnotationInfo(sourceCode, node, parent, annotationPlacement);

  const actions: Array<{ missing: boolean; fn: Function; args: any[] }> = [
    {
      missing: missingStory,
      fn: reportMissingStory,
      args: [
        context,
        node,
        {
          indent,
          insertPos,
          storyFixCountRef,
          annotationPlacement,
          sourceCode,
        },
      ],
    },
    {
      missing: missingReq,
      fn: reportMissingReq,
      args: [context, node, { indent, insertPos, missingStory }],
    },
  ];

  processMissingAnnotationActions(context, node, actions);
}
