"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rule to enforce @story annotation on functions
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @story annotation on functions
 */
exports.default = {
    meta: {
        type: "problem",
        docs: {
            description: "Require @story annotations on functions",
            recommended: "error",
        },
        fixable: "code",
        messages: {
            missingStory: "Missing @story annotation",
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.getSourceCode();
        return {
            FunctionDeclaration(node) {
                const jsdoc = sourceCode.getJSDocComment(node);
                let hasStory = false;
                // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
                // @req REQ-JSDOC-PARSING - Detect JSDoc @story annotation presence
                if (jsdoc && jsdoc.value.includes("@story")) {
                    hasStory = true;
                    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
                    // @req REQ-JSDOC-PARSING - Fallback to loading comments before node for @story annotation detection
                }
                else {
                    const commentsBefore = sourceCode.getCommentsBefore(node) || [];
                    hasStory = commentsBefore.some((comment) => comment.value.includes("@story"));
                }
                if (!hasStory) {
                    context.report({
                        node,
                        messageId: "missingStory",
                        fix(fixer) {
                            return fixer.insertTextBefore(node, "/** @story <story-file>.story.md */\n");
                        },
                    });
                }
            },
        };
    },
};
