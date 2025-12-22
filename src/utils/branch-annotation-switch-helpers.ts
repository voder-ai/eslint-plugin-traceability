/* eslint-disable traceability/valid-annotation-format */
import type { Rule } from "eslint";
import {
  scanCommentLinesInRange,
  type AnnotationPlacement,
} from "./branch-annotation-helpers";

/**
 * Gather comment text from the first contiguous comment lines "inside" a SwitchCase body.
 * Prefers a BlockStatement consequent when present, with a fallback to the entire case range.
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 */
function getInsideSwitchCaseCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const lines = sourceCode.lines;

  const firstConsequent = node.consequent && node.consequent[0];
  if (
    firstConsequent &&
    firstConsequent.type === "BlockStatement" &&
    firstConsequent.loc &&
    firstConsequent.loc.start &&
    firstConsequent.loc.end &&
    typeof firstConsequent.loc.start.line === "number" &&
    typeof firstConsequent.loc.end.line === "number"
  ) {
    const startIndex = firstConsequent.loc.start.line - 1;
    const endIndex = firstConsequent.loc.end.line - 1;
    const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
    if (insideText) {
      return insideText;
    }
    return "";
  }

  if (
    node.loc &&
    node.loc.start &&
    node.loc.end &&
    typeof node.loc.start.line === "number" &&
    typeof node.loc.end.line === "number"
  ) {
    const startIndex = node.loc.start.line - 1;
    const endIndex = node.loc.end.line - 1;
    const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
    if (insideText) {
      return insideText;
    }
  }

  return "";
}

/**
 * Gather annotation text for SwitchCase branches, honoring the configured placement
 * while preserving legacy before-branch behavior in the default mode.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT
 * @param sourceCode - ESLint source code object for accessing line/comment data
 * @param node - SwitchCase AST node to gather annotations from
 * @param annotationPlacement - Placement mode ("inside" or "before")
 * @param beforeText - Pre-gathered text from before the case statement
 * @returns Combined annotation text based on placement mode and detected annotations
 */
export function gatherSwitchCaseCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  annotationPlacement: AnnotationPlacement,
  beforeText: string,
): string {
  if (annotationPlacement === "inside") {
    const insideText = getInsideSwitchCaseCommentText(sourceCode, node);
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

  // In before-placement mode, rely on the caller's beforeText and any
  // configured PRE_COMMENT_OFFSET logic in the main helpers module.
  return beforeText;
}
