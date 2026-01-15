/* eslint-disable traceability/require-traceability */

/**
 * Composite ESLint rule that enforces both story and requirement traceability
 * annotations on functions and methods.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require both @story and @req annotations via composition
 * @req REQ-FUNCTION-DETECTION - Detect functions via composed rules
 * @req REQ-CONFIGURABLE-SCOPE - Support scope configuration through underlying rules
 * @req REQ-EXPORT-PRIORITY - Support export priority through underlying rules
 * @req REQ-ERROR-LOCATION - Report errors at function locations via composed rules
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript syntax via composed rules
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
        "Require both story and requirement traceability annotations on functions and methods via the unified alias rule",
      recommended: "error",
    },
    hasSuggestions: true,
    fixable: "code",
    messages: {
      // Unified messageId for potential future direct use by this rule.
      missingTraceability:
        "Function '{{name}}' must declare both story and requirement traceability annotations.",
      // Preserve underlying rule messageIds so that composed listeners can
      // continue to report using their original IDs.
      ...(storyRule.meta?.messages ?? {}),
      ...(reqRule.meta?.messages ?? {}),
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: {
            type: "array",
            items: {
              type: "string",
            },
          },
          exportPriority: {
            type: "string",
            enum: ["all", "exported", "non-exported"],
          },
          annotationTemplate: {
            type: "string",
          },
          methodAnnotationTemplate: {
            type: "string",
          },
          autoFix: {
            type: "boolean",
            description:
              "When false, disables automatic fix behavior while retaining diagnostics. When true (default), the rule inserts placeholder annotations in --fix mode.",
          },
          excludeTestCallbacks: {
            type: "boolean",
          },
          annotationPlacement: {
            type: "string",
            enum: ["before", "inside"],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    // Create a modified context that passes through options to composed rules
    // We need to preserve all context methods while modifying the options array
    const options = context.options[0] || {};
    const modifiedContext = Object.create(context, {
      options: {
        value: [options],
        writable: false,
        enumerable: true,
        configurable: false,
      },
    });

    const storyListeners = storyRule.create(modifiedContext as any) || {};
    const reqListeners = reqRule.create(modifiedContext as any) || {};

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
