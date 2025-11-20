/**
 * ESLint rule module: require-story-annotation
 *
 * This file implements the ESLint rule that requires @story annotations
 * on functions and methods according to configured scope and export priority.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
import type { Rule } from "eslint";
import {
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  shouldProcessNode,
  resolveTargetNode,
  reportMissing as helperReportMissing,
  reportMethod as helperReportMethod,
} from "./helpers/require-story-helpers";

/**
 * ESLint rule to require @story annotations on functions/methods.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
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
   * Create the rule visitor functions.
   *
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-CREATE-HOOK
   */
  create(context) {
    const sourceCode = context.getSourceCode();
    const opts = (context.options && context.options[0]) || {};
    const scope = opts.scope || DEFAULT_SCOPE;
    const exportPriority = opts.exportPriority || "all";

    /**
     * Predicate to determine whether a given node should be processed by this rule.
     *
     * Uses configured scope and exportPriority to decide if the node is eligible.
     *
     * @param node - AST node to evaluate
     * @returns boolean indicating whether the node should be processed
     *
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-CREATE-HOOK
     */
    const should = (node: any) =>
      shouldProcessNode(node, scope, exportPriority);

    return {
      /**
       * Handle FunctionDeclaration nodes.
       *
       * Reports missing @story annotations for function declarations. If the
       * declaration is exported, the export node is used as the reporting target.
       *
       * @param node - FunctionDeclaration AST node
       *
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       */
      FunctionDeclaration(node: any) {
        if (!should(node)) return;
        let target = node;
        if (
          node.parent &&
          (node.parent.type === "ExportNamedDeclaration" ||
            node.parent.type === "ExportDefaultDeclaration")
        ) {
          target = node.parent;
        }
        helperReportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle FunctionExpression nodes.
       *
       * Reports missing @story annotations for function expressions unless they
       * are part of a MethodDefinition (handled elsewhere). The appropriate
       * target node is resolved for reporting.
       *
       * @param node - FunctionExpression AST node
       *
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       */
      FunctionExpression(node: any) {
        if (!should(node)) return;
        if (node.parent && node.parent.type === "MethodDefinition") return;
        const target = resolveTargetNode(sourceCode, node);
        helperReportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle ArrowFunctionExpression nodes.
       *
       * Reports missing @story annotations for arrow functions. The reporting
       * target is resolved based on surrounding syntax (e.g., variable declarator).
       *
       * @param node - ArrowFunctionExpression AST node
       *
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       */
      ArrowFunctionExpression(node: any) {
        if (!should(node)) return;
        const target = resolveTargetNode(sourceCode, node);
        helperReportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle TSDeclareFunction nodes.
       *
       * Reports missing @story annotations for TypeScript declare function
       * declarations. The node itself is used as the reporting target.
       *
       * @param node - TSDeclareFunction AST node
       *
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       */
      TSDeclareFunction(node: any) {
        if (!should(node)) return;
        helperReportMissing(context, sourceCode, node, node);
      },

      /**
       * Handle TSMethodSignature nodes.
       *
       * Reports missing @story annotations for TypeScript interface/class
       * method signatures. The reporting target is resolved to the appropriate
       * parent or identifier.
       *
       * @param node - TSMethodSignature AST node
       *
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       */
      TSMethodSignature(node: any) {
        if (!should(node)) return;
        const target = resolveTargetNode(sourceCode, node);
        helperReportMissing(context, sourceCode, node, target);
      },

      /**
       * Handle MethodDefinition nodes.
       *
       * Reports missing @story annotations specifically for class/ object
       * method definitions using helperReportMethod which handles method specifics.
       *
       * @param node - MethodDefinition AST node
       *
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-ANNOTATION-REQUIRED
       */
      MethodDefinition(node: any) {
        if (!should(node)) return;
        helperReportMethod(context, sourceCode, node);
      },
    };
  },
};

export default rule;
