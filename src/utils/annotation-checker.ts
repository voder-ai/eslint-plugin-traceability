import { getNodeName } from "../rules/helpers/require-story-utils";
import { hasReqAnnotation } from "./reqAnnotationDetection";

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
 * Creates a fix function that inserts a missing @req JSDoc before the node.
 * Returned function is a proper named function so no inline arrow is used.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
 */
function createMissingReqFix(node: any) {
  const target = getFixTargetNode(node);
  /**
   * Fixer used to insert a default @req annotation before the chosen target node.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
   */
  return function missingReqFix(fixer: any) {
    return fixer.insertTextBefore(target, "/** @req <REQ-ID> */\n");
  };
}

/**
 * Helper to report a missing @req annotation via the ESLint context API.
 * Uses getNodeName to provide a readable name for the node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context
 * @req REQ-ERROR-SPECIFIC - Provide specific error details including node name
 * @req REQ-ERROR-LOCATION - Include contextual location information in errors
 * @req REQ-ERROR-SUGGESTION - Provide actionable suggestions or fixes where possible
 * @req REQ-ERROR-CONTEXT - Include contextual hints to help understand the error
 */
function reportMissing(context: any, node: any, enableFix: boolean = true) {
  const rawName =
    getNodeName(node) ?? (node && getNodeName((node as any).parent));
  const name = rawName ?? "(anonymous)";
  const nameNode =
    (node && (node as any).id && (node as any).id.type === "Identifier"
      ? (node as any).id
      : node && (node as any).key && (node as any).key.type === "Identifier"
        ? (node as any).key
        : node) ?? node;
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

  context.report(reportOptions);
}

/**
 * Helper to check @req annotation presence on TS declare functions and method signatures.
 * This helper is intentionally scope/exportPriority agnostic and focuses solely
 * on detection and reporting of @req annotations for the given node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation
 * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context
 * @param context - ESLint rule context used to obtain source and report problems
 * @param node - Function-like AST node whose surrounding comments should be inspected
 * @param options - Optional configuration controlling behaviour (e.g., enableFix)
 * @returns void
 */
export function checkReqAnnotation(
  context: any,
  node: any,
  options?: { enableFix?: boolean },
) {
  const { enableFix = true } = options ?? {};
  const sourceCode = context.getSourceCode();
  const jsdoc = getJsdocComment(sourceCode, node);
  const leading = getLeadingComments(node);
  const comments = getCommentsBefore(sourceCode, node);
  const all = combineComments(leading, comments);
  const hasReq = hasReqAnnotation(jsdoc, all, context, node);
  // BRANCH when a @req annotation is missing and must be reported
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  // @req REQ-ANNOTATION-REPORTING
  if (!hasReq) {
    reportMissing(context, node, enableFix);
  }
}
