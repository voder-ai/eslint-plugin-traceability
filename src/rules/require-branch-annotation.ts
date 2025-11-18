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
    let i = startLine - 2;
    const comments: string[] = [];
    while (i >= 0 && /^\s*(\/\/|\/\*)/.test(lines[i])) {
      comments.unshift(lines[i].trim());
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

  /* eslint-disable-next-line max-lines-per-function */
  create(context) {
    const sourceCode = context.getSourceCode();
    const options: any = context.options[0] || {};

    if (Array.isArray(options.branchTypes)) {
      const invalidTypes = options.branchTypes.filter(
        (t: any) => !DEFAULT_BRANCH_TYPES.includes(t as BranchType),
      );
      if (invalidTypes.length > 0) {
        return {
          Program(node: any) {
            invalidTypes.forEach((t: any) => {
              context.report({
                node,
                message: `Value "${t}" should be equal to one of the allowed values: ${DEFAULT_BRANCH_TYPES.join(", ")}`,
              });
            });
          },
        };
      }
    }

    const branchTypes: BranchType[] = Array.isArray(options.branchTypes)
      ? (options.branchTypes as BranchType[])
      : Array.from(DEFAULT_BRANCH_TYPES);

    let storyFixCount = 0;

    function reportBranch(node: any) {
      const text = gatherCommentText(sourceCode, node);
      const missingStory = !/@story\b/.test(text);
      const missingReq = !/@req\b/.test(text);
      const indent =
        sourceCode.lines[node.loc.start.line - 1].match(/^(\s*)/)?.[1] || "";
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
        if (!missingStory) {
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
      IfStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      SwitchCase(node: any) {
        if (node.test == null || !branchTypes.includes(node.type as BranchType))
          return;
        reportBranch(node);
      },
      TryStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      CatchClause(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      ForStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      ForOfStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      ForInStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      WhileStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
      DoWhileStatement(node: any) {
        if (!branchTypes.includes(node.type as BranchType)) return;
        reportBranch(node);
      },
    };
  },
};

export default rule;
