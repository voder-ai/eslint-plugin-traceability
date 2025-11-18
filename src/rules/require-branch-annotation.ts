/* eslint-disable max-lines-per-function */
/****
 * Rule to enforce @story and @req annotations on significant code branches
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement
 */

import type { Rule } from "eslint";

const DEFAULT_BRANCH_TYPES = [
  "IfStatement",
  "SwitchCase",
  "TryStatement",
  "CatchClause",
  "ForStatement",
  "ForOfStatement",
  "ForInStatement",
  "WhileStatement",
  "DoWhileStatement",
] as const;

type BranchType = (typeof DEFAULT_BRANCH_TYPES)[number];

/**
 * Gather leading comments for a node, with fallback for SwitchCase.
 */
function gatherCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): string {
  if (node.type === "SwitchCase") {
    const lines = sourceCode.lines;
    const startLine = node.loc.start.line;
    let i = startLine - 1;
    const comments: string[] = [];
    while (i > 0 && /^\s*(\/\/|\/\*)/.test(lines[i - 1])) {
      comments.unshift(lines[i - 1].trim());
      i--;
    }
    return comments.join(" ");
  }
  const comments = sourceCode.getCommentsBefore(node) || [];
  return comments.map((c) => c.value).join(" ");
}

const rule: Rule.RuleModule = {
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
    schema: [
      {
        type: "object",
        properties: {
          branchTypes: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const optionBranchTypes = context.options[0]?.branchTypes as string[] | undefined;
    if (optionBranchTypes) {
      for (const bt of optionBranchTypes) {
        if (!DEFAULT_BRANCH_TYPES.includes(bt as BranchType)) {
          throw new Error(
            `branchTypes value "${bt}" should be equal to one of the allowed values: ${DEFAULT_BRANCH_TYPES.join(', ')}`
          );
        }
      }
    }
    const branchTypes: BranchType[] = optionBranchTypes
      ? (optionBranchTypes as BranchType[])
      : Array.from(DEFAULT_BRANCH_TYPES);
    let storyFixCount = 0;

    function reportBranch(node: any) {
      const text = gatherCommentText(sourceCode, node);
      const missingStory = !/@story\b/.test(text);
      const missingReq = !/@req\b/.test(text);
      const indentMatch =
        sourceCode.lines[node.loc.start.line - 1].match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : "";
      const insertPos = sourceCode.getIndexFromLoc({
        line: node.loc.start.line,
        column: 0,
      });

      if (missingStory) {
        if (storyFixCount === 0) {
          context.report({
            node,
            messageId: "missingAnnotation",
            data: { missing: "@story" },
            fix: (fixer) =>
              fixer.insertTextBeforeRange(
                [insertPos, insertPos],
                `${indent}// @story <story-file>.story.md\n`,
              ),
          });
          storyFixCount++;
        } else {
          context.report({
            node,
            messageId: "missingAnnotation",
            data: { missing: "@story" },
          });
        }
      }

      if (missingReq) {
        const hasOriginalStory = /@story\b/.test(text);
        if (hasOriginalStory) {
          context.report({
            node,
            messageId: "missingAnnotation",
            data: { missing: "@req" },
            fix: (fixer) =>
              fixer.insertTextBeforeRange(
                [insertPos, insertPos],
                `${indent}// @req <REQ-ID>\n`,
              ),
          });
        } else {
          context.report({
            node,
            messageId: "missingAnnotation",
            data: { missing: "@req" },
          });
        }
      }
    }

    return {
      IfStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      SwitchCase(node) {
        if (node.test == null || !branchTypes.includes(node.type as BranchType))
          return;
        reportBranch(node);
      },
      TryStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      CatchClause(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      ForStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      ForOfStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      ForInStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      WhileStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      DoWhileStatement(node) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
    };
  },
};

export default rule;