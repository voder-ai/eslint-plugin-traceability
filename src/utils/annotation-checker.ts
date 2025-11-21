import { getNodeName } from "../rules/helpers/require-story-utils";
import {
  FALLBACK_WINDOW,
  LOOKBACK_LINES,
  fallbackTextBeforeHasStory,
  linesBeforeHasStory,
  parentChainHasStory,
} from "../rules/helpers/require-story-io";

/**
 * Helper to retrieve the JSDoc comment for a node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-GET-JSDOC - Retrieve JSDoc comment for a node
 */
function getJsdocComment(sourceCode: any, node: any) {
  return sourceCode.getJSDocComment(node);
}

/**
 * Helper to retrieve leading comments from a node (TypeScript declare style).
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-LEADING-COMMENTS - Collect leading comments from node
 */
function getLeadingComments(node: any) {
  return (node as any).leadingComments || [];
}

/**
 * Helper to retrieve comments before a node using the sourceCode API.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-COMMENTS-BEFORE - Collect comments before node via sourceCode
 */
function getCommentsBefore(sourceCode: any, node: any) {
  return sourceCode.getCommentsBefore(node) || [];
}

/**
 * Helper to combine leading and before comments into a single array.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-COMBINE-COMMENTS - Combine comment arrays for checking
 */
function combineComments(leading: any[], before: any[]) {
  return [...leading, ...before];
}

/**
 * Predicate helper to check whether a comment contains a @req annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-CHECK-COMMENT - Detect @req tag inside a comment
 */
function commentContainsReq(c: any) {
  return c && typeof c.value === "string" && c.value.includes("@req");
}

/**
 * Line-based helper adapted from linesBeforeHasStory to detect @req.
 */
function linesBeforeHasReq(sourceCode: any, node: any) {
  const res = linesBeforeHasStory(sourceCode, node, LOOKBACK_LINES);
  if (!res) return false;
  return typeof res.text === "string" && res.text.includes("@req");
}

/**
 * Parent-chain helper adapted from parentChainHasStory to detect @req.
 */
function parentChainHasReq(sourceCode: any, node: any) {
  const res = parentChainHasStory(sourceCode, node);
  if (!res) return false;
  return typeof res.text === "string" && res.text.includes("@req");
}

/**
 * Fallback text window helper adapted from fallbackTextBeforeHasStory to detect @req.
 */
function fallbackTextBeforeHasReq(sourceCode: any, node: any) {
  const res = fallbackTextBeforeHasStory(sourceCode, node, FALLBACK_WINDOW);
  if (!res) return false;
  return typeof res.text === "string" && res.text.includes("@req");
}

/**
 * Helper to determine whether a JSDoc or any nearby comments contain a @req annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation
 */
function hasReqAnnotation(
  jsdoc: any,
  comments: any[],
  context?: any,
  node?: any,
) {
  try {
    const sourceCode =
      context && typeof context.getSourceCode === "function"
        ? context.getSourceCode()
        : undefined;

    if (sourceCode && node) {
      if (
        linesBeforeHasReq(sourceCode, node) ||
        parentChainHasReq(sourceCode, node) ||
        fallbackTextBeforeHasReq(sourceCode, node)
      ) {
        return true;
      }
    }
  } catch {
    // Swallow detection errors and fall through to simple checks.
  }

  // BRANCH @req detection on JSDoc or comments
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  return (
    (jsdoc &&
      typeof jsdoc.value === "string" &&
      jsdoc.value.includes("@req")) ||
    comments.some(commentContainsReq)
  );
}

/**
 * Determine the most appropriate node to attach an inserted JSDoc to.
 * Prefers outer function-like constructs such as methods, variable declarators,
 * or wrapping expression statements for function expressions.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
 */
function getFixTargetNode(node: any) {
  const parent = node && (node as any).parent;

  if (!parent) {
    return node;
  }

  // If the node is part of a class/obj method definition, attach to the MethodDefinition
  if (parent.type === "MethodDefinition") {
    return parent;
  }

  // If the node is the init of a variable declarator, attach to the VariableDeclarator
  if (parent.type === "VariableDeclarator" && parent.init === node) {
    return parent;
  }

  // If the parent is an expression statement (e.g. IIFE or assigned via expression),
  // attach to the outer ExpressionStatement.
  if (parent.type === "ExpressionStatement") {
    return parent;
  }

  return node;
}

/**
 * Creates a fix function that inserts a missing @req JSDoc before the node.
 * Returned function is a proper named function so no inline arrow is used.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-AUTOFIX - Provide autofix for missing @req annotation
 */
function createMissingReqFix(node: any) {
  const target = getFixTargetNode(node);
  return function missingReqFix(fixer: any) {
    return fixer.insertTextBefore(target, "/** @req <REQ-ID> */\n");
  };
}

/**
 * Helper to report a missing @req annotation via the ESLint context API.
 * Uses getNodeName to provide a readable name for the node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context
 * @req REQ-ERROR-SPECIFIC - Provide specific error details including node name
 * @req REQ-ERROR-LOCATION - Include contextual location information in errors
 * @req REQ-ERROR-SUGGESTION - Provide actionable suggestions or fixes where possible
 * @req REQ-ERROR-CONTEXT - Include contextual hints to help understand the error
 */
function reportMissing(context: any, node: any, enableFix: boolean = true) {
  const rawName =
    getNodeName(node) ?? (node && getNodeName((node as any).parent));
  const name = rawName ?? "(anonymous)";
  const nameNode =
    (node && (node as any).id && (node as any).id.type === "Identifier"
      ? (node as any).id
      : node && (node as any).key && (node as any).key.type === "Identifier"
        ? (node as any).key
        : node) ?? node;
  const reportOptions: any = {
    node: nameNode,
    messageId: "missingReqAnnotation",
    data: { name, functionName: name },
  };

  if (enableFix) {
    reportOptions.fix = createMissingReqFix(node);
  }

  context.report(reportOptions);
}

/**
 * Helper to check @req annotation presence on TS declare functions and method signatures.
 * This helper is intentionally scope/exportPriority agnostic and focuses solely
 * on detection and reporting of @req annotations for the given node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 * @req REQ-ANNOTATION-REQ-DETECTION - Determine presence of @req annotation
 * @req REQ-ANNOTATION-REPORTING - Report missing @req annotation to context
 */
export function checkReqAnnotation(
  context: any,
  node: any,
  options?: { enableFix?: boolean },
) {
  const { enableFix = true } = options ?? {};
  const sourceCode = context.getSourceCode();
  const jsdoc = getJsdocComment(sourceCode, node);
  const leading = getLeadingComments(node);
  const comments = getCommentsBefore(sourceCode, node);
  const all = combineComments(leading, comments);
  const hasReq = hasReqAnnotation(jsdoc, all, context, node);
  // BRANCH when a @req annotation is missing and must be reported
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQ-DETECTION
  // @req REQ-ANNOTATION-REPORTING
  if (!hasReq) {
    reportMissing(context, node, enableFix);
  }
}
