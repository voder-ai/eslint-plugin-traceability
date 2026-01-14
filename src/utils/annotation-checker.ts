/* eslint-disable traceability/valid-req-reference */
import { getNodeName } from "../rules/helpers/require-story-utils";
import { hasReqAnnotation } from "./reqAnnotationDetection";
import {
  getFunctionInsideBodyCommentText,
  supportsInsidePlacementForFunction,
} from "./function-annotation-helpers";

/**
 * Helper to retrieve the JSDoc comment for a node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-GET-JSDOC - Retrieve JSDoc comment for a node
 */
function getJsdocComment(sourceCode: any, node: any) {
  return sourceCode.getJSDocComment(node);
}

/**
 * Helper to retrieve leading comments from a node (TypeScript declare style).
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-LEADING-COMMENTS - Collect leading comments from node
 */
function getLeadingComments(node: any) {
  return (node as any).leadingComments || [];
}

/**
 * Helper to retrieve comments before a node using the sourceCode API.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-COMMENTS-BEFORE - Collect comments before node via sourceCode
 */
function getCommentsBefore(sourceCode: any, node: any) {
  return sourceCode.getCommentsBefore(node) || [];
}

/**
 * Helper to combine leading and before comments into a single array.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-COMBINE-COMMENTS - Combine comment arrays for checking
 */
function combineComments(leading: any[], before: any[]) {
  return [...leading, ...before];
}

/**
 * Determine the most appropriate node to attach an inserted JSDoc to.
 * Prefers outer function-like constructs such as methods, variable declarators,
 * or wrapping expression statements for function expressions.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
 */
function getFixTargetNode(node: any) {
  const parent = node && (node as any).parent;

  // When there is no parent, attach the annotation directly to the node itself.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-AUTOFIX - Default to annotating the node when it has no parent
  if (!parent) {
    return node;
  }

  // If the node is part of a class/obj method definition, attach to the MethodDefinition
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-AUTOFIX - Attach fixes to the MethodDefinition wrapper for methods
  if (parent.type === "MethodDefinition") {
    return parent;
  }

  // If the node is the init of a variable declarator, attach to the VariableDeclarator
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-AUTOFIX - Attach fixes to the VariableDeclarator for function initializers
  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return parent;
  }

  // If the parent is an expression statement (e.g. IIFE or assigned via expression),
  // attach to the outer ExpressionStatement.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-AUTOFIX - Attach fixes to the ExpressionStatement wrapper for IIFEs
  if (parent.type === "ExpressionStatement") {
    return parent;
  }

  return node;
}

/**
 * Creates a fix function that inserts a missing `@req` JSDoc before the node.
 * Returned function is a proper named function so no inline arrow is used.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing `@req` annotation
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-AUTOFIX REQ-ANNOTATION-REPORTING
 */
function createMissingReqFix(node: any) {
  const target = getFixTargetNode(node);
  /**
   * Fixer used to insert a default `@req` annotation before the chosen target node.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-AUTOFIX - Implement autofix insertion for missing `@req`
   * @req REQ-ANNOTATION-REPORTING - Support actionable fix in reported problem
   */
  return function missingReqFix(fixer: any) {
    return fixer.insertTextBefore(target, "/** @req <REQ-ID> */\n");
  };
}

/**
 * Resolve the display name used when reporting a missing `@req` annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REPORTING - Use consistent naming when reporting missing `@req`
 * @req REQ-ERROR-SPECIFIC - Derive a specific, human-readable name for the node
 */
function getReportedName(contextNode: any, parentNode: any): string {
  const rawName = getNodeName(contextNode) ?? getNodeName(parentNode);
  return rawName ?? "(anonymous)";
}

/**
 * Determine the AST sub-node that should be used as the location for reporting.
 * Prefers Identifier nodes (id or key) over the broader function-like node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REPORTING - Report missing `@req` on the most relevant node
 * @req REQ-ERROR-SPECIFIC - Target the identifier when available for precise errors
 */
function getNameNodeForReqReport(node: any): any {
  const candidateId = (node as any).id;
  if (candidateId && candidateId.type === "Identifier") {
    return candidateId;
  }

  const candidateKey = (node as any).key;
  if (candidateKey && candidateKey.type === "Identifier") {
    return candidateKey;
  }

  return node;
}

