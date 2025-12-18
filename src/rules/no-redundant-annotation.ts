import type { Rule } from "eslint";
import {
  DEFAULT_BRANCH_TYPES,
  gatherBranchCommentText,
} from "../utils/branch-annotation-helpers";
import {
  extractStoryReqPairsFromComments,
  extractStoryReqPairsFromText,
  arePairsFullyCovered,
  getCommentRemovalRange,
  isStatementEligibleForRedundancy,
  type RedundancyRuleOptions,
  type Strictness,
} from "../utils/annotation-scope-analyzer";

/**
 * ESLint rule to detect redundant traceability annotations on statements
 * that are already covered by their containing scope.
 *
 * This rule focuses on simple, statement-level patterns that the
 * existing branch and function rules already treat as covered by
 * surrounding annotations. It treats redundant annotations as
 * maintainability concerns rather than correctness issues, and is
 * therefore exposed as a warning-level rule by default.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION REQ-STATEMENT-SIGNIFICANCE REQ-SAFE-REMOVAL REQ-DIFFERENT-REQUIREMENTS REQ-CONFIGURABLE-STRICTNESS REQ-SCOPE-INHERITANCE
 */

const DEFAULT_ALWAYS_COVERED_STATEMENTS = [
  "ReturnStatement",
  "VariableDeclaration",
] as const;

const DEFAULT_STRICTNESS: Strictness = "moderate";
const DEFAULT_ALLOW_EMPHASIS_DUPLICATION = false;
const DEFAULT_MAX_SCOPE_DEPTH = 3;

/**
 * Normalize and apply defaults to rule options for the redundancy detector.
 *
 * @story docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md
 * @req REQ-REDUNDANT-OPTIONS
 */
function normalizeOptions(raw: any | undefined): RedundancyRuleOptions {
  const strictness: Strictness =
    raw && typeof raw.strictness === "string"
      ? (raw.strictness as Strictness)
      : DEFAULT_STRICTNESS;

  const allowEmphasisDuplication =
    typeof raw?.allowEmphasisDuplication === "boolean"
      ? raw.allowEmphasisDuplication
      : DEFAULT_ALLOW_EMPHASIS_DUPLICATION;

  const maxScopeDepth =
    typeof raw?.maxScopeDepth === "number" && raw.maxScopeDepth > 0
      ? raw.maxScopeDepth
      : DEFAULT_MAX_SCOPE_DEPTH;

  const alwaysCovered: string[] = Array.isArray(raw?.alwaysCovered)
    ? raw.alwaysCovered
    : Array.from(DEFAULT_ALWAYS_COVERED_STATEMENTS);

  return {
    strictness,
    allowEmphasisDuplication,
    maxScopeDepth,
    alwaysCovered,
  };
}

/**
 * Collect comments around a scope node using JSDoc, leading comments,
 * and any comments that appear immediately before the node.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-SCOPE-INHERITANCE
 */
function getScopeCommentsFromJSDocAndLeading(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]> | any,
  scopeNode: any,
): any[] {
  const comments: any[] = [];

  const jsdoc = (sourceCode as any).getJSDocComment
    ? (sourceCode as any).getJSDocComment(scopeNode)
    : null;
  const before = (sourceCode as any).getCommentsBefore
    ? (sourceCode as any).getCommentsBefore(scopeNode) || []
    : [];

  if (jsdoc) {
    comments.push(jsdoc);
  }

  if (Array.isArray(scopeNode.leadingComments)) {
    comments.push(...scopeNode.leadingComments);
  }

  comments.push(...before);

  return comments;
}

/**
 * Compute the story/requirement pairs for annotations that apply to the
 * given scope node.
 *
 * For branch scopes we reuse the same comment-gathering helper used by
 * the require-branch-annotation rule so that REQ-SCOPE-INHERITANCE
 * aligns with existing behavior. For non-branch scopes, we reuse a
 * shared helper that collects JSDoc, leading, and immediately-before
 * comments around the scope node.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-SCOPE-INHERITANCE
 */
function getScopePairs(
  context: Rule.RuleContext,
  scopeNode: any,
  parent: any | undefined,
): Set<string> {
  const sourceCode = context.getSourceCode();

  // Branch-style scope: use the branch helpers to collect comment text.
  if (DEFAULT_BRANCH_TYPES.includes(scopeNode.type)) {
    /**
     * Inside-brace annotations used as branch-level indicators (inside placement
     * mode) should not be folded into scopePairs for redundancy purposes; only
     * before-brace annotations define the covering scope here.
     *
     * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-NON-REDUNDANT-INSIDE REQ-PLACEMENT-CONFIG
     */
    const text = gatherBranchCommentText(
      sourceCode as any,
      scopeNode,
      parent,
      "before",
    );
    return extractStoryReqPairsFromText(text);
  }

  const comments = getScopeCommentsFromJSDocAndLeading(sourceCode, scopeNode);
  return extractStoryReqPairsFromComments(comments);
}

