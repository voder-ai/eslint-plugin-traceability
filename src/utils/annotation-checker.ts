import { getNodeName } from "../rules/helpers/require-story-utils";

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
 * Predicate helper to check whether a comment contains a @req annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-CHECK-COMMENT - Detect @req tag inside a comment
 */
function commentContainsReq(c: any) {
  return c && typeof c.value === "string" && c.value.includes("@req");
}

/**
 * Helper to determine whether a JSDoc or any nearby comments contain a @req annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation
 */
function hasReqAnnotation(jsdoc: any, comments: any[]) {
  // BRANCH @req detection on JSDoc or comments
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  return (
    (jsdoc &&
      typeof jsdoc.value === "string" &&
      jsdoc.value.includes("@req")) ||
    comments.some(commentContainsReq)
  );
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

  if (!parent) {
    return node;
  }

  // If the node is part of a class/obj method definition, attach to the MethodDefinition
  if (parent.type === "MethodDefinition") {
    return parent;
  }

  // If the node is the init of a variable declarator, attach to the VariableDeclarator
  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return parent;
  }

  // If the parent is an expression statement (e.g. IIFE or assigned via expression),
  // attach to the outer ExpressionStatement.
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
 */
function reportMissing(context: any, node: any, enableFix: boolean = true) {
  const rawName =
    getNodeName(node) ?? (node && getNodeName((node as any).parent));
  const name = rawName ?? "(anonymous)";
  const reportOptions: any = {
    node,
    messageId: "missingReq",
    data: { name },
  };

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
  const hasReq = hasReqAnnotation(jsdoc, all);
  // BRANCH when a @req annotation is missing and must be reported
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  // @req REQ-ANNOTATION-REPORTING
  if (!hasReq) {
    reportMissing(context, node, enableFix);
  }
}
