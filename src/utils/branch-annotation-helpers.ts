import type { Rule } from "eslint";
const PRE_COMMENT_OFFSET = 2; // number of lines above branch to inspect for comments

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

  /**
   * Conditional branch checking whether branchTypes option was provided.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-CONDITIONAL - Trace configuration branch existence check
   */
  if (Array.isArray(options.branchTypes)) {
    /**
     * Predicate to determine whether a provided branch type is invalid.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FILTER-CALLBACK - Trace filter callback for invalid branch type detection
     */
    function isInvalidType(t: any): boolean {
      return !DEFAULT_BRANCH_TYPES.includes(t as BranchType);
    }

    const invalidTypes = options.branchTypes.filter(isInvalidType);
    /**
     * Conditional branch checking whether any invalid types were found.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-INVALID-DETECTION - Trace handling when invalid types are detected
     */
    if (invalidTypes.length > 0) {
      /**
       * Program listener produced when configuration is invalid.
       * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
       * @req REQ-TRACEABILITY-PROGRAM-LISTENER - Trace Program listener reporting invalid config values
       */
      function ProgramHandler(node: any) {
        /**
         * Report a single invalid type for the given Program node.
         * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
         * @req REQ-TRACEABILITY-FOR-EACH-CALLBACK - Trace reporting for each invalid type
         */
        function reportInvalidType(t: any) {
          context.report({
            node,
            message: `Value "${t}" should be equal to one of the allowed values: ${DEFAULT_BRANCH_TYPES.join(
              ", ",
            )}`,
          });
        }
        invalidTypes.forEach(reportInvalidType);
      }
      return { Program: ProgramHandler };
    }
  }

  return Array.isArray(options.branchTypes)
    ? (options.branchTypes as BranchType[])
    : Array.from(DEFAULT_BRANCH_TYPES);
}

/**
 * Extract the raw value from a comment node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-TRACEABILITY-MAP-CALLBACK - Trace mapping of comment nodes to their text values
 */
function extractCommentValue(_c: any): string {
  return _c.value;
}

function isElseIfBranch(node: any, parent: any | undefined): boolean {
  return (
    node &&
    node.type === "IfStatement" &&
    parent &&
    parent.type === "IfStatement" &&
    parent.alternate === node
  );
}

/**
 * Gather annotation text for CatchClause nodes, supporting both before-catch and inside-catch positions.
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @req REQ-DUAL-POSITION-DETECTION
 * @req REQ-FALLBACK-LOGIC
 */
function gatherCatchClauseCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  beforeText: string,
): string {
  if (/@story\b/.test(beforeText) || /@req\b/.test(beforeText)) {
    return beforeText;
  }

  const getCommentsInside: unknown = (sourceCode as any).getCommentsInside;
  if (node.body && typeof getCommentsInside === "function") {
    try {
      const insideComments =
        (getCommentsInside as (_node: any) => any[])(node.body) || [];
      const insideText = insideComments.map(extractCommentValue).join(" ");
      if (insideText) {
        return insideText;
      }
    } catch {
      // fall through to line-based fallback
    }
  }

  if (node.body && node.body.loc && node.body.loc.start && node.body.loc.end) {
    const lines = sourceCode.lines;
    const startIndex = node.body.loc.start.line - 1;
    const endIndex = node.body.loc.end.line - 1;
    const comments: string[] = [];
    let i = startIndex + 1;

    while (i <= endIndex) {
      const line = lines[i];
      if (!line || !line.trim()) {
        break;
      }
      if (!/^\s*(\/\/|\/\*)/.test(line)) {
        break;
      }
      comments.push(line.trim());
      i++;
    }

    const insideText = comments.join(" ");
    if (insideText) {
      return insideText;
    }
  }

  return beforeText;
}

/**
 * Gather annotation text for IfStatement else-if branches, supporting comments placed
 * between the else-if condition and the consequent statement body.
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 * @supports REQ-FALLBACK-LOGIC
 */
function gatherElseIfCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent: any | undefined,
  beforeText: string,
): string {
  if (/@story\b/.test(beforeText) || /@req\b/.test(beforeText)) {
    return beforeText;
  }

  if (!isElseIfBranch(node, parent)) {
    return beforeText;
  }

  if (
    !node.consequent ||
    node.consequent.type !== "BlockStatement" ||
    !node.consequent.loc ||
    !node.consequent.loc.start
  ) {
    return beforeText;
  }

  if (!node.test || !node.test.loc || !node.test.loc.end) {
    return beforeText;
  }

  const lines = sourceCode.lines;
  const conditionEndLine: number = node.test.loc.end.line;
  const consequentStartLine: number = node.consequent.loc.start.line;

  const comments: string[] = [];
  for (
    let lineIndex = conditionEndLine;
    lineIndex < consequentStartLine;
    lineIndex++
  ) {
    const line = lines[lineIndex];
    if (!line || !line.trim()) {
      break;
    }
    if (!/^\s*(\/\/|\/\*)/.test(line)) {
      break;
    }
    comments.push(line.trim());
  }

  const betweenText = comments.join(" ");
  return betweenText || beforeText;
}

/**
 * Gather leading comment text for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Associate inline comments with their corresponding code branches
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 */
export function gatherBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent?: any,
): string {
  /**
   * Conditional branch for SwitchCase nodes that may include inline comments.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-SWITCHCASE-COMMENTS - Trace collection of preceding comments for SwitchCase
   */
  if (node.type === "SwitchCase") {
    const lines = sourceCode.lines;
    const startLine = node.loc.start.line;
    let i = startLine - PRE_COMMENT_OFFSET;
    const comments: string[] = [];
    // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
    // @req REQ-TRACEABILITY-WHILE - Trace while loop that collects preceding comments for SwitchCase
    while (i >= 0 && /^\s*(\/\/|\/\*)/.test(lines[i])) {
      comments.unshift(lines[i].trim());
      i--;
    }
    return comments.join(" ");
  }

  const beforeComments = sourceCode.getCommentsBefore(node) || [];

  const beforeText = beforeComments.map(extractCommentValue).join(" ");

  if (node.type === "CatchClause") {
    return gatherCatchClauseCommentText(sourceCode, node, beforeText);
  }

  /**
   * Conditional branch for IfStatement else-if nodes that may include inline comments
   * after the else-if condition but before the consequent body.
   * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
   * @supports REQ-DUAL-POSITION-DETECTION
   */
  if (node.type === "IfStatement") {
    return gatherElseIfCommentText(sourceCode, node, parent, beforeText);
  }

  return beforeText;
}