/**
 * Helper to build the report options object for missing traceability annotations.
 * Uses getNodeName to provide a readable name for the node. `@supports` is the
 * preferred format for expressing traceability to one or more requirements and
 * stories, while `@req` is treated as a legacy shorthand for single-story usage.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ANNOTATION-REPORTING - Report missing traceability annotations to context
 * @req REQ-ERROR-SPECIFIC - Provide specific error details including node name
 * @req REQ-ERROR-LOCATION - Include contextual location information in errors
 * @req REQ-ERROR-SUGGESTION - Provide actionable suggestions or fixes where possible
 * @req REQ-ERROR-CONTEXT - Include contextual hints to help understand the error
 */
function buildMissingReqReportOptions(node: any, enableFix: boolean) {
  const parentNode = (node as any)?.parent;
  const name = getReportedName(node, parentNode);
  const nameNode = getNameNodeForReqReport(node);
  const reportOptions: any = {
    node: nameNode,
    messageId: "missingReq",
    data: { name, functionName: name },
  };

  // Conditionally attach an autofix only when enabled in the rule options.
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-AUTOFIX - Only provide autofix suggestions when explicitly enabled
  if (enableFix) {
    reportOptions.fix = createMissingReqFix(node);
  }

  return reportOptions;
}

/**
 * Helper to report missing traceability annotations via the ESLint context API.
 * Uses getNodeName to provide a readable name for the node. `@supports` is the
 * preferred format for expressing traceability to one or more requirements and
 * stories, while `@req` is treated as a legacy shorthand for single-story usage.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ANNOTATION-REPORTING - Report missing traceability annotations to context
 * @req REQ-ERROR-SPECIFIC - Provide specific error details including node name
 * @req REQ-ERROR-LOCATION - Include contextual location information in errors
 * @req REQ-ERROR-SUGGESTION - Provide actionable suggestions or fixes where possible
 * @req REQ-ERROR-CONTEXT - Include contextual hints to help understand the error
 */
function reportMissing(context: any, node: any, enableFix: boolean = true) {
  const reportOptions = buildMissingReqReportOptions(node, enableFix);
  context.report(reportOptions);
}

/**
 * Helper to check `@req` annotation presence on TS declare functions and method signatures.
 *
 * This helper is intentionally scope/exportPriority agnostic and focuses solely
 * on detection and reporting of `@req` annotations for the given node.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of `@req` annotation
 * @req REQ-ANNOTATION-REPORTING - Report missing `@req` annotation to context
 * @param context - ESLint rule context used to obtain source and report problems
 * @param node - Function-like AST node whose surrounding comments should be inspected
 * @param options - Optional configuration controlling behaviour (e.g., enableFix, annotationPlacement)
 */
export function checkReqAnnotation(
  context: any,
  node: any,
  options?: {
    enableFix?: boolean;
    annotationPlacement?: "before" | "inside";
  },
) {
  const { enableFix = true } = options ?? {};
  const annotationPlacement: "before" | "inside" =
    options?.annotationPlacement === "inside" ||
    options?.annotationPlacement === "before"
      ? options.annotationPlacement
      : "before";
  const sourceCode = context.getSourceCode();

  if (
    annotationPlacement === "inside" &&
    supportsInsidePlacementForFunction(node)
  ) {
    const insideText = getFunctionInsideBodyCommentText(sourceCode, node);
    if (
      typeof insideText === "string" &&
      (insideText.includes("@req") || insideText.includes("@supports"))
    ) {
      return;
    }
  }

  const jsdoc = getJsdocComment(sourceCode, node);
  const leading = getLeadingComments(node);
  const comments = getCommentsBefore(sourceCode, node);
  const all = combineComments(leading, comments);
  const hasReq = hasReqAnnotation(jsdoc, all, context, node);
  // BRANCH when a `@req` annotation is missing and must be reported
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  // @req REQ-ANNOTATION-REPORTING
  if (!hasReq) {
    reportMissing(context, node, enableFix);
  }
}
