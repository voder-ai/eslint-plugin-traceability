/**
 * Rule to enforce @story annotation on functions
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @story annotation on functions
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require @story annotations on functions",
      recommended: "error",
    },
    messages: {
      missingStory: "Missing @story annotation",
    },
    schema: [],
  },
  create(context: any) {
    const sourceCode = context.getSourceCode();
    return {
      FunctionDeclaration(node: any) {
        const jsdoc = sourceCode.getJSDocComment(node);
        let hasStory = false;
        if (jsdoc && jsdoc.value.includes("@story")) {
          hasStory = true;
        } else {
          const commentsBefore = sourceCode.getCommentsBefore(node) || [];
          hasStory = commentsBefore.some((comment: any) =>
            comment.value.includes("@story"),
          );
        }
        if (!hasStory) {
          context.report({ node, messageId: "missingStory" });
        }
      },
    };
  },
} as any;
