/**
 * Rule to enforce `@story` and `@req` annotations on significant code branches.
 *
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION
 * @req REQ-CONFIGURABLE-SCOPE
 */
import type { Rule } from "eslint";
import {
  validateBranchTypes,
  reportMissingAnnotations,
  AnnotationPlacement,
} from "../utils/branch-annotation-helpers";

/**
 * Switch case node detection for fall-through handling
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-SWITCH-CASE-ANNOTATION
 * @req REQ-SWITCH-DEFAULT-REQUIRED
 * @req REQ-SWITCH-FALLTHROUGH
 */
function isSwitchCaseNode(node: unknown): node is any {
  return (
    !!node && typeof node === "object" && (node as any).type === "SwitchCase"
  );
}

/**
 * Sentinel index value used when a SwitchCase is not found in its parent's cases array.
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-SWITCH-FALLTHROUGH
 */
const INVALID_INDEX = -1;

/**
 * Determine whether a SwitchCase is an intermediate fall-through label
 * that should not require its own annotation.
 *
 * An intermediate fall-through case:
 * - Has an empty consequent array
 * - Has a following SwitchCase sibling in the same SwitchStatement
 * - That following sibling has a non-empty consequent array
 *
 * Switch fall-through behavior for branch annotations
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-SWITCH-CASE-ANNOTATION
 * @req REQ-SWITCH-DEFAULT-REQUIRED
 * @req REQ-SWITCH-FALLTHROUGH
 */
function isFallthroughIntermediateCase(node: any): boolean {
  if (!isSwitchCaseNode(node)) return false;
  // Default cases must always be annotated when they represent a branch.
  if ((node as any).test == null) {
    return false;
  }

  if (!Array.isArray(node.consequent) || node.consequent.length > 0) {
    return false;
  }

  const parent = (node as any).parent;
  if (
    !parent ||
    parent.type !== "SwitchStatement" ||
    !Array.isArray(parent.cases)
  ) {
    return false;
  }

  const cases = parent.cases as any[];
  const index = cases.indexOf(node);
  if (index === INVALID_INDEX) {
    return false;
  }

  // Walk forward from this case until we either find a case with a non-empty
  // consequent (shared body) or run out of cases. All empty cases in this
  // prefix are treated as intermediate labels that participate in fall-through
  // but do not themselves require annotations. The last case with the shared
  // body remains subject to annotation requirements.
  let j = index;
  while (
    j < cases.length &&
    (!Array.isArray(cases[j].consequent) || cases[j].consequent.length === 0)
  ) {
    j++;
  }

  if (j >= cases.length) {
    // No later case with a body; treat this as an independent branch that
    // should be annotated when appropriate.
    return false;
  }

  return true;
}

/**
 * ESLint rule definition for require-branch-annotation.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Enforce `@story`/`@req` presence on configured branch types
 * @req REQ-CONFIGURABLE-SCOPE - Respect configurable branchTypes option
 */
const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require traceability annotations on significant code branches, preferring @supports for combined story and requirement coverage while still accepting legacy @story and @req comments.",
      recommended: "error",
    },
    fixable: "code",
    messages: {
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-CONSISTENCY - Use shared branch error message convention with {{missing}} placeholder
       */
      missingAnnotation:
        "Branch is missing required traceability annotation: {{missing}}. Prefer using a single @supports line that links this branch to its story and requirements (for example, '@supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-BRANCH-DETECTION'), or add the missing legacy tag if you are not yet using @supports.",
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
          /**
           * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT
           */
          annotationPlacement: {
            enum: ["before", "inside"],
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

    /**
     * Resolve annotation placement configuration with backward-compatible default.
     *
     * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT
     */
    const rawOptions: any = context.options[0] || {};
    const _annotationPlacement: AnnotationPlacement =
      rawOptions.annotationPlacement === "inside" ||
      rawOptions.annotationPlacement === "before"
        ? rawOptions.annotationPlacement
        : "before";

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
        if (
          type === "SwitchCase" &&
          isSwitchCaseNode(node) &&
          isFallthroughIntermediateCase(node)
        ) {
          // Skip intermediate fall-through labels; only the last case before a shared code block
          // requires its own annotation per REQ-SWITCH-FALLTHROUGH.
          return;
        }
        reportMissingAnnotations(context, node, storyFixCountRef);
      };
    });
    return handlers;
  },
};

export default rule;
