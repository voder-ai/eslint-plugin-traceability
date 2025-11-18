/**
 * Helper to check @req annotation presence on TS declare functions and method signatures.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 */
export function checkReqAnnotation(context: any, node: any) {
  const sourceCode = context.getSourceCode();
  const jsdoc = sourceCode.getJSDocComment(node);
  const leading = (node as any).leadingComments || [];
  const comments = sourceCode.getCommentsBefore(node) || [];
  const all = [...leading, ...comments];
  const hasReq =
    (jsdoc && jsdoc.value.includes("@req")) ||
    all.some((c: any) => c.value.includes("@req"));
  if (!hasReq) {
    context.report({
      node,
      messageId: "missingReq",
      fix(fixer: any) {
        return fixer.insertTextBefore(node, "/** @req <REQ-ID> */\n");
      },
    });
  }
}
