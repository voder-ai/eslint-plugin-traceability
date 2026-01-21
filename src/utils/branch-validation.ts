import type { Rule } from "eslint";
import type { BranchType } from "./branch-annotation-helpers";

/**
 * Validate branchTypes configuration option and return branch types to enforce,
 * or return an ESLint listener if configuration is invalid.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement
 */
export function validateBranchTypes(
  context: Rule.RuleContext,
  DEFAULT_BRANCH_TYPES: readonly BranchType[],
): BranchType[] | Rule.RuleListener {
  const options: any = context.options[0] || {};

  /**
   * Conditional branch checking whether branchTypes option was provided.
   * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
   * @req REQ-CONFIGURABLE-SCOPE - Trace configuration branch existence check
   */
  if (Array.isArray(options.branchTypes)) {
    // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-CONFIGURABLE-SCOPE
    /**
     * Predicate to determine whether a provided branch type is invalid.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-CONFIGURABLE-SCOPE - Trace filter callback for invalid branch type detection
     */
    function isInvalidType(t: any): boolean {
      return !DEFAULT_BRANCH_TYPES.includes(t as BranchType);
    }

    const invalidTypes = options.branchTypes.filter(isInvalidType);
    /**
     * Conditional branch checking whether any invalid types were found.
     * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
     * @req REQ-CONFIGURABLE-SCOPE - Trace handling when invalid types are detected
     */
    if (invalidTypes.length > 0) {
      // @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-CONFIGURABLE-SCOPE
      /**
       * Program listener produced when configuration is invalid.
       * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
       * @req REQ-CONFIGURABLE-SCOPE - Trace Program listener reporting invalid config values
       */
      function ProgramHandler(node: any) {
        /**
         * Report a single invalid type for the given Program node.
         * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
         * @req REQ-CONFIGURABLE-SCOPE - Trace reporting for each invalid type
         */
        function reportInvalidType(t: any) {
          context.report({
            node,
            message: `Value "${t}" should be equal to one of the allowed values: ${DEFAULT_BRANCH_TYPES.join(
              ", ",
            )}`,
          });
        }
        invalidTypes.forEach(reportInvalidType);
      }
      return { Program: ProgramHandler };
    }
  }

  return Array.isArray(options.branchTypes)
    ? (options.branchTypes as BranchType[])
    : Array.from(DEFAULT_BRANCH_TYPES);
}
