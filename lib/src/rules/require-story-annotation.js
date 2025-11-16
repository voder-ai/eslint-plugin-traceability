"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rule to enforce @story annotation on functions
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @story annotation on functions
 */
exports.default = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require @story annotations on functions',
            recommended: 'error',
        },
        messages: {
            missingStory: 'Missing @story annotation',
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.getSourceCode();
        return {
            FunctionDeclaration(node) {
                const jsdoc = sourceCode.getJSDocComment(node);
                if (!jsdoc || !jsdoc.value.includes('@story')) {
                    context.report({ node, messageId: 'missingStory' });
                }
            },
        };
    },
};
