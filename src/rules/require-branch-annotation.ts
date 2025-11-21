/**
 * Rule to enforce @story and @req annotations on significant code branches.
 *
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION
 * @req REQ-CONFIGURABLE-SCOPE
 */
import type { Rule } from "eslint";
import {
  validateBranchTypes,
  reportMissingAnnotations,
} from "../utils/branch-annotation-helpers";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require @story and @req annotations on code branches",
      recommended: "error",
    },
    fixable: "code",
    messages: {
      missingAnnotation: "Missing {{missing}} annotation on code branch",
    },
    schema: [
      {
        type: "object",
        properties: {
          branchTypes: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  /**
   * Create visitor for require-branch-annotation rule.
   *
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-BRANCH-DETECTION
   * @req REQ-CONFIGURABLE-SCOPE
   */
  create(context) {
    const branchTypesOrListener = validateBranchTypes(context);
    /**
     * Branch configuration guard: if validation returns a listener, use it directly
     * instead of branch-type iteration.
     *
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-CONFIGURABLE-SCOPE
     */
    if (!Array.isArray(branchTypesOrListener)) {
      return branchTypesOrListener;
    }
    const branchTypes = branchTypesOrListener;
    const storyFixCountRef = { count: 0 };
    const handlers: Rule.RuleListener = {};
    branchTypes.forEach((type) => {
      /**
       * Handler for a specific branch node type.
       * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
       * @req REQ-BRANCH-DETECTION
       * @req REQ-CONFIGURABLE-SCOPE
       */
      handlers[type] = function branchHandler(node) {
        if (type === "SwitchCase" && (node as any).test == null) {
          return;
        }
        reportMissingAnnotations(context, node, storyFixCountRef);
      };
    });
    return handlers;
  },
};

export default rule;
