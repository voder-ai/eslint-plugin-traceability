import type { Rule } from "eslint";
import {
  gatherBranchCommentText,
  reportMissingStory,
  reportMissingReq,
} from "./branch-annotation-helpers";

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

  if (line >= 1 && line <= lines.length) {
    const rawLine = lines[line - 1];
    indent = rawLine.match(/^(\s*)/)?.[1] || fallbackIndent;
  }

  const insertPos = sourceCode.getIndexFromLoc({
    line,
    column: 0,
  });

  return { indent, insertPos };
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function getBaseBranchIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): { indent: string; insertPos: number } {
  let { indent, insertPos } = getIndentAndInsertPosForLine(
    sourceCode,
    node.loc.start.line,
    "",
  );

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
 * Compute annotation-related metadata for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SUPPORTS-ALTERNATIVE
 */
function getBranchAnnotationInfo(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent?: any,
): {
  missingStory: boolean;
  missingReq: boolean;
  indent: string;
  insertPos: number;
} {
  const text = gatherBranchCommentText(sourceCode, node, parent);
  const hasSupports = /@supports\b/.test(text);
  const missingStory = !/@story\b/.test(text) && !hasSupports;
  const missingReq = !/@req\b/.test(text) && !hasSupports;

  let { indent, insertPos } = getBaseBranchIndentAndInsertPos(sourceCode, node);

  if (
    node.type === "IfStatement" &&
    parent &&
    parent.type === "IfStatement" &&
    parent.alternate === node &&
    node.consequent &&
    node.consequent.type === "BlockStatement" &&
    node.consequent.loc &&
    node.consequent.loc.start
  ) {
    const commentLine = node.consequent.loc.start.line + 1;
    const commentLineInfo = getIndentAndInsertPosForLine(
      sourceCode,
      commentLine,
      indent,
    );

    indent = commentLineInfo.indent;
    insertPos = commentLineInfo.insertPos;
  }

  return { missingStory, missingReq, indent, insertPos };
}

/**
 * Report missing annotations on a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 */
export function reportMissingAnnotations(
  context: Rule.RuleContext,
  node: any,
  storyFixCountRef: { count: number },
): void {
  const sourceCode = context.getSourceCode();

  const parent = (node as any).parent;

  const { missingStory, missingReq, indent, insertPos } =
    getBranchAnnotationInfo(sourceCode, node, parent);

  const actions: Array<{ missing: boolean; fn: Function; args: any[] }> = [
    {
      missing: missingStory,
      fn: reportMissingStory,
      args: [context, node, { indent, insertPos, storyFixCountRef }],
    },
    {
      missing: missingReq,
      fn: reportMissingReq,
      args: [context, node, { indent, insertPos, missingStory }],
    },
  ];

  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
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
