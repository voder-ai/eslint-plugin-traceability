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
 * Compute the story/requirement pairs for annotations that apply to the
 * given scope node.
 *
 * For branch scopes we reuse the same comment-gathering helper used by
 * the require-branch-annotation rule so that REQ-SCOPE-INHERITANCE
 * aligns with existing behavior.
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
    const text = gatherBranchCommentText(sourceCode as any, scopeNode, parent);
    return extractStoryReqPairsFromText(text);
  }

  // Function-like scopes: collect from JSDoc and leading/before comments
  const FUNCTION_LIKE_TYPES = new Set([
    "FunctionDeclaration",
    "FunctionExpression",
    "ArrowFunctionExpression",
    "MethodDefinition",
    "TSDeclareFunction",
    "TSMethodSignature",
  ]);

  const comments: any[] = [];

  if (FUNCTION_LIKE_TYPES.has(scopeNode.type)) {
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

    return extractStoryReqPairsFromComments(comments);
  }

  // Fallback: inspect JSDoc and leading comments around the scope node.
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
  if (statements.length === 0) return;

  for (const stmt of statements) {
    if (
      !isStatementEligibleForRedundancy(stmt, options, DEFAULT_BRANCH_TYPES)
    ) {
      continue;
    }

    const stmtComments = getStatementComments(context, stmt);
    if (stmtComments.length === 0) {
      continue;
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
      continue;
    }

    if (!arePairsFullyCovered(stmtPairs, scopePairs)) {
      continue;
    }

    // At this point the statement-level annotations are fully
    // covered by the parent scope and therefore redundant.
    for (const comment of stmtComments) {
      const commentText =
        typeof comment.value === "string" ? comment.value : "";
      if (!/@story\b|@req\b|@supports\b/.test(commentText)) {
        continue;
      }

      const [removalStart, removalEnd] = getCommentRemovalRange(
        comment,
        context.getSourceCode(),
      );

      context.report({
        node: stmt as any,
        messageId: "redundantAnnotation",
        fix(fixer) {
          return fixer.removeRange([removalStart, removalEnd]);
        },
      });
    }
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

  create(context) {
    const options = normalizeOptions(context.options[0]);

    return {
      // @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-SAFE-REMOVAL
      BlockStatement(node: any) {
        const parent = (node as any).parent;
        const scopeNode = parent;

        if (process.env.TRACEABILITY_DEBUG === "1") {
          console.log(
            "[no-redundant-annotation] BlockStatement parent=%s statements=%d",
            parent && parent.type,
            Array.isArray(node.body) ? node.body.length : 0,
          );
        }

        const scopePairs = getScopePairs(context, scopeNode, scopeNode?.parent);
        debugScopePairs(scopeNode, scopePairs);
        if (scopePairs.size === 0) return;

        reportRedundantAnnotationsInBlock(context, node, scopePairs, options);
      },
    };
  },
};

export default rule;
