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
        fixable: "code",
        messages: {
            missingAnnotation: "Missing {{missing}} annotation on code branch",
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.getSourceCode();
        /**
         * Helper to check a branch AST node for traceability annotations.
         * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
         * @req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations
         */
        function checkBranch(node) {
            // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
            // @req REQ-BRANCH-DETECTION - Skip default switch cases during annotation checks
            // skip default cases in switch
            if (node.type === "SwitchCase" && node.test == null) {
                return;
            }
            // collect comments before node
            let comments = sourceCode.getCommentsBefore(node) || [];
            // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
            // @req REQ-BRANCH-DETECTION - Fallback scanning for SwitchCase when leading comments are absent
            // fallback scanning for SwitchCase if no leading comment nodes
            /* istanbul ignore if */
            if (node.type === "SwitchCase" && comments.length === 0) {
                const lines = sourceCode.lines;
                const startLine = node.loc.start.line;
                let i = startLine - 1;
                const fallbackComments = [];
                while (i > 0) {
                    const lineText = lines[i - 1];
                    if (/^\s*(\/\/|\/\*)/.test(lineText)) {
                        fallbackComments.unshift(lineText.trim());
                        i--;
                    }
                    else if (/^\s*$/.test(lineText)) {
                        break;
                    }
                    else {
                        break;
                    }
                }
                comments = fallbackComments.map((text) => ({ value: text }));
            }
            const text = comments.map((c) => c.value).join(" ");
            const missingStory = !/@story\b/.test(text);
            const missingReq = !/@req\b/.test(text);
            if (missingStory) {
                const reportObj = {
                    node,
                    messageId: "missingAnnotation",
                    data: { missing: "@story" },
                };
                if (node.type !== "CatchClause") {
                    if (node.type === "SwitchCase") {
                        const indent = " ".repeat(node.loc.start.column);
                        reportObj.fix = (fixer) => fixer.insertTextBefore(node, `// @story <story-file>.story.md\n${indent}`);
                    }
                    else {
                        reportObj.fix = (fixer) => fixer.insertTextBefore(node, `// @story <story-file>.story.md\n`);
                    }
                }
                context.report(reportObj);
            }
            if (missingReq) {
                const reportObj = {
                    node,
                    messageId: "missingAnnotation",
                    data: { missing: "@req" },
                };
                if (!missingStory && node.type !== "CatchClause") {
                    if (node.type === "SwitchCase") {
                        const indent = " ".repeat(node.loc.start.column);
                        reportObj.fix = (fixer) => fixer.insertTextBefore(node, `// @req <REQ-ID>\n${indent}`);
                    }
                    else {
                        reportObj.fix = (fixer) => fixer.insertTextBefore(node, `// @req <REQ-ID>\n`);
                    }
                }
                context.report(reportObj);
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