/**
 * Collect the comments directly associated with a statement node.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE REQ-SCOPE-ANALYSIS
 */
function getStatementComments(context: Rule.RuleContext, node: any): any[] {
  const sourceCode = context.getSourceCode();
  const comments: any[] = [];

  if ((sourceCode as any).getCommentsBefore) {
    comments.push(...((sourceCode as any).getCommentsBefore(node) || []));
  }

  if (Array.isArray(node.leadingComments)) {
    comments.push(...node.leadingComments);
  }

  return comments;
}

/**
 * Debug helper for logging scope-level pairs in TRACEABILITY_DEBUG mode.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS
 */
function debugScopePairs(scopeNode: any, scopePairs: Set<string>): void {
  if (process.env.TRACEABILITY_DEBUG !== "1") {
    return;
  }

  console.log(
    "[no-redundant-annotation] Scope node type=%s pairs=%o",
    scopeNode && scopeNode.type,
    Array.from(scopePairs),
  );
}

/**
 * Walk up enclosing scopes starting from the given scope node and
 * accumulate all story/requirement pairs, limited by maxScopeDepth.
 *
 * This keeps REQ-SCOPE-INHERITANCE and REQ-CONFIGURABLE-STRICTNESS
 * aligned with the story's configuration model while delegating the
 * actual comment parsing to getScopePairs.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-SCOPE-INHERITANCE REQ-CONFIGURABLE-STRICTNESS
 */
function collectScopePairs(
  context: Rule.RuleContext,
  startingScopeNode: any | undefined,
  maxScopeDepth: number,
): Set<string> {
  const result = new Set<string>();

  if (!startingScopeNode || maxScopeDepth <= 0) {
    return result;
  }

  let current: any | undefined = startingScopeNode;
  let depth = 0;

  while (current && depth < maxScopeDepth) {
    const parent: any | undefined = (current as any).parent;
    const pairs = getScopePairs(context, current, parent);

    for (const key of pairs) {
      result.add(key);
    }

    current = parent;
    depth += 1;
  }

  return result;
}

/**
 * Extract statement-level comments and story/requirement pairs that are
 * relevant for redundancy analysis within a given scope.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-STATEMENT-SIGNIFICANCE REQ-SCOPE-ANALYSIS
 */
function getStatementPairsForRedundancy(
  context: Rule.RuleContext,
  stmt: any,
  scopePairs: Set<string>,
  options: RedundancyRuleOptions,
): { comments: any[]; pairs: Set<string> } | null {
  if (scopePairs.size === 0) {
    return null;
  }

  if (!isStatementEligibleForRedundancy(stmt, options, DEFAULT_BRANCH_TYPES)) {
    return null;
  }

  const stmtComments = getStatementComments(context, stmt);
  if (stmtComments.length === 0) {
    return null;
  }

  const stmtPairs = extractStoryReqPairsFromComments(stmtComments);

  if (process.env.TRACEABILITY_DEBUG === "1") {
    console.log(
      "[no-redundant-annotation] Statement type=%s eligible=%s commentCount=%d pairs=%o",
      stmt && stmt.type,
      isStatementEligibleForRedundancy(stmt, options, DEFAULT_BRANCH_TYPES),
      stmtComments.length,
      Array.from(stmtPairs),
    );
  }

  if (stmtPairs.size === 0) {
    return null;
  }

  return { comments: stmtComments, pairs: stmtPairs };
}

/**
 * Decide whether the provided statement-level pairs should be considered
 * redundant within the given scope, respecting configuration options.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL REQ-CONFIGURABLE-STRICTNESS
 */
function isStatementRedundantWithinScope(
  stmtPairs: Set<string>,
  scopePairs: Set<string>,
  options: RedundancyRuleOptions,
): boolean {
  if (
    options.allowEmphasisDuplication &&
    stmtPairs.size === 1 &&
    arePairsFullyCovered(stmtPairs, scopePairs)
  ) {
    return false;
  }

  if (!arePairsFullyCovered(stmtPairs, scopePairs)) {
    return false;
  }

  return true;
}

/**
 * Filter a list of comments down to those that contain traceability
 * annotations relevant for redundancy detection.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL REQ-REDUNDANCY-PATTERNS
 */
