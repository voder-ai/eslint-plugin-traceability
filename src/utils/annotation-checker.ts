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
  return (jsdoc && typeof jsdoc.value === "string" && jsdoc.value.includes("@req")) || comments.some(commentContainsReq);
}

/**
 * Creates a fix function that inserts a missing @req JSDoc before the node.
 * Returned function is a proper named function so no inline arrow is used.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
 */
function createMissingReqFix(node: any) {
  return function missingReqFix(fixer: any) {
    return fixer.insertTextBefore(node, "/** @req <REQ-ID> */\n");
  };
}

/**
 * Helper to report a missing @req annotation via the ESLint context API.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context
 */
function reportMissing(context: any, node: any) {
  context.report({
    node,
    messageId: "missingReq",
    fix: createMissingReqFix(node),
  });
}

/**
 * Helper to check @req annotation presence on TS declare functions and method signatures.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 */
export function checkReqAnnotation(context: any, node: any) {
  const sourceCode = context.getSourceCode();
  const jsdoc = getJsdocComment(sourceCode, node);
  const leading = getLeadingComments(node);
  const comments = getCommentsBefore(sourceCode, node);
  const all = combineComments(leading, comments);
  const hasReq = hasReqAnnotation(jsdoc, all);
  if (!hasReq) {
    reportMissing(context, node);
  }
}