/**
 * Rule to validate `@req` annotation references refer to existing requirements in story files.
 * Uses shared helpers from the valid-req-reference-helpers module.
 *
 * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-PARSE REQ-DEEP-MATCH REQ-DEEP-ERROR REQ-DEEP-CACHE
 * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-PATH-RESOLUTION REQ-SECURITY-VALIDATION REQ-ERROR-HANDLING
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
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
       * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-MATCH REQ-DEEP-ERROR
       * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
       */
      reqMissing: "Requirement '{{reqId}}' not found in '{{storyPath}}'",
      /**
       * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-PATH-RESOLUTION REQ-SECURITY-VALIDATION REQ-ERROR-HANDLING
       * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-CONSISTENCY
       */
      invalidPath: "Invalid story path '{{storyPath}}'",
    },
    schema: [],
  },
  /**
   * Rule create entrypoint that returns the Program visitor.
   * Delegates to createValidReqReferenceProgramVisitor helper.
   *
   * @supports docs/stories/010.0-DEV-DEEP-VALIDATION.story.md REQ-DEEP-PARSE REQ-DEEP-MATCH REQ-DEEP-ERROR REQ-DEEP-CACHE
   * @supports docs/stories/006.0-DEV-FILE-VALIDATION.story.md REQ-FILE-EXISTENCE REQ-PATH-RESOLUTION REQ-SECURITY-VALIDATION REQ-ERROR-HANDLING
   */
  create(context) {
    return {
      Program: createValidReqReferenceProgramVisitor(context),
    };
  },
} as Rule.RuleModule;
