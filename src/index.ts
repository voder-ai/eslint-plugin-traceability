/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 * @req REQ-ERROR-HANDLING - Gracefully handles plugin loading errors and missing dependencies
 */
import type { Rule } from "eslint";

const RULE_NAMES = [
  "require-story-annotation",
  "require-req-annotation",
  "require-branch-annotation",
  "valid-annotation-format",
  "valid-story-reference",
  "valid-req-reference",
] as const;

type RuleName = (typeof RULE_NAMES)[number];

const rules: Record<RuleName, Rule.RuleModule> = {} as any;

RULE_NAMES.forEach((name) => {
  try {
    // Dynamically require rule module
    const mod = require(`./rules/${name}`);
    // Support ESModule default export
    rules[name] = mod.default ?? mod;
  } catch (error: any) {
    console.error(
      `[eslint-plugin-traceability] Failed to load rule "${name}": ${error.message}`,
    );
    rules[name] = {
      meta: {
        type: "problem",
        docs: {
          description: `Failed to load rule '${name}'`,
        },
        schema: [],
      },
      create(context: Rule.RuleContext) {
        return {
          Program(node: any) {
            context.report({
              node,
              message: `eslint-plugin-traceability: Error loading rule "${name}": ${error.message}`,
            });
          },
        };
      },
    } as Rule.RuleModule;
  }
});

const configs = {
  recommended: [
    {
      plugins: {
        traceability: {},
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/require-branch-annotation": "error",
        "traceability/valid-annotation-format": "error",
        "traceability/valid-story-reference": "error",
        "traceability/valid-req-reference": "error",
      },
    },
  ],
  strict: [
    {
      plugins: {
        traceability: {},
      },
      rules: {
        "traceability/require-story-annotation": "error",
        "traceability/require-req-annotation": "error",
        "traceability/require-branch-annotation": "error",
        "traceability/valid-annotation-format": "error",
        "traceability/valid-story-reference": "error",
        "traceability/valid-req-reference": "error",
      },
    },
  ],
};

export { rules, configs };
export default { rules, configs };