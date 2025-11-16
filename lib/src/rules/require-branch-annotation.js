"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rule to enforce @story and @req annotations on significant code branches
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations
 */
exports.default = {
    meta: {
        type: "problem",
        docs: {
            description: "Require @story and @req annotations on code branches",
            recommended: "error",
        },
        messages: {
            missingAnnotation: "Missing {{missing}} annotation on code branch",
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.getSourceCode();
        function checkBranch(node) {
            const comments = sourceCode.getCommentsBefore(node) || [];
            const text = comments.map((c) => c.value).join(" ");
            if (!/@story\b/.test(text)) {
                context.report({
                    node,
                    messageId: "missingAnnotation",
                    data: { missing: "@story" },
                });
            }
            if (!/@req\b/.test(text)) {
                context.report({
                    node,
                    messageId: "missingAnnotation",
                    data: { missing: "@req" },
                });
            }
        }
        return {
            IfStatement: checkBranch,
            SwitchCase: checkBranch,
            TryStatement: checkBranch,
            CatchClause: checkBranch,
            ForStatement: checkBranch,
            ForOfStatement: checkBranch,
            ForInStatement: checkBranch,
            WhileStatement: checkBranch,
            DoWhileStatement: checkBranch,
        };
    },
};
