/**
 * Helpers for the "require-story" rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - File-level header for rule helper utilities
 */
import type { Rule } from "eslint";

// Path to the story file for annotations
export const STORY_PATH =
  "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
export const ANNOTATION = `/** @story ${STORY_PATH} */`;

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
 * Check if @story annotation already present in JSDoc or preceding comments
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Detect existing story annotations in JSDoc or comments
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect for existing annotations
 * @returns {boolean} true if @story annotation already present
 */
export function hasStoryAnnotation(sourceCode: any, node: any): boolean {
  const jsdoc = sourceCode.getJSDocComment(node);
  if (jsdoc?.value.includes("@story")) {
    return true;
  }
  const comments = sourceCode.getCommentsBefore(node) || [];
  return comments.some((c: any) => c.value.includes("@story"));
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
 * Create a fixer function that inserts a @story annotation before the target node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix function for missing @story annotations
 * @param {any} target - AST node where annotation should be inserted
 * @returns {Function} fixer function to be returned in ESLint suggestion/fix
 */
export function createAddStoryFix(target: any) {
  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Provide automatic fix to insert @story annotation
   */
  return function addStoryFixer(fixer: any) {
    return fixer.insertTextBefore(target, `${ANNOTATION}\n`);
  };
}

/**
 * Create a fixer function for class method annotations.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
 * @param {any} node - method AST node
 * @returns {Function} fixer function for method fixes
 */
export function createMethodFix(node: any) {
  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
   */
  return function methodFixer(fixer: any) {
    return fixer.insertTextBefore(node, `${ANNOTATION}\n  `);
  };
}

/**
 * Default set of node types to check for missing @story annotations.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Provide sensible default scope for rule checks
 */
export const DEFAULT_SCOPE: string[] = [
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "MethodDefinition",
  "TSMethodSignature",
  "TSDeclareFunction",
  "VariableDeclarator",
];

/**
 * Allowed values for export priority option.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Enumerate accepted export priority option values
 */
export const EXPORT_PRIORITY_VALUES = ["all", "exported", "non-exported"];

/**
 * Report a missing @story annotation for a general function-like node.
 * Uses helpers to determine name, target insertion point and autofix.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Report missing annotation and provide autofix using createAddStoryFix
 * @param {Rule.RuleContext} context - ESLint rule context used to report
 * @param {any} sourceCode - ESLint sourceCode object (use context.getSourceCode() if not provided)
 * @param {any} node - AST node missing the @story annotation
 * @param {any} [target] - optional target node where annotation should be inserted
 */
export function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
  target?: any,
) {
  const sc = sourceCode || context.getSourceCode();
  if (hasStoryAnnotation(sc, node)) {
    return;
  }
  const name = getNodeName(node);
  const resolvedTarget = target ?? resolveTargetNode(sc, node);
  context.report({
    node,
    messageId: "missingStory",
    data: { name },
    suggestions: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${ANNOTATION}`,
        fix: createAddStoryFix(resolvedTarget),
      },
    ],
  });
}

/**
 * Report a missing @story annotation specifically for class/interface methods.
 * Uses method-specific fixer to preserve indentation/placement.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Report missing method annotation and provide autofix using createMethodFix
 * @param {Rule.RuleContext} context - ESLint rule context used to report
 * @param {any} sourceCode - ESLint sourceCode object (use context.getSourceCode() if not provided)
 * @param {any} node - method AST node missing the @story annotation
 * @param {any} [target] - optional target node where annotation should be inserted
 */
export function reportMethod(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
  target?: any,
) {
  const sc = sourceCode || context.getSourceCode();
  if (hasStoryAnnotation(sc, node)) {
    return;
  }
  const name = getNodeName(node);
  const resolvedTarget = target ?? node;
  context.report({
    node,
    messageId: "missingStory",
    data: { name },
    suggestions: [
      {
        desc: `Add JSDoc @story annotation for method '${name}', e.g., ${ANNOTATION}`,
        fix: createMethodFix(resolvedTarget),
      },
    ],
  });
}
