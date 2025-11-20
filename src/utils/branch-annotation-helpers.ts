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
 * Gather leading comment text for a branch node.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-COMMENT-ASSOCIATION - Associate inline comments with their corresponding code branches
 */
export function gatherBranchCommentText(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  node: any,
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
  const comments = sourceCode.getCommentsBefore(node) || [];

  /**
   * Mapper to extract the text value from a comment node.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-TRACEABILITY-MAP-CALLBACK - Trace mapping of comment nodes to their text values
   */
  function commentToValue(c: any) {
    return c.value;
  }

  return comments.map(commentToValue).join(" ");
}

/**
 * Report missing @story annotation on a branch node.
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
     * Fixer that inserts a default @story annotation above the branch.
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
 * Report missing @req annotation on a branch node.
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
     * Fixer that inserts a default @req annotation above the branch.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-TRACEABILITY-FIX-ARROW - Trace fixer function used to insert missing @req
     */
    function insertReqFixer(fixer: any) {
      return fixer.insertTextBeforeRange(
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
