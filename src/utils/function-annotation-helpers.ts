/* eslint-disable traceability/require-branch-annotation */

import type { Rule } from "eslint";
import { scanCommentLinesInRange } from "./branch-annotation-helpers";

/**
 * Helpers for determining function-body annotation placement.
 *
 * These utilities are shared between the function-level traceability rules
 * (require-story-annotation, require-req-annotation) so they can honour the
 * same "inside" placement semantics used by branch rules when
 * `annotationPlacement: "inside"` is configured.
 *
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES REQ-INSIDE-BRACE-PLACEMENT REQ-PLACEMENT-CONFIG
 */

/**
 * Locate the BlockStatement that represents the executable body of a
 * function-like construct. Returns null when the node has no block body
 * (for example, TypeScript declarations or arrow functions with
 * expression bodies).
 *
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES
 */
function getFunctionBodyBlock(node: any): any | null {
  if (!node || typeof node.type !== "string") {
    return null;
  }

  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    const body = (node as any).body;
    return body && body.type === "BlockStatement" ? body : null;
  }

  if (node.type === "MethodDefinition") {
    const value = (node as any).value;
    if (value && value.type === "FunctionExpression") {
      const body = value.body;
      return body && body.type === "BlockStatement" ? body : null;
    }
  }

  return null;
}

/**
 * Determine whether a function-like node can support inside-brace
 * placement semantics. Only nodes with a concrete BlockStatement body are
 * eligible; TypeScript declarations and signature-only nodes are
 * intentionally excluded.
 *
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-ALL-BLOCK-TYPES
 */
export function supportsInsidePlacementForFunction(node: any): boolean {
  return !!getFunctionBodyBlock(node);
}

/**
 * Gather the concatenated comment text from the first contiguous
 * comment-only lines inside a function body. When no such comments are
 * present or the node has no block body, an empty string is returned.
 *
 * This mirrors the branch helpers' behaviour for inside-brace placement
 * (for example, simple if-statements and switch cases) so that
 * function-level rules can share the same mental model: annotations live
 * on the first comment-only line(s) inside the body braces.
 *
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-INSIDE-BRACE-PLACEMENT REQ-ALL-BLOCK-TYPES
 */
export function getFunctionInsideBodyCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  const block = getFunctionBodyBlock(node);
  if (
    !block ||
    !block.loc ||
    !block.loc.start ||
    !block.loc.end ||
    typeof block.loc.start.line !== "number" ||
    typeof block.loc.end.line !== "number"
  ) {
    return "";
  }

  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;

  if (typeof getCommentsInside === "function") {
    try {
      const insideComments =
        (getCommentsInside as (_node: any) => any[])(block) || [];
      const insideText = insideComments
        .filter((c) => c && typeof c.value === "string")
        .map((c) => c.value)
        .join(" ");

      if (insideText) {
        return insideText;
      }
    } catch {
      // Fall through to the line-based fallback when structured comment
      // retrieval is unavailable or fails.
    }
  }

  const lines = (sourceCode as any).lines as string[] | undefined;
  if (!Array.isArray(lines)) {
    return "";
  }

  const startIndex = block.loc.start.line - 1;
  const endIndex = block.loc.end.line - 1;

  const insideText = scanCommentLinesInRange(lines, startIndex + 1, endIndex);
  return insideText || "";
}
