/**
 * Composite ESLint rule that enforces both story and requirement traceability
 * annotations on functions and methods.
 *
 * Implements Story 003.0-DEV-FUNCTION-ANNOTATIONS with:
 * - REQ-ANNOTATION-REQUIRED
 * - REQ-FUNCTION-DETECTION
 * - REQ-CONFIGURABLE-SCOPE
 * - REQ-EXPORT-PRIORITY
 * - REQ-ERROR-LOCATION
 * - REQ-TYPESCRIPT-SUPPORT
 *
 * via composition of:
 * - ./require-story-annotation
 * - ./require-req-annotation
 */

import type { Rule } from "eslint";
import storyRuleDefault from "./require-story-annotation";
import reqRuleDefault from "./require-req-annotation";

const storyRule = storyRuleDefault as Rule.RuleModule;
const reqRule = reqRuleDefault as Rule.RuleModule;

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require @story and @req (or @supports) annotations on functions and methods",
      recommended: "error",
    },
    hasSuggestions:
      Boolean(storyRule.meta?.hasSuggestions) ||
      Boolean(reqRule.meta?.hasSuggestions),
    fixable:
      (storyRule.meta && storyRule.meta.fixable) ||
      (reqRule.meta && reqRule.meta.fixable) ||
      undefined,
    messages: {
      ...(storyRule.meta?.messages ?? {}),
      ...(reqRule.meta?.messages ?? {}),
    },
    schema:
      (storyRule.meta && storyRule.meta.schema) ??
      (reqRule.meta && reqRule.meta.schema) ??
      [],
  },

  create(context) {
    const storyListeners = storyRule.create(context) || {};
    const reqListeners = reqRule.create(context) || {};

    const mergedListener: Rule.RuleListener = {};

    const allEventNames = new Set<string>([
      ...Object.keys(storyListeners),
      ...Object.keys(reqListeners),
    ]);

    for (const eventName of allEventNames) {
      const storyHandler = storyListeners[eventName];
      const reqHandler = reqListeners[eventName];

      if (storyHandler && reqHandler) {
        mergedListener[eventName] = function mergedHandler(
          this: unknown,
          ...args: any[]
        ) {
          (storyHandler as any).apply(this, args);
          (reqHandler as any).apply(this, args);
        };
      } else if (storyHandler) {
        mergedListener[eventName] = storyHandler;
      } else if (reqHandler) {
        mergedListener[eventName] = reqHandler;
      }
    }

    return mergedListener;
  },
};

export default rule;
