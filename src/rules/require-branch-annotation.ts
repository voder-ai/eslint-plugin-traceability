/**
 * Rule to enforce @story and @req annotations on significant code branches
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations
 */
export default {
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
  create(context: any) {
    const sourceCode = context.getSourceCode();
    /**
     * Helper to check a branch AST node for traceability annotations.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations
     */
    function checkBranch(node: any) {
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
      if (node.type === "SwitchCase" && comments.length === 0) {
        const lines = sourceCode.lines;
        const startLine = node.loc.start.line;
        let i = startLine - 1;
        const fallbackComments: string[] = [];
        while (i > 0) {
          const lineText = lines[i - 1];
          if (/^\s*(\/\/|\/\*)/.test(lineText)) {
            fallbackComments.unshift(lineText.trim());
            i--;
          } else if (/^\s*$/.test(lineText)) {
            break;
          } else {
            break;
          }
        }
        comments = fallbackComments.map((text) => ({ value: text }));
      }
      const text = comments.map((c: any) => c.value).join(" ");
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
} as any;
