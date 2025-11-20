/**
 * src/rules/helpers/require-story-utils.ts
 *
 * Utility: getNodeName
 *
 * Traceability:
 * - File: src/rules/helpers/require-story-utils.ts
 * - Purpose: Helper used by rules to obtain a readable "name" from various AST node shapes.
 * - Created to centralize logic for extracting identifier/property/literal names from ESTree / TSESTree nodes.
 *
 * Docs/Annotations:
 * - Story: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * - Requirement annotation: REQ-ANNOTATION-REQUIRED
 *
 * Behavior:
 * - Accepts common AST node shapes (Identifier, Literal, Property, MemberExpression, TemplateLiteral, JSXIdentifier, etc.)
 * - Returns a string name when it can be reasonably determined, otherwise returns null.
 *
 * Notes:
 * - This helper is intentionally defensive and conservative: when the node is computed or contains expressions
 *   that cannot be resolved statically, it returns null.
 * - The function uses weak typing for the node parameter to maximize compatibility with different AST types
 *   (ESTree, TSESTree, JSX variations).
 */

/**
 * Check for identifier-like nodes and return their name when available.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - AST node to inspect
 * @returns the identifier name or null
 */
function isIdentifierLike(node: any): string | null {
  if (!node) return null;
  const type = node.type;
  if (type === "Identifier" || type === "JSXIdentifier") {
    return typeof node.name === "string" ? node.name : null;
  }
  return null;
}

/**
 * Convert a Literal node to a string when it represents a stable primitive (string/number/boolean).
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - AST node expected to be a Literal
 * @returns the literal as string or null if not stable/resolvable
 */
function literalToString(node: any): string | null {
  if (!node || node.type !== "Literal") return null;
  const val = node.value;
  if (val === null) return null;
  const t = typeof val;
  return t === "string" || t === "number" || t === "boolean"
    ? String(val)
    : null;
}

/**
 * Convert a TemplateLiteral node to a string if it contains no expressions.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - AST node expected to be a TemplateLiteral
 * @returns the cooked/raw concatenated template string or null if it contains expressions
 */
function templateLiteralToString(node: any): string | null {
  if (!node || node.type !== "TemplateLiteral") return null;
  const expressions = node.expressions || [];
  if (expressions.length !== 0) return null;
  const quasis = node.quasis || [];
  return quasis
    .map((q: any) => {
      if (!q || !q.value) return "";
      if (typeof q.value.cooked === "string") return q.value.cooked;
      if (typeof q.value.raw === "string") return q.value.raw;
      return "";
    })
    .join("");
}

/**
 * Resolve a MemberExpression / TSQualifiedName / JSXMemberExpression-like node to a name when non-computed.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - AST node to inspect
 * @returns resolved member/property name or null
 */
function memberExpressionName(node: any): string | null {
  if (!node) return null;
  const type = node.type;
  if (
    type !== "MemberExpression" &&
    type !== "TSQualifiedName" &&
    type !== "JSXMemberExpression"
  ) {
    return null;
  }
  // For TSQualifiedName and JSXMemberExpression, treat like non-computed access.
  if (
    type === "TSQualifiedName" ||
    type === "JSXMemberExpression" ||
    node.computed === false
  ) {
    return getNodeName(node.property || node.right);
  }
  return null;
}

/**
 * Extract the key name from Property/ObjectProperty nodes.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - AST node expected to be Property/ObjectProperty
 * @returns the resolved key name or null
 */
function propertyKeyName(node: any): string | null {
  if (!node) return null;
  if (node.type === "Property" || node.type === "ObjectProperty") {
    return getNodeName(node.key);
  }
  return null;
}

/**
 * Extract direct-level names from common container fields (.id / .key) to reduce branching in getNodeName.
 *
 * Branch-level traceability: prefer direct .id.name when available (common on function/class declarations)
 * Branch-level traceability: prefer direct .key.name early (common on variable declarators, properties)
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - AST node to inspect for direct .id/.key name
 * @returns the resolved direct name or null
 */
function directName(node: any): string | null {
  if (!node) return null;

  // Prefer direct .id.name when available
  if (node.id && typeof node.id.name === "string") {
    return node.id.name;
  }
  if (node.id) {
    const idName = getNodeName(node.id);
    if (idName !== null) return idName;
  }

  // Prefer direct .key.name early
  if (node.key && typeof node.key.name === "string") {
    return node.key.name;
  }
  if (node.key) {
    const keyName = getNodeName(node.key);
    if (keyName !== null) return keyName;
  }

  return null;
}

/**
 * Get a readable name for a given AST node.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 *
 * @param node - An AST node (ESTree/TSESTree/JSX-like). Can be null/undefined.
 * @returns The resolved name string, or null if a stable name cannot be determined.
 */
export function getNodeName(node: any): string | null {
  if (!node) return null;

  // Delegate direct-level id/key resolution to helper to reduce cyclomatic complexity
  const direct = directName(node);
  if (direct !== null) return direct;

  // Identifier-like nodes
  const idName = isIdentifierLike(node);
  if (idName !== null) return idName;

  // Literal nodes
  const lit = literalToString(node);
  if (lit !== null) return lit;

  // TemplateLiteral nodes
  const tpl = templateLiteralToString(node);
  if (tpl !== null) return tpl;

  // Property-like nodes
  const prop = propertyKeyName(node);
  if (prop !== null) return prop;

  // Member/qualified/member-expression-like nodes
  const member = memberExpressionName(node);
  if (member !== null) return member;

  // TypeScript literal wrapper
  if (node.type === "TSLiteralType" && node.literal) {
    return getNodeName(node.literal);
  }

  // JSX namespaced name
  if (node.type === "JSXNamespacedName") {
    return getNodeName(node.name);
  }

  // Generic fallback: try .key if present on other shapes
  if (node.key) {
    return getNodeName(node.key);
  }

  return null;
}