/**
 * Report missing @story annotation tag on a branch node when that branch lacks a corresponding @story reference in its comments.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
export function reportMissingStory(
  context: Rule.RuleContext,
  node: any,
  options: {
    indent: string;
    insertPos: number;
    storyFixCountRef: { count: number };
  },
): void {
  const { indent, insertPos, storyFixCountRef } = options;
  /**
   * Conditional branch deciding whether to offer an auto-fix for the missing story.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-FIX-DECISION - Trace decision to provide fixer for missing @story
   */
  if (storyFixCountRef.count === 0) {
    /**
     * Fixer that inserts a default @story tag above the branch.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FIX-ARROW - Trace fixer function used to insert missing @story
     */
    function insertStoryFixer(fixer: any) {
      return fixer.insertTextBeforeRange(
        [insertPos, insertPos],
        `${indent}// @story <story-file>.story.md\n`,
      );
    }

    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@story" },
      fix: insertStoryFixer,
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
 * Report missing @req annotation tag on a branch node when that branch has no linked requirement identifier in its associated comments.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 */
export function reportMissingReq(
  context: Rule.RuleContext,
  node: any,
  options: { indent: string; insertPos: number; missingStory: boolean },
): void {
  const { indent, insertPos, missingStory } = options;
  /**
   * Conditional branch deciding whether to offer an auto-fix for the missing req.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-FIX-DECISION - Trace decision to provide fixer for missing @req
   */
  if (!missingStory) {
    /**
     * Fixer that inserts a default @req tag above the branch.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FIX-ARROW - Trace fixer function used to insert missing @req
     */
    function insertReqFixer(fxer: any) {
      return fxer.insertTextBeforeRange(
        [insertPos, insertPos],
        `${indent}// @req <REQ-ID>\n`,
      );
    }

    context.report({
      node,
      messageId: "missingAnnotation",
      data: { missing: "@req" },
      fix: insertReqFixer,
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
 * Compute the base indent and insert position for a branch node, including
 * special handling for CatchClause bodies.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @supports REQ-ANNOTATION-PARSING
 * @supports REQ-DUAL-POSITION-DETECTION
 */
function getBaseBranchIndentAndInsertPos(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
): { indent: string; insertPos: number } {
  let indent =
    sourceCode.lines[node.loc.start.line - 1].match(/^(\s*)/)?.[1] || "";
  let insertPos = sourceCode.getIndexFromLoc({
    line: node.loc.start.line,
    column: 0,
  });

  if (node.type === "CatchClause" && node.body) {
    const bodyNode: any = node.body;
    const bodyStatements: any[] | undefined = Array.isArray(bodyNode.body)
      ? bodyNode.body
      : undefined;
    const firstStatement: any | undefined =
      bodyStatements && bodyStatements.length > 0
        ? bodyStatements[0]
        : undefined;

    if (firstStatement && firstStatement.loc && firstStatement.loc.start) {
      const firstLine = firstStatement.loc.start.line;
      const innerIndent =
        sourceCode.lines[firstLine - 1].match(/^(\s*)/)?.[1] || "";
      indent = innerIndent;
      insertPos = sourceCode.getIndexFromLoc({
        line: firstLine,
        column: 0,
      });
    } else if (bodyNode.loc && bodyNode.loc.start) {
      const blockLine = bodyNode.loc.start.line;
      const blockIndent =
        sourceCode.lines[blockLine - 1].match(/^(\s*)/)?.[1] || "";
      const innerIndent = `${blockIndent}  `;
      indent = innerIndent;
      insertPos = sourceCode.getIndexFromLoc({
        line: blockLine,
        column: 0,
      });
    }
  }

  return { indent, insertPos };
}

/**
 * Compute annotation-related metadata for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 */
function getBranchAnnotationInfo(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
  parent?: any,
): {
  missingStory: boolean;
  missingReq: boolean;
  indent: string;
  insertPos: number;
} {
  const text = gatherBranchCommentText(sourceCode, node, parent);
  const missingStory = !/@story\b/.test(text);
  const missingReq = !/@req\b/.test(text);

  let { indent, insertPos } = getBaseBranchIndentAndInsertPos(sourceCode, node);

  if (
    isElseIfBranch(node, parent) &&
    node.consequent &&
    node.consequent.type === "BlockStatement" &&
    node.consequent.loc &&
    node.consequent.loc.start
  ) {
    // For else-if blocks, align auto-fix comments with Prettier's tendency to place comments
    // inside the wrapped block body; non-block consequents intentionally keep the default behavior.
    const commentLine = node.consequent.loc.start.line + 1;
    const commentIndent =
      sourceCode.lines[commentLine - 1]?.match(/^(\s*)/)?.[1] || indent;

    indent = commentIndent;
    insertPos = sourceCode.getIndexFromLoc({
      line: commentLine,
      column: 0,
    });
  }

  return { missingStory, missingReq, indent, insertPos };
}

/**
 * Report missing annotations on a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-PARSING - Parse @story and @req annotations from branch comments
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports REQ-DUAL-POSITION-DETECTION
 */
export function reportMissingAnnotations(
  context: Rule.RuleContext,
  node: any,
  storyFixCountRef: { count: number },
): void {
  const sourceCode = context.getSourceCode();

  /**
   * Determine the direct parent of the node using the ancestors stack when available.
   * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
   * @supports REQ-DUAL-POSITION-DETECTION
   */
  const contextAny = context as unknown as { getAncestors?: () => any[] };
  const ancestors = contextAny.getAncestors?.() || [];
  const parent =
    ancestors.length > 0 ? ancestors[ancestors.length - 1] : undefined;

  const { missingStory, missingReq, indent, insertPos } =
    getBranchAnnotationInfo(sourceCode, node, parent);

  const actions: Array<{ missing: boolean; fn: Function; args: any[] }> = [
    {
      missing: missingStory,
      fn: reportMissingStory,
      args: [context, node, { indent, insertPos, storyFixCountRef }],
    },
    {
      missing: missingReq,
      fn: reportMissingReq,
      args: [context, node, { indent, insertPos, missingStory }],
    },
  ];

  /**
   * Process a single action from the actions array.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-ACTIONS-FOREACH - Trace processing of actions array to report missing annotations
   */
  function processAction(item: {
    missing: boolean;
    fn: Function;
    args: any[];
  }) {
    /**
     * Callback invoked for each action to decide and execute reporting.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FOR-EACH-CALLBACK - Trace callback handling for each action item
     */
    if (item.missing) {
      item.fn(...item.args);
    }
  }

  actions.forEach(processAction);
}
