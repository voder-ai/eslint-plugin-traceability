import type { Rule } from "eslint";
import * as helpers from "../helpers/require-story-helpers";

// Default node types to check for function annotations
export const DEFAULT_SCOPE = helpers.DEFAULT_SCOPE;
export const EXPORT_PRIORITY_VALUES = helpers.EXPORT_PRIORITY_VALUES;

/**
 * Determine if a node is in an export declaration
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @param {any} node - AST node to check for export ancestry
 * @returns {boolean} true if node is within an export declaration
 */
export function isExportedNode(node: any): boolean {
  return helpers.isExportedNode(node);
}

// Path to the story file for annotations
export const STORY_PATH = helpers.STORY_PATH;
export const ANNOTATION = helpers.ANNOTATION;

/**
 * Check if @story annotation already present in JSDoc or preceding comments
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - AST node to inspect for existing annotations
 * @returns {boolean} true if @story annotation already present
 */
export function hasStoryAnnotation(sourceCode: any, node: any): boolean {
  return helpers.hasStoryAnnotation(sourceCode, node);
}

/**
 * Get the name of the function-like node
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @param {any} node - AST node representing a function-like construct
 * @returns {string} the resolved name or "<unknown>"
 */
export function getNodeName(node: any): string {
  return helpers.getNodeName(node);
}

/**
 * Determine AST node where annotation should be inserted
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @param {any} sourceCode - ESLint sourceCode object (unused but kept for parity)
 * @param {any} node - function-like AST node to resolve target for
 * @returns {any} AST node that should receive the annotation
 */
export function resolveTargetNode(sourceCode: any, node: any): any {
  return helpers.resolveTargetNode(sourceCode, node);
}

/**
 * Report missing @story annotation on function or method
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @param {Rule.RuleContext} context - ESLint rule context
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - function AST node missing annotation
 * @param {any} target - AST node where annotation should be inserted
 */
export function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
  target: any,
) {
  return helpers.reportMissing(context, sourceCode, node, target);
}

/**
 * Report missing @story annotation on class methods
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @param {Rule.RuleContext} context - ESLint rule context
 * @param {any} sourceCode - ESLint sourceCode object
 * @param {any} node - MethodDefinition AST node
 */
export function reportMethod(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
) {
  return helpers.reportMethod(context, sourceCode, node);
}

/**
 * Check if this node is within scope and matches exportPriority
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
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
  return helpers.shouldProcessNode(node, scope, exportPriority);
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require @story annotations on functions",
      recommended: "error",
    },
    hasSuggestions: true,
    messages: {
      missingStory: "Missing @story annotation (REQ-ANNOTATION-REQUIRED)",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: {
            type: "array",
            items: { type: "string", enum: DEFAULT_SCOPE },
            uniqueItems: true,
          },
          exportPriority: { type: "string", enum: EXPORT_PRIORITY_VALUES },
        },
        additionalProperties: false,
      },
    ],
  },
  /**
   * Create the rule visitor functions for require-story-annotation.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-CREATE-HOOK - Provide create(context) hook for rule behavior
   */
  create(context) {
    const sourceCode = context.getSourceCode();
    const opts =
      context.options[0] ||
      ({} as { scope?: string[]; exportPriority?: string });
    const scope = opts.scope || DEFAULT_SCOPE;
    const exportPriority = opts.exportPriority || "all";

    return {
      FunctionDeclaration(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        let target = node;
        if (
          node.parent &&
          (node.parent.type === "ExportNamedDeclaration" ||
            node.parent.type === "ExportDefaultDeclaration")
        ) {
          target = node.parent;
        }
        reportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle FunctionExpression nodes
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       * @param {any} node - FunctionExpression AST node
       */
      FunctionExpression(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        if (node.parent && node.parent.type === "MethodDefinition") return;
        const target = resolveTargetNode(sourceCode, node);
        reportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle ArrowFunctionExpression nodes
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       * @param {any} node - ArrowFunctionExpression AST node
       */
      ArrowFunctionExpression(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        const target = resolveTargetNode(sourceCode, node);
        reportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle TSDeclareFunction nodes
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       * @param {any} node - TSDeclareFunction AST node
       */
      TSDeclareFunction(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        reportMissing(context, sourceCode, node, node);
      },

      /**
       * Handle TSMethodSignature nodes
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       * @param {any} node - TSMethodSignature AST node
       */
      TSMethodSignature(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        const target = resolveTargetNode(sourceCode, node);
        reportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle MethodDefinition nodes
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       * @param {any} node - MethodDefinition AST node
       */
      MethodDefinition(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        reportMethod(context, sourceCode, node);
      },
    };
  },
};

export default rule;
