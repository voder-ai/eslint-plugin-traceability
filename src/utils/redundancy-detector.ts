/* eslint-disable traceability/require-branch-annotation */

import type { Rule } from "eslint";
import {
  extractStoryReqPairsFromComments,
  extractStoryReqPairsFromText,
  arePairsFullyCovered,
  getCommentRemovalRange,
  isStatementEligibleForRedundancy,
  type RedundancyRuleOptions,
} from "./annotation-scope-analyzer";
import {
  DEFAULT_BRANCH_TYPES,
  gatherBranchCommentText,
} from "./branch-annotation-helpers";

/**
 * Collect comments around a scope node using JSDoc, leading comments,
 * and any comments that appear immediately before the node.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-SCOPE-INHERITANCE
 */
export function getScopeCommentsFromJSDocAndLeading(
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
 * Extract traceability pairs (story-req combinations) from comments
 * directly attached to the provided scope node.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-SCOPE-INHERITANCE
 */
export function getScopePairs(
  sourceCode: ReturnType<Rule.RuleContext["getSourceCode"]>,
  scopeNode: any,
  parent: any,
): Set<string> {
  if (DEFAULT_BRANCH_TYPES.includes(scopeNode.type)) {
    const commentText = gatherBranchCommentText(
      sourceCode as any,
      scopeNode,
      parent,
      "before",
    );
    return extractStoryReqPairsFromText(commentText);
  }

  const directComments = getScopeCommentsFromJSDocAndLeading(
    sourceCode,
    scopeNode,
  );
  if (directComments.length === 0) {
    return new Set();
  }

  return extractStoryReqPairsFromComments(directComments);
}

/**
 * Collect statement's immediate comments (leading, trailing, JSDoc).
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE REQ-SAFE-REMOVAL
 */
export function getStatementComments(
  context: Rule.RuleContext,
  node: any,
): any[] {
  const sourceCode = context.getSourceCode();
  const comments: any[] = [];

  if ((sourceCode as any).getCommentsBefore) {
    comments.push(...((sourceCode as any).getCommentsBefore(node) || []));
  }

  if (Array.isArray(node.leadingComments)) {
    comments.push(...node.leadingComments);
  }

  const jsdoc = (sourceCode as any).getJSDocComment
    ? (sourceCode as any).getJSDocComment(node)
    : null;
  if (jsdoc) {
    comments.push(jsdoc);
  }

  return comments;
}

/**
 * Debug log scope pairs when TRACEABILITY_DEBUG is enabled.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS
 */
export function debugScopePairs(scopeNode: any, scopePairs: Set<string>): void {
  if (process.env.TRACEABILITY_DEBUG === "1") {
    console.log(
      "[no-redundant-annotation] Scope %s has %d pairs: %s",
      scopeNode && scopeNode.type,
      scopePairs.size,
      Array.from(scopePairs)
        .map((p) => `"${p}"`)
        .join(", "),
    );
  }
}

/**
 * Recursively collect traceability pairs from the given scope node and
 * its ancestors up to maxDepth levels.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-INHERITANCE REQ-CONFIGURABLE-STRICTNESS
 */
export function collectScopePairs(
  context: Rule.RuleContext,
  scopeNode: any,
  maxDepth: number,
): Set<string> {
  const allPairs = new Set<string>();
  let currentNode = scopeNode;
  let depth = 0;

  while (currentNode && depth < maxDepth) {
    const parent = currentNode.parent;
    const nodePairs = getScopePairs(
      context.getSourceCode(),
      currentNode,
      parent,
    );
    nodePairs.forEach((pair) => allPairs.add(pair));

    if (allPairs.size > 0 && depth > 0) {
      break;
    }

    currentNode = parent;
    depth++;
  }

  return allPairs;
}

/**
 * Gather pairs and comments from a statement for redundancy checking.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-STATEMENT-SIGNIFICANCE REQ-CONFIGURABLE-STRICTNESS REQ-DIFFERENT-REQUIREMENTS
 */
export function getStatementPairsForRedundancy(
  context: Rule.RuleContext,
  stmt: any,
  scopePairs: Set<string>,
  options: RedundancyRuleOptions,
): { comments: any[]; pairs: Set<string> } | null {
  if (!isStatementEligibleForRedundancy(stmt, options, DEFAULT_BRANCH_TYPES)) {
    return null;
  }

  const comments = getStatementComments(context, stmt);
  if (comments.length === 0) {
    return null;
  }

  const pairs = extractStoryReqPairsFromComments(comments);

  if (process.env.TRACEABILITY_DEBUG === "1") {
    console.log(
      "[no-redundant-annotation] Statement %s has %d pairs: %s (scope has %d)",
      stmt.type,
      pairs.size,
      Array.from(pairs)
        .map((p) => `"${p}"`)
        .join(", "),
      scopePairs.size,
    );
  }

  if (pairs.size === 0) {
    return null;
  }

  return { comments, pairs };
}

/**
 * Determine whether statement pairs are redundant within scope pairs
 * according to configured options.
 *
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-REDUNDANCY-PATTERNS REQ-CONFIGURABLE-STRICTNESS
 */
export function isStatementRedundantWithinScope(
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
export function getAnnotationCommentsFromStatement(comments: any[]): any[] {
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
export function getRedundantStatementContext(
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
export function getRemovalRangesForAnnotationComments(
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
export function reportRedundantAnnotationsInBlock(
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
