import type { Rule } from "eslint";

/**
 * Valid branch types for require-branch-annotation rule.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-SIGNIFICANCE-CRITERIA - Define criteria for which branches require annotations
 */
export const DEFAULT_BRANCH_TYPES = [
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

/**
 * Type for branch nodes supported by require-branch-annotation rule.
 */
export type BranchType = (typeof DEFAULT_BRANCH_TYPES)[number];

/**
 * Validate branchTypes configuration option and return branch types to enforce,
 * or return an ESLint listener if configuration is invalid.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement
 */
export function validateBranchTypes(
  context: Rule.RuleContext,
): BranchType[] | Rule.RuleListener {
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
              message: `Value "${t}" should be equal to one of the allowed values: ${DEFAULT_BRANCH_TYPES.join(
                ", ",
              )}`,
            });
          });
        },
      };
    }
  }

  return Array.isArray(options.branchTypes)
    ? (options.branchTypes as BranchType[])
    : Array.from(DEFAULT_BRANCH_TYPES);
}

/**
 * Gather leading comment text for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Associate inline comments with their corresponding code branches
 */
function gatherBranchCommentText(
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
  return comments.map((c: any) => c.value).join(" ");
}

/**
 * Report missing @story annotation on a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
function reportMissingStory(
  context: Rule.RuleContext,
  node: any,
  indent: string,
  insertPos: number,
  storyFixCountRef: { count: number },
): void {
  if (storyFixCountRef.count === 0) {
    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@story" },
      fix: (fixer: any) =>
        fixer.insertTextBeforeRange(
          [insertPos, insertPos],
          `${indent}// @story <story-file>.story.md\n`,
        ),
    });
    storyFixCountRef.count++;
  } else {
    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@story" },
    });
  }
}

/**
 * Report missing @req annotation on a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
function reportMissingReq(
  context: Rule.RuleContext,
  node: any,
  indent: string,
  insertPos: number,
  missingStory: boolean,
): void {
  if (!missingStory) {
    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@req" },
      fix: (fixer: any) =>
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

/**
 * Report missing annotations on a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
export function reportMissingAnnotations(
  context: Rule.RuleContext,
  node: any,
  storyFixCountRef: { count: number },
): void {
  const sourceCode = context.getSourceCode();
  const text = gatherBranchCommentText(sourceCode, node);
  const missingStory = !/@story\b/.test(text);
  const missingReq = !/@req\b/.test(text);
  const indent =
    sourceCode.lines[node.loc.start.line - 1].match(/^(\s*)/)?.[1] || "";
  const insertPos = sourceCode.getIndexFromLoc({
    line: node.loc.start.line,
    column: 0,
  });

  const actions: Array<{ missing: boolean; fn: Function; args: any[] }> = [
    {
      missing: missingStory,
      fn: reportMissingStory,
      args: [context, node, indent, insertPos, storyFixCountRef],
    },
    {
      missing: missingReq,
      fn: reportMissingReq,
      args: [context, node, indent, insertPos, missingStory],
    },
  ];

  actions.forEach(({ missing, fn, args }) => missing && fn(...args));
}
