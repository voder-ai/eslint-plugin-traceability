/**
 * Helpers for the "require-story" rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - File-level header for rule helper utilities
 */
import type { Rule } from "eslint";
import {
  linesBeforeHasStory,
  parentChainHasStory,
  fallbackTextBeforeHasStory,
} from "./require-story-io";

import {
  createAddStoryFix,
  createMethodFix,
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
} from "./require-story-core";

export { DEFAULT_SCOPE, EXPORT_PRIORITY_VALUES };

/**
 * Path to the story file for annotations
 */
export const STORY_PATH =
  "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
export const ANNOTATION = `/** @story ${STORY_PATH} */`;

/**
 * Number of physical source lines to inspect before a node when searching for @story text
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Replace magic number for lookback lines with named constant
 */
export const LOOKBACK_LINES = 4;

/**
 * Window (in characters) to inspect before a node as a fallback when searching for @story text
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Replace magic number for fallback text window with named constant
 */
export const FALLBACK_WINDOW = 800;

/**
 * Determine if a node is in an export declaration
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Check node ancestry to find export declarations
 * @param {any} node - AST node to check for export ancestry
 * @returns {boolean} true if node is within an export declaration
 */
export function isExportedNode(node: any): boolean {
  let p = node.parent;
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Walk parent chain to find Export declarations
  while (p) {
    if (
      p.type === "ExportNamedDeclaration" ||
      p.type === "ExportDefaultDeclaration"
    ) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

/**
 * Check whether the JSDoc associated with node contains @story
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract JSDoc based detection into helper
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect
 * @returns {boolean} true if JSDoc contains @story
 */
export function jsdocHasStory(sourceCode: any, node: any): boolean {
  if (typeof sourceCode?.getJSDocComment !== "function") {
    return false;
  }
  const jsdoc = sourceCode.getJSDocComment(node);
  return !!(
    jsdoc &&
    typeof jsdoc.value === "string" &&
    jsdoc.value.includes("@story")
  );
}

/**
 * Check whether comments returned by sourceCode.getCommentsBefore contain @story
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract comment-before detection into helper
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect
 * @returns {boolean} true if any preceding comment contains @story
 */
export function commentsBeforeHasStory(sourceCode: any, node: any): boolean {
  if (typeof sourceCode?.getCommentsBefore !== "function") {
    return false;
  }
  const commentsBefore = sourceCode.getCommentsBefore(node) || [];
  return (
    Array.isArray(commentsBefore) &&
    commentsBefore.some(
      (c: any) => typeof c.value === "string" && c.value.includes("@story"),
    )
  );
}

/**
 * Check whether leadingComments attached to the node contain @story
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract leadingComments detection into helper
 * @param {any} node - AST node to inspect
 * @returns {boolean} true if any leading comment contains @story
 */
export function leadingCommentsHasStory(node: any): boolean {
  const leadingComments = (node && node.leadingComments) || [];
  return (
    Array.isArray(leadingComments) &&
    leadingComments.some(
      (c: any) => typeof c.value === "string" && c.value.includes("@story"),
    )
  );
}

/**
 * Check if @story annotation already present in JSDoc or preceding comments
 * Consolidates a variety of heuristics through smaller helpers.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Detect existing story annotations in JSDoc or comments
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect for existing annotations
 * @returns {boolean} true if @story annotation already present
 */
export function hasStoryAnnotation(sourceCode: any, node: any): boolean {
  try {
    if (jsdocHasStory(sourceCode, node)) {
      return true;
    }
    if (commentsBeforeHasStory(sourceCode, node)) {
      return true;
    }
    if (leadingCommentsHasStory(node)) {
      return true;
    }
    if (linesBeforeHasStory(sourceCode, node, LOOKBACK_LINES)) {
      return true;
    }
    if (parentChainHasStory(sourceCode, node)) {
      return true;
    }
    if (fallbackTextBeforeHasStory(sourceCode, node)) {
      return true;
    }
  } catch {
    /* noop */
  }

  return false;
}

/**
 * Get the name of the function-like node
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Resolve a human-friendly name for a function-like AST node
 * @param {any} node - AST node representing a function-like construct
 * @returns {string} the resolved name or "<unknown>"
 */
export function getNodeName(node: any): string {
  let current: any = node;
  while (current) {
    if (
      current.type === "VariableDeclarator" &&
      current.id &&
      typeof current.id.name === "string"
    ) {
      return current.id.name;
    }
    if (
      (current.type === "FunctionDeclaration" ||
        current.type === "TSDeclareFunction") &&
      current.id &&
      typeof current.id.name === "string"
    ) {
      return current.id.name;
    }
    if (
      (current.type === "MethodDefinition" ||
        current.type === "TSMethodSignature") &&
      current.key &&
      typeof current.key.name === "string"
    ) {
      return current.key.name;
    }
    current = current.parent;
  }
  return "<unknown>";
}

/**
 * Determine AST node where annotation should be inserted
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Determine correct insertion target for annotation
 * @param {any} sourceCode - ESLint sourceCode object (unused but kept for parity)
 * @param {any} node - function-like AST node to resolve target for
 * @returns {any} AST node that should receive the annotation
 */
export function resolveTargetNode(sourceCode: any, node: any): any {
  if (node.type === "TSMethodSignature") {
    // Interface method signature -> insert on interface
    return node.parent.parent;
  }
  if (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    const parent = node.parent;
    if (parent.type === "VariableDeclarator") {
      const varDecl = parent.parent;
      if (varDecl.parent && varDecl.parent.type === "ExportNamedDeclaration") {
        return varDecl.parent;
      }
      return varDecl;
    }
    if (parent.type === "ExportNamedDeclaration") {
      return parent;
    }
    if (parent.type === "ExpressionStatement") {
      return parent;
    }
  }
  return node;
}

/**
 * Check if this node is within scope and matches exportPriority
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Determine whether a node should be processed by rule
 * @param {any} node - AST node to evaluate
 * @param {string[]} scope - allowed node types
 * @param {string} exportPriority - 'all' | 'exported' | 'non-exported'
 * @returns {boolean} whether node should be processed
 */
export function shouldProcessNode(
  node: any,
  scope: string[],
  exportPriority: string,
): boolean {
  if (!scope.includes(node.type)) {
    return false;
  }
  const exported = isExportedNode(node);
  if (exportPriority === "exported" && !exported) {
    return false;
  }
  if (exportPriority === "non-exported" && exported) {
    return false;
  }
  return true;
}

/**
 * Report a missing @story annotation for a function-like node
 * Provides a suggestion to add the annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Implement reporting for missing annotations with suggestion
 * @param {Rule.RuleContext} context - ESLint rule context used to report
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node that is missing the annotation
 */
export function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
): void {
  try {
    if (hasStoryAnnotation(sourceCode, node)) {
      return;
    }
    const target = resolveTargetNode(sourceCode, node);
    const name = getNodeName(node);
    context.report({
      node,
      message: `Missing @story annotation for ${name}`,
      suggest: [
        {
          desc: "Add @story annotation",
          fix: createAddStoryFix(sourceCode, target),
        },
      ],
    });
  } catch {
    /* noop */
  }
}

/**
 * Report a missing @story annotation for a method-like node
 * Provides a suggestion to update the method/interface with the annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Implement reporting for missing method/interface annotations with suggestion
 * @param {Rule.RuleContext} context - ESLint rule context used to report
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node that is missing the annotation
 */
export function reportMethod(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
): void {
  try {
    if (hasStoryAnnotation(sourceCode, node)) {
      return;
    }
    const target = resolveTargetNode(sourceCode, node);
    const name = getNodeName(node);
    context.report({
      node,
      message: `Missing @story annotation for method ${name}`,
      suggest: [
        {
          desc: "Add @story annotation to method",
          fix: createMethodFix(sourceCode, target),
        },
      ],
    });
  } catch {
    /* noop */
  }
}

/**
 * Explicit exports for require-story-annotation consumers
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Explicitly export helper functions and constants used by requiring modules
 */
export {
  shouldProcessNode,
  resolveTargetNode,
  reportMissing,
  reportMethod,
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
};
