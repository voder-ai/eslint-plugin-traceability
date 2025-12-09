/**
 * Helpers for the "require-story" rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED - File-level header for rule helper utilities
 * @req REQ-AUTOFIX-MISSING
 * @req REQ-AUTOFIX-TEMPLATE
 * @req REQ-AUTOFIX-SELECTIVE
 */
import type { Rule } from "eslint";
import {
  linesBeforeHasStory,
  parentChainHasStory,
  fallbackTextBeforeHasStory,
} from "./require-story-io";
import { getNodeName } from "./require-story-utils";

import {
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  STORY_PATH,
  createAddStoryFix,
  createMethodFix,
  coreReportMissing,
  coreReportMethod,
} from "./require-story-core";

/**
 * Shared configuration helpers
 */

interface ReportOptions {
  annotationTemplateOverride?: string;
  autoFixToggle?: boolean;
  excludeTestCallbacks?: boolean;
}

/**
 * Known test framework function names and variants.
 * Includes Jest, Mocha, Vitest and their focused/skipped/concurrent variants.
 * @req REQ-TEST-CALLBACK-EXCLUSION
 */
const TEST_FUNCTION_NAMES = new Set([
  "it",
  "test",
  "describe",
  "fit",
  "xit",
  "ftest",
  "xtest",
  "fdescribe",
  "xdescribe",
]);

const TEST_FUNCTION_CONCURRENT_PROP = "concurrent";

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function getAnnotationTemplate(
  override?: string,
  _options?: { excludeTestCallbacks?: boolean },
): string {
  if (typeof override === "string" && override.trim().length > 0) {
    return override.trim();
  }
  return `/** @story ${STORY_PATH} */`;
}

function shouldApplyAutoFix(
  autoFix: boolean | undefined,
  _options?: { excludeTestCallbacks?: boolean },
): boolean {
  if (autoFix === false) {
    return false;
  }
  return true;
}

/**
 * Build the effective annotation template and autofix toggle
 * from the provided report options.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function buildTemplateConfig(options?: ReportOptions): {
  effectiveTemplate: string;
  allowFix: boolean;
} {
  const effectiveTemplate = getAnnotationTemplate(
    options?.annotationTemplateOverride,
    { excludeTestCallbacks: options?.excludeTestCallbacks },
  );
  const allowFix = shouldApplyAutoFix(options?.autoFixToggle, {
    excludeTestCallbacks: options?.excludeTestCallbacks,
  });

  return { effectiveTemplate, allowFix };
}

/**
 * Determine whether a node represents an anonymous arrow function expression
 * where the parent variable declarator has no explicit Identifier name.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ARROW-FUNCTION-EXCLUDED
 */
function isAnonymousArrowFunction(node: any): boolean {
  return !!node && node.type === "ArrowFunctionExpression";
}

/**
 * Determine whether a function-like node is nested within another function.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-NESTED-FUNCTION-INHERITANCE
 */
