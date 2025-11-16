"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rule to validate @story and @req annotation format and syntax
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION - Define clear format rules for @story and @req annotations
 * @req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
 * @req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
 * @req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns
 */
exports.default = {
    meta: {
        type: "problem",
        docs: {
            description: "Validate format and syntax of @story and @req annotations",
            recommended: "error",
        },
        messages: {
            invalidStoryFormat: "Invalid @story annotation format",
            invalidReqFormat: "Invalid @req annotation format",
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.getSourceCode();
        return {
            Program() {
                const comments = sourceCode.getAllComments() || [];
                comments.forEach((comment) => {
                    const lines = comment.value
                        .split(/\r?\n/)
                        .map((l) => l.replace(/^[^@]*/, '').trim());
                    lines.forEach((line) => {
                        if (line.startsWith("@story")) {
                            const parts = line.split(/\s+/);
                            const storyPath = parts[1];
                            if (!storyPath ||
                                !/^docs\/stories\/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$/.test(storyPath)) {
                                context.report({
                                    node: comment,
                                    messageId: "invalidStoryFormat",
                                });
                            }
                        }
                        if (line.startsWith("@req")) {
                            const parts = line.split(/\s+/);
                            const reqId = parts[1];
                            if (!reqId || !/^REQ-[A-Z0-9-]+$/.test(reqId)) {
                                context.report({
                                    node: comment,
                                    messageId: "invalidReqFormat",
                                });
                            }
                        }
                    });
                });
            },
        };
    },
};
