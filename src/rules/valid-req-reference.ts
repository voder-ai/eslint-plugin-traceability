/**
 * Rule to validate `@req` annotation references refer to existing requirements in story files.
 * Uses shared helpers from the valid-req-reference-helpers module.
 */
import type { Rule } from "eslint";
import { createValidReqReferenceProgramVisitor } from "./helpers/valid-req-reference-helpers";

export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate that `@req` annotations reference existing requirements in referenced story files",
      recommended: "error",
    },
    messages: {
      /**
       * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-SPECIFIC - Provide specific diagnostics when a referenced requirement ID cannot be found in a story
       * @req REQ-ERROR-CONTEXT - Include both the missing requirement ID and the story path in the message
       * @req REQ-ERROR-CONSISTENCY - Use a consistent message template for requirement lookup failures
       */
      reqMissing: "Requirement '{{reqId}}' not found in '{{storyPath}}'",
      /**
       * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-SPECIFIC - Indicate that the story path associated with a `@req` annotation is invalid
       * @req REQ-ERROR-CONTEXT - Include the problematic storyPath value so the developer can correct it
       * @req REQ-ERROR-CONSISTENCY - Reuse the same storyPath placeholder convention used by other rules
       */
      invalidPath: "Invalid story path '{{storyPath}}'",
    },
    schema: [],
  },
  /**
   * Rule create entrypoint that returns the Program visitor.
   * Delegates to createValidReqReferenceProgramVisitor helper.
   *
   * @story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
   * @req REQ-REQ-VALIDATION - Validate that requirement references in annotations resolve to known requirements
   * @req REQ-REQ-FILE-EXISTS - Ensure that referenced story files exist before validating requirement references
   */
  create(context) {
    return {
      Program: createValidReqReferenceProgramVisitor(context),
    };
  },
} as Rule.RuleModule;
