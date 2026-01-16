import { getNodeName } from "../rules/helpers/require-story-utils";
import { hasReqAnnotation } from "./reqAnnotationDetection";
import {
  getFunctionInsideBodyCommentText,
  supportsInsidePlacementForFunction,
} from "./function-annotation-helpers";

/**
 * Helper to retrieve the JSDoc comment for a node.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 */
function getJsdocComment(sourceCode: any, node: any) {
  return sourceCode.getJSDocComment(node);
}

/**
 * Helper to retrieve leading comments from a node (TypeScript declare style).
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING REQ-TYPESCRIPT-SUPPORT
 */
function getLeadingComments(node: any) {
  return (node as any).leadingComments || [];
}

/**
 * Helper to retrieve comments before a node using the sourceCode API.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 */
function getCommentsBefore(sourceCode: any, node: any) {
  return sourceCode.getCommentsBefore(node) || [];
}

/**
 * Helper to combine leading and before comments into a single array.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function combineComments(leading: any[], before: any[]) {
  return [...leading, ...before];
}

/**
 * Determine the most appropriate node to attach an inserted JSDoc to.
 * Prefers outer function-like constructs such as methods, variable declarators,
 * or wrapping expression statements for function expressions.
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SAFE
 */
function getFixTargetNode(node: any) {
  const parent = node && (node as any).parent;

  // When there is no parent, attach the annotation directly to the node itself.
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-PRESERVE
  if (!parent) {
    return node;
  }

  // If the node is part of a class/obj method definition, attach to the MethodDefinition
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-PRESERVE
  if (parent.type === "MethodDefinition") {
    return parent;
  }

  // If the node is the init of a variable declarator, attach to the VariableDeclarator
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-PRESERVE
  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return parent;
  }

  // If the parent is an expression statement (e.g. IIFE or assigned via expression),
  // attach to the outer ExpressionStatement.
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-PRESERVE
  if (parent.type === "ExpressionStatement") {
    return parent;
  }

  return node;
}

/**
 * Creates a fix function that inserts a missing `@req` JSDoc before the node.
 * Returned function is a proper named function so no inline arrow is used.
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-TEMPLATE REQ-AUTOFIX-SELECTIVE
 */
function createMissingReqFix(node: any) {
  const target = getFixTargetNode(node);

  /**
   * Fixer used to insert a default `@req` annotation before the chosen target node.
   * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
   * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-TEMPLATE
   */
  function missingReqFix(fixer: any) {
    return fixer.insertTextBefore(target, "/** @req <REQ-ID> */\n");
  }

  return missingReqFix;
}

/**
 * Resolve the display name used when reporting a missing `@req` annotation.
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC
 */
function getReportedName(contextNode: any, parentNode: any): string {
  const rawName = getNodeName(contextNode) ?? getNodeName(parentNode);
  return rawName ?? "(anonymous)";
}

/**
 * Determine the AST sub-node that should be used as the location for reporting.
 * Prefers Identifier nodes (id or key) over the broader function-like node.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ERROR-LOCATION
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-LOCATION
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
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-ERROR-LOCATION
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT
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
  // @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SELECTIVE
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
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-ERROR-LOCATION
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT
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
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-ANNOTATION-REQ-DETECTION REQ-TYPESCRIPT-SUPPORT
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-LOCATION REQ-ERROR-SPECIFIC
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
  // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
  // @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC
  if (!hasReq) {
    reportMissing(context, node, enableFix);
  }
}
