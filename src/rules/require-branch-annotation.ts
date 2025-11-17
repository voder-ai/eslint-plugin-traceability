/****
 * Rule to enforce @story and @req annotations on significant code branches
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations
 */
/* eslint-disable complexity, max-lines-per-function */

/**
 * Gather leading comments for a node, with fallback for SwitchCase.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Gather comments including fallback scanning
 */
function gatherCommentText(sourceCode: any, node: any): string {
  if (node.type === 'SwitchCase') {
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
    return fallbackComments.join(' ');
  }
  const comments = sourceCode.getCommentsBefore(node) || [];
  return comments.map((c: any) => c.value).join(' ');
}

/**
 * Helper to check a branch AST node for traceability annotations.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Helper for branch annotation detection
 */
function checkBranchNode(sourceCode: any, context: any, node: any) {
  const text = gatherCommentText(sourceCode, node);
  const missingStory = !/@story\b/.test(text);
  const missingReq = !/@req\b/.test(text);

  if (missingStory) {
    const reportObj: any = {
      node,
      messageId: "missingAnnotation",
      data: { missing: "@story" },
    };
    if (node.type !== "CatchClause") {
      if (node.type === "SwitchCase") {
        const indent = " ".repeat(node.loc.start.column);
        reportObj.fix = (fixer: any) =>
          fixer.insertTextBefore(
            node,
            `// @story <story-file>.story.md\n${indent}`,
          );
      } else {
        reportObj.fix = (fixer: any) =>
          fixer.insertTextBefore(node, `// @story <story-file>.story.md\n`);
      }
    }
    context.report(reportObj);
  }

  if (missingReq) {
    const reportObj: any = {
      node,
      messageId: "missingAnnotation",
      data: { missing: "@req" },
    };
    if (!missingStory && node.type !== "CatchClause") {
      if (node.type === "SwitchCase") {
        const indent = " ".repeat(node.loc.start.column);
        reportObj.fix = (fixer: any) =>
          fixer.insertTextBefore(node, `// @req <REQ-ID>\n${indent}`);
      } else {
        reportObj.fix = (fixer: any) =>
          fixer.insertTextBefore(node, `// @req <REQ-ID>\n`);
      }
    }
    context.report(reportObj);
  }
}

export default {
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
  create(context: any) {
    const sourceCode = context.getSourceCode();
    return {
      IfStatement: (node: any) => checkBranchNode(sourceCode, context, node),
      SwitchCase: (node: any) => {
        if (node.test === null) {
          return;
        }
        return checkBranchNode(sourceCode, context, node);
      },
      TryStatement: (node: any) => checkBranchNode(sourceCode, context, node),
      CatchClause: (node: any) => checkBranchNode(sourceCode, context, node),
      ForStatement: (node: any) => checkBranchNode(sourceCode, context, node),
      ForOfStatement: (node: any) =>
        checkBranchNode(sourceCode, context, node),
      ForInStatement: (node: any) =>
        checkBranchNode(sourceCode, context, node),
      WhileStatement: (node: any) => checkBranchNode(sourceCode, context, node),
      DoWhileStatement: (node: any) =>
        checkBranchNode(sourceCode, context, node),
    };
  },
} as any;