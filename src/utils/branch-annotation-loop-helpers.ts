import type { Rule } from "eslint";
import {
  scanCommentLinesInRange,
  type AnnotationPlacement,
} from "./branch-annotation-helpers";

function getInsideLoopCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const body = node.body;
  if (
    body &&
    body.type === "BlockStatement" &&
    body.loc &&
    body.loc.start &&
    body.loc.end
  ) {
    const lines = sourceCode.lines;
    const startIndex = body.loc.start.line; // first line inside block body (start.line is 1-based)
    const endIndex = body.loc.end.line - 1;

    const insideText = scanCommentLinesInRange(lines, startIndex, endIndex);
    if (
      insideText &&
      (/@story\b/.test(insideText) ||
        /@req\b/.test(insideText) ||
        /@supports\b/.test(insideText))
    ) {
      return insideText;
    }
  }

  return "";
}

/**
 * Gather annotation text for loop branches, supporting annotations either on the
 * loop statement itself or on the first comment lines inside the loop body.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-LOOP-ANNOTATION
 * @req REQ-LOOP-PLACEMENT-FLEXIBLE
 */
export function gatherLoopCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  annotationPlacement: AnnotationPlacement,
  beforeText: string,
): string {
  if (annotationPlacement === "inside") {
    const insideText = getInsideLoopCommentText(sourceCode, node);
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

  const insideText = getInsideLoopCommentText(sourceCode, node);
  if (insideText) {
    return insideText;
  }

  return beforeText;
}
