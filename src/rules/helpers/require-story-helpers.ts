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
 * Derive the annotation template, optionally using an override.
 * When override is a non-empty string, its trimmed value is used.
 * Otherwise, the default template is returned.
 */
function getAnnotationTemplate(override?: string): string {
  if (typeof override === "string" && override.trim().length > 0) {
    return override.trim();
  }
  return `/** @story ${STORY_PATH} */`;
}

/**
 * Determine whether auto-fix should be applied.
 * Explicit false disables auto-fix; all other values enable it.
 */
function shouldApplyAutoFix(autoFix: boolean | undefined): boolean {
  if (autoFix === false) {
    return false;
  }
  return true;
}

/**
 * Determine if a node is in an export declaration
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Check node ancestry to find export declarations
 * @param {any} node - AST node to check for export ancestry
 * @returns {boolean} true if node is within an export declaration
 */
function isExportedNode(node: any): boolean {
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
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect
 * @returns {boolean} true if any preceding comment contains @story
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
 * @param {any} node - AST node to inspect
 * @returns {boolean} true if any leading comment contains @story
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
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect for existing annotations
 * @returns {boolean} true if @story annotation already present
 */
function hasStoryAnnotation(sourceCode: any, node: any): boolean {
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
    if (linesBeforeHasStory(sourceCode, node)) {
      return true;
    }
    if (parentChainHasStory(sourceCode, node)) {
      return true;
    }
    if (fallbackTextBeforeHasStory(sourceCode, node)) {
      return true;
    }
  } catch (error) {
    // Swallow unexpected sourceCode helper errors to keep traceability checks
    // from breaking lint runs; emit debug output only when TRACEABILITY_DEBUG=1
    // so normal CI and editor usage remain silent.
    console.error(
      "[traceability] hasStoryAnnotation failed for node",
      (error as Error)?.message ?? error,
    );
  }

  return false;
}

/**
 * Determine AST node where annotation should be inserted
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Determine correct insertion target for annotation
 * @param {any} sourceCode - ESLint sourceCode object (unused but kept for parity)
 * @param {any} node - function-like AST node to resolve target for
 * @returns {any} AST node that should receive the annotation
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
 * @param {any} node - AST node to inspect
 * @returns {string | null} identifier name or null when not applicable
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
 * Supports common function and method containers, including literal keys.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize container id/key-based names into a single helper
 * @param {any} node - AST node that may contain id/key name information
 * @returns {string | null} resolved container name or null when unavailable
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
 * Walks up the parent chain and inspects common properties (id, key, name, Identifier nodes).
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Walk node and parents to find Identifier/Key name
 * @param {any} node - AST node to extract a name from
 * @returns {string} extracted name or "(anonymous)" when no name found
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

function shouldProcessNode(
  node: any,
  scope: string[],
  exportPriority: string = "all",
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

interface ReportOptions {
  annotationTemplateOverride?: string;
  autoFixToggle?: boolean;
}

/**
 * Resolve the effective function name to report for a node.
 * Normalizes id/key handling before delegating to extractName.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize reported function name resolution
 * @param {any} node - AST node used to derive the function name
 * @returns {string} resolved function name
 */
function getReportedFunctionName(node: any): string {
  const candidate = node && (node.id || node.key) ? node.id || node.key : node;
  return extractName(candidate);
}

/**
 * Determine the most appropriate AST node to anchor error location for a report.
 * Prefers Identifier nodes from id/key properties when available.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize name node selection for error reporting
 * @param {any} node - AST node used for error anchoring
 * @returns {any} node to use as the report location
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
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - original function-like AST node
 * @param {any} passedTarget - optional explicit annotation target
 * @returns {any} node that should receive the annotation
 */
function resolveAnnotationTargetNode(
  sourceCode: any,
  node: any,
  passedTarget: any,
): any {
  return passedTarget ?? resolveTargetNode(sourceCode, node);
}

/**
 * Build the effective annotation template and autofix toggle
 * from the provided report options.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize template and autofix configuration
 * @param {ReportOptions} [options] - optional report configuration
 * @returns {{ effectiveTemplate: string; allowFix: boolean }} template and autofix flags
 */
function buildTemplateConfig(options?: ReportOptions): {
  effectiveTemplate: string;
  allowFix: boolean;
} {
  const effectiveTemplate = getAnnotationTemplate(
    options?.annotationTemplateOverride,
  );
  const allowFix = shouldApplyAutoFix(options?.autoFixToggle);

  return { effectiveTemplate, allowFix };
}

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