function getAnnotationCommentsFromStatement(comments: any[]): any[] {
  return comments.filter((comment) => {
    const commentText = typeof comment.value === "string" ? comment.value : "";
    return /@story\b|@req\b|@supports\b/.test(commentText);
  });
}

/**
 * Determine whether a statement is redundant relative to the provided
 * scopePairs and options, using helper functions to gather statement
 * pairs, apply redundancy rules, and collect the associated annotation
 * comments. Returns null when the statement should not be treated as
 * redundant.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL REQ-STATEMENT-SIGNIFICANCE REQ-CONFIGURABLE-STRICTNESS
 */
function getRedundantStatementContext(
  context: Rule.RuleContext,
  stmt: any,
  scopePairs: Set<string>,
  options: RedundancyRuleOptions,
): { comments: any[] } | null {
  const stmtInfo = getStatementPairsForRedundancy(
    context,
    stmt,
    scopePairs,
    options,
  );

  if (!stmtInfo) {
    return null;
  }

  const { comments, pairs } = stmtInfo;

  if (!isStatementRedundantWithinScope(pairs, scopePairs, options)) {
    return null;
  }

  const annotationComments = getAnnotationCommentsFromStatement(comments);
  if (annotationComments.length === 0) {
    return null;
  }

  return { comments: annotationComments };
}

/**
 * Compute unique removal ranges for the given annotation comments.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SAFE-REMOVAL
 */
function getRemovalRangesForAnnotationComments(
  comments: any[],
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
): [number, number][] {
  const rangeMap = new Map<string, [number, number]>();

  for (const comment of comments) {
    const [removalStart, removalEnd] = getCommentRemovalRange(
      comment,
      sourceCode,
    );
    const key = `${removalStart}:${removalEnd}`;
    if (!rangeMap.has(key)) {
      rangeMap.set(key, [removalStart, removalEnd]);
    }
  }

  return Array.from(rangeMap.values()).sort((a, b) => b[0] - a[0]);
}

/**
 * Analyze a block's statements and report redundant traceability annotations.
 *
 * This helper encapsulates the iteration and reporting logic so that the
 * BlockStatement visitor remains small and focused on scope setup.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL REQ-STATEMENT-SIGNIFICANCE
 */
function reportRedundantAnnotationsInBlock(
  context: Rule.RuleContext,
  blockNode: any,
  scopePairs: Set<string>,
  options: RedundancyRuleOptions,
): void {
  const statements: any[] = Array.isArray(blockNode.body) ? blockNode.body : [];
  if (statements.length === 0 || scopePairs.size === 0) return;

  const sourceCode = context.getSourceCode();

  for (const stmt of statements) {
    const info = getRedundantStatementContext(
      context,
      stmt,
      scopePairs,
      options,
    );
    if (!info) {
      continue;
    }

    const ranges = getRemovalRangesForAnnotationComments(
      info.comments,
      sourceCode,
    );
    if (ranges.length === 0) {
      continue;
    }

    context.report({
      node: stmt as any,
      messageId: "redundantAnnotation",
      fix(fixer) {
        return ranges.map(([start, end]) => fixer.removeRange([start, end]));
      },
    });
  }
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Detect and remove redundant traceability annotations already covered by containing scope",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          strictness: {
            enum: ["strict", "moderate", "permissive"],
          },
          allowEmphasisDuplication: {
            type: "boolean",
          },
          maxScopeDepth: {
            type: "number",
            minimum: 1,
          },
          alwaysCovered: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      /**
       * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-CLEAR-MESSAGES REQ-SAFE-REMOVAL
       */
      redundantAnnotation:
        "Annotation on this statement is redundant; it is already covered by its containing scope.",
    },
  },

  /**
   * Wire up the ESLint visitors that detect and fix redundant annotations.
   *
   * @story docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md
   * @req REQ-REDUNDANT-DETECTION
   */
  create(context) {
    const options = normalizeOptions(context.options[0]);

    return {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL
      BlockStatement(node: any) {
        const parent = (node as any).parent;

        if (process.env.TRACEABILITY_DEBUG === "1") {
          console.log(
            "[no-redundant-annotation] BlockStatement parent=%s statements=%d",
            parent && parent.type,
            Array.isArray(node.body) ? node.body.length : 0,
          );
        }

        // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-CATCH-BLOCK-HANDLING
        if (parent && parent.type === "CatchClause") {
          return;
        }

        const scopePairs = collectScopePairs(
          context,
          parent,
          options.maxScopeDepth,
        );
        debugScopePairs(parent, scopePairs);
        if (scopePairs.size === 0) return;

        reportRedundantAnnotationsInBlock(context, node, scopePairs, options);
      },
    };
  },
};

export default rule;
