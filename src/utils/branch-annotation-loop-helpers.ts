import type { Rule } from "eslint";
import {
  scanCommentLinesInRange,
  type AnnotationPlacement,
} from "./branch-annotation-helpers";

/**
 * Extract any traceability comment text from inside a loop body.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-PLACEMENT-FLEXIBLE REQ-LOOP-ANNOTATION
 */
function getInsideLoopCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const body = node.body;
  // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-ANNOTATION
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
    // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-ANNOTATION
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
  // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-PLACEMENT-FLEXIBLE
  if (annotationPlacement === "inside") {
    const insideText = getInsideLoopCommentText(sourceCode, node);
    // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-PLACEMENT-FLEXIBLE
    if (insideText) {
      return insideText;
    }
    return "";
  }

  // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-ANNOTATION
  if (
    /@story\b/.test(beforeText) ||
    /@req\b/.test(beforeText) ||
    /@supports\b/.test(beforeText)
  ) {
    return beforeText;
  }

  const insideText = getInsideLoopCommentText(sourceCode, node);
  // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-LOOP-PLACEMENT-FLEXIBLE
  if (insideText) {
    return insideText;
  }

  return beforeText;
}
