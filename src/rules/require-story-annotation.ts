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
import { buildVisitors } from "./helpers/require-story-visitors";
import {
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  shouldProcessNode,
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
      missingStory:
        "Missing @story annotation for function '{{name}}' (REQ-ANNOTATION-REQUIRED)",
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
     * Debug log at the start of create to help diagnose rule activation in tests.
     *
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-DEBUG-LOG
     */
    console.debug(
      "require-story-annotation:create",
      typeof context.getFilename === "function"
        ? context.getFilename()
        : "<unknown>",
    );

    // Local closure that binds configured scope and export priority to the helper.
    const should = (node: any) =>
      shouldProcessNode(node, scope, exportPriority);

    // Delegate visitor construction to helper to keep this file concise.
    return buildVisitors(context, sourceCode, {
      shouldProcessNode: should,
      scope,
      exportPriority,
    });
  },
};

export default rule;
