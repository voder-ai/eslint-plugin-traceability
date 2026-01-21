/* eslint-disable traceability/require-branch-annotation */

/**
 * Node classification utilities for require-story rule
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TEST-CALLBACK-EXCLUSION
 */
import {
  getContainerKeyOrIdName,
  getDirectIdentifierName,
} from "./require-story-name-extraction";

/**
 * Check if a name is valid (not null, not empty, not "(anonymous)").
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function isValidName(name: string | null): boolean {
  return typeof name === "string" && name.length > 0 && name !== "(anonymous)";
}

/**
 * Get name from VariableDeclarator parent.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function getNameFromVariableDeclarator(parent: any): string | null {
  if (parent.type === "VariableDeclarator" && parent.id) {
    return (
      getContainerKeyOrIdName(parent) ?? getDirectIdentifierName(parent.id)
    );
  }
  return null;
}

/**
 * Get name from Property parent.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function getNameFromProperty(parent: any): string | null {
  if (parent.type === "Property" && parent.key) {
    return (
      getContainerKeyOrIdName(parent) ?? getDirectIdentifierName(parent.key)
    );
  }
  return null;
}

/**
 * Determine whether a node represents an anonymous arrow function expression
 * where the parent variable declarator has no explicit Identifier name.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
export function isAnonymousArrowFunction(node: any): boolean {
  if (!node || node.type !== "ArrowFunctionExpression") {
    return false;
  }

  if (!node.parent) {
    return true;
  }

  // Check for name from VariableDeclarator or Property parent
  const name =
    getNameFromVariableDeclarator(node.parent) ??
    getNameFromProperty(node.parent);
  if (isValidName(name)) {
    return false; // Has a name, so it's a named arrow
  }

  return true; // Truly anonymous
}

/**
 * Determine whether a function-like node is nested within another function.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TEST-CALLBACK-EXCLUSION
 */
export function isNestedFunction(node: any): boolean {
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
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TEST-CALLBACK-EXCLUSION
 */
export function isEffectivelyAnonymousFunction(node: any): boolean {
  // Check node itself for name (FunctionDeclaration, MethodDefinition, etc.)
  const name = getContainerKeyOrIdName(node) ?? getDirectIdentifierName(node);
  if (isValidName(name)) {
    return false;
  }

  // For arrow functions specifically, check parent for name since arrows never have their own id.
  if (node.type === "ArrowFunctionExpression" && node.parent) {
    const parentName =
      getNameFromVariableDeclarator(node.parent) ??
      getNameFromProperty(node.parent);
    if (isValidName(parentName)) {
      return false;
    }
  }

  return true;
}

/**
 * Determine if a node is in an export declaration
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-EXPORT-PRIORITY
 */
export function isExportedNode(node: any): boolean {
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
 * Determine AST node where annotation should be inserted
 *
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-PRESERVE
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
 * Resolve the node that should receive the `@story` annotation,
 * respecting an explicitly passed target when provided.
 *
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-PRESERVE
 */
export function resolveAnnotationTargetNode(
  sourceCode: any,
  node: any,
  passedTarget: any,
): any {
  return passedTarget ?? resolveTargetNode(sourceCode, node);
}
