/* eslint-disable traceability/require-branch-annotation */

/**
 * Name extraction utilities for require-story rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - File-level header for name extraction utilities
 */
import { getNodeName } from "./require-story-utils";

/**
 * Extract a direct Identifier name when available on the given node.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Extract direct Identifier-based names from nodes
 */
export function getDirectIdentifierName(node: any): string | null {
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
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize container id/key-based names into a single helper
 */
export function getContainerKeyOrIdName(node: any): string | null {
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
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Walk node and parents to find Identifier/Key name
 */
export function extractName(node: any): string {
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

/**
 * Resolve the effective function name to report for a node.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Centralize reported function name resolution
 */
export function getReportedFunctionName(node: any): string {
  const candidate = node && (node.id || node.key) ? node.id || node.key : node;
  return extractName(candidate);
}

/**
 * Determine the most appropriate AST node to anchor error location for a report.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Normalize name node selection for error reporting
 */
export function getNameNodeForReport(node: any): any {
  if (node?.id?.type === "Identifier") {
    return node.id;
  }

  if (node?.key?.type === "Identifier") {
    return node.key;
  }

  return node;
}