function isNestedFunction(node: any): boolean {
  let current = node?.parent;
  while (current) {
    if (
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression" ||
      current.type === "ArrowFunctionExpression" ||
      current.type === "MethodDefinition" ||
      current.type === "TSDeclareFunction" ||
      current.type === "TSMethodSignature"
    ) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Determine whether a function-like node is effectively anonymous for the
 * purposes of nested-function inheritance. Named functions must always carry
 * their own annotations, while anonymous nested functions may inherit.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-NESTED-FUNCTION-INHERITANCE
 */
function isEffectivelyAnonymousFunction(node: any): boolean {
  const name = getContainerKeyOrIdName(node) ?? getDirectIdentifierName(node);
  if (typeof name === "string" && name.length > 0 && name !== "(anonymous)") {
    return false;
  }
  return true;
}

/**
 * Determine whether a node represents a callback passed to a known test
 * framework function (Jest, Mocha, Vitest, etc).
 *
 * Supports:
 * - it(), test(), describe(), fit(), xit(), ftest(), xtest(), fdescribe(), xdescribe()
 * - their .concurrent variants (e.g., it.concurrent(), test.concurrent())
 *
 * @req REQ-TEST-CALLBACK-EXCLUSION
 */
function isTestFrameworkCallback(
  node: any,
  options?: { excludeTestCallbacks?: boolean },
): boolean {
  if (options?.excludeTestCallbacks === false) {
    return false;
  }

  if (!node || node.type !== "ArrowFunctionExpression") {
    return false;
  }

  const parent = node.parent;
  if (!parent || parent.type !== "CallExpression") {
    return false;
  }

  const callee = parent.callee;

  if (callee.type === "Identifier") {
    return TEST_FUNCTION_NAMES.has(callee.name);
  }

  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property &&
    callee.property.type === "Identifier" &&
    callee.property.name === TEST_FUNCTION_CONCURRENT_PROP
  ) {
    const obj = callee.object;
    if (obj && obj.type === "Identifier") {
      return TEST_FUNCTION_NAMES.has(obj.name);
    }
  }

  return false;
}

/**
 * Determine whether a function node is required to carry its own annotation
 * according to Story 004.0-DEV-BRANCH-ANNOTATIONS rules.
 *
 * - Anonymous arrow functions used as callbacks are excluded from
 *   function-level annotation requirements.
 * - Named arrow functions must be annotated.
 * - Nested anonymous functions may inherit their parent function's
 *   annotation and therefore are not required to be annotated directly.
 * - Named nested functions must always carry their own explicit annotations.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ARROW-FUNCTION-EXCLUDED REQ-NESTED-FUNCTION-INHERITANCE
 */
function requiresOwnFunctionAnnotation(
  node: any,
  options?: { excludeTestCallbacks?: boolean },
): boolean {
  if (isTestFrameworkCallback(node, options)) {
    return false;
  }

  // Anonymous arrow functions used as callbacks are excluded from function-level
  // requirements when they are nested inside another function or method.
  if (
    isAnonymousArrowFunction(node) &&
    isNestedFunction(node) &&
    isEffectivelyAnonymousFunction(node)
  ) {
    return false;
  }

  if (isNestedFunction(node) && isEffectivelyAnonymousFunction(node)) {
    return false;
  }

  return true;
}

/**
 * Determine if a node is in an export declaration
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Check node ancestry to find export declarations
 */
function isExportedNode(node: any): boolean {
  let p = node.parent;
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
 */
function jsdocHasStory(sourceCode: any, node: any): boolean {
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
 */
function commentsBeforeHasStory(sourceCode: any, node: any): boolean {
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
 */
function leadingCommentsHasStory(node: any): boolean {
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
 */
function hasStoryAnnotation(sourceCode: any, node: any): boolean {
  try {
    // Direct, node-local checks always apply first.
    if (jsdocHasStory(sourceCode, node)) {
      return true;
    }
    if (commentsBeforeHasStory(sourceCode, node)) {
      return true;
    }
    if (leadingCommentsHasStory(node)) {
      return true;
    }
    if (!isNestedFunction(node) && linesBeforeHasStory(sourceCode, node)) {
      return true;
    }

    const canInherit =
      isNestedFunction(node) && isEffectivelyAnonymousFunction(node);

    // Only nodes that are allowed to inherit annotations (e.g., nested anonymous
    // callbacks) may treat parent-chain comments or broad fallback text as
    // satisfying the annotation requirement.
    if (canInherit && parentChainHasStory(sourceCode, node)) {
      return true;
    }
    if (canInherit && fallbackTextBeforeHasStory(sourceCode, node)) {
      return true;
    }

    if (canInherit) {
      return true;
    }
  } catch (error) {
    if (process.env.TRACEABILITY_DEBUG === "1") {
      console.error(
        "[traceability] hasStoryAnnotation failed for node",
        (error as Error)?.message ?? error,
      );
    }
  }

  return false;
}

/**
 * Determine AST node where annotation should be inserted
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Determine correct insertion target for annotation
 */
function resolveTargetNode(sourceCode: any, node: any): any {
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
 * Extract a direct Identifier name when available on the given node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract direct Identifier-based names from nodes
 */
function getDirectIdentifierName(node: any): string | null {
  if (
    node &&
    node.type === "Identifier" &&
    typeof node.name === "string" &&
    node.name.length > 0
  ) {
    return node.name;
  }
  return null;
}

/**
 * Normalize container nodes that expose names via id/key properties.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize container id/key-based names into a single helper
 */
function getContainerKeyOrIdName(node: any): string | null {
  if (!node) {
    return null;
  }

  if (node.id) {
    const idName = getNodeName(node.id);
    if (typeof idName === "string" && idName.length > 0) {
      return idName;
    }
  }

  if (node.key) {
    const keyName = getNodeName(node.key);
    if (typeof keyName === "string" && keyName.length > 0) {
      return keyName;
    }

    if (
      node.key.type === "Literal" &&
      typeof (node.key as any).value === "string" &&
      (node.key as any).value.length > 0
    ) {
      return (node.key as any).value;
    }
  }

  return null;
}

/**
 * Small utility to walk the node and its parents to extract an Identifier or key name.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Walk node and parents to find Identifier/Key name
 */
function extractName(node: any): string {
  let current: any = node;

  while (current) {
    const directIdentifierName = getDirectIdentifierName(current);
    if (directIdentifierName) {
      return directIdentifierName;
    }

    const containerName = getContainerKeyOrIdName(current);
    if (containerName) {
      return containerName;
    }

    const directName = (current as any).name;
    if (typeof directName === "string" && directName.length > 0) {
      return directName;
    }

    current = current.parent;
  }

  return "(anonymous)";
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function shouldProcessNode(
  node: any,
  scope: string[],
  exportPriority: string = "all",
  options?: { excludeTestCallbacks?: boolean },
): boolean {
  if (
    node &&
    (node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression") &&
    !requiresOwnFunctionAnnotation(node, options)
  ) {
    return false;
  }

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
 * Resolve the effective function name to report for a node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize reported function name resolution
 */
function getReportedFunctionName(node: any): string {
  const candidate = node && (node.id || node.key) ? node.id || node.key : node;
  return extractName(candidate);
}

/**
 * Determine the most appropriate AST node to anchor error location for a report.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize name node selection for error reporting
 */
function getNameNodeForReport(node: any): any {
  if (node?.id?.type === "Identifier") {
    return node.id;
  }

  if (node?.key?.type === "Identifier") {
    return node.key;
  }

  return node;
}

/**
 * Resolve the node that should receive the @story annotation,
 * respecting an explicitly passed target when provided.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize annotation target node resolution
 */
function resolveAnnotationTargetNode(
  sourceCode: any,
  node: any,
  passedTarget: any,
): any {
  return passedTarget ?? resolveTargetNode(sourceCode, node);
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: ReportOptions },
): void {
  coreReportMissing(
    {
      hasStoryAnnotation,
      getReportedFunctionName,
      resolveAnnotationTargetNode,
      getNameNodeForReport,
      buildTemplateConfig,
      extractName,
      getAnnotationTemplate,
      shouldApplyAutoFix,
      createAddStoryFix,
      createMethodFix,
    },
    context,
    sourceCode,
    config,
  );
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function reportMethod(
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: ReportOptions },
): void {
  coreReportMethod(
    {
      hasStoryAnnotation,
      getReportedFunctionName,
      resolveAnnotationTargetNode,
      getNameNodeForReport,
      buildTemplateConfig,
      extractName,
      getAnnotationTemplate,
      shouldApplyAutoFix,
      createAddStoryFix,
      createMethodFix,
    },
    context,
    sourceCode,
    config,
  );
}

/**
 * Explicit exports for require-story-annotation helpers.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
export {
  STORY_PATH,
  getAnnotationTemplate,
  shouldApplyAutoFix,
  isExportedNode,
  jsdocHasStory,
  commentsBeforeHasStory,
  leadingCommentsHasStory,
  hasStoryAnnotation,
  getNodeName,
  extractName,
  resolveTargetNode,
  shouldProcessNode,
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  linesBeforeHasStory,
  parentChainHasStory,
  fallbackTextBeforeHasStory,
  reportMissing,
  reportMethod,
};
