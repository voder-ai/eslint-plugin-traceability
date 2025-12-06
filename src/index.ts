/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 * @req REQ-ERROR-HANDLING - Gracefully handles plugin loading errors and missing dependencies
 */
import type { Rule } from "eslint";

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINTENANCE-API-EXPORT - Expose maintenance utilities alongside core plugin exports
 */
import {
  detectStaleAnnotations,
  updateAnnotationReferences,
  batchUpdateAnnotations,
  verifyAnnotations,
  generateMaintenanceReport,
} from "./maintenance";

/**
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @req REQ-RULE-LIST - Enumerate supported rule file names for plugin discovery
 */
const RULE_NAMES = [
  "require-story-annotation",
  "require-req-annotation",
  "require-branch-annotation",
  "valid-annotation-format",
  "valid-story-reference",
  "valid-req-reference",
  "prefer-implements-annotation",
  "require-test-traceability",
] as const;

const rules: Record<string, Rule.RuleModule> = {} as any;

RULE_NAMES.forEach(
  /**
   * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
   * @req REQ-DYNAMIC-LOADING - Support dynamic rule loading by name at runtime
   * @param {RuleName} name - Rule file base name used to discover and load rule module
   */
  (name) => {
    /**
     * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
     * @req REQ-DYNAMIC-LOADING - Support dynamic rule loading by name at runtime
     */
    try {
      /**
       * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
       * @req REQ-DYNAMIC-LOADING - Support dynamic rule loading by name at runtime
       */
      // Dynamically require rule module
      const mod = require(`./rules/${name}`);
      // Support ESModule default export
      rules[name] = mod.default ?? mod;
    } catch (error: any) {
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-HANDLING - Provide fallback rule module and surface errors when rule loading fails
       */
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-HANDLING - Provide fallback rule module and surface errors when rule loading fails
       */
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
  },
);

/**
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-RULE-NAME
 * Wire up traceability/prefer-supports-annotation as the primary rule name and
 * traceability/prefer-implements-annotation as its deprecated alias.
 */
{
  const implementsRule = rules["prefer-implements-annotation"] as
    | Rule.RuleModule
    | undefined;

  if (implementsRule) {
    const originalMeta = (implementsRule as any).meta ?? {};
    const preferSupportsRule: Rule.RuleModule = {
      ...(implementsRule as any),
      meta: {
        ...originalMeta,
        deprecated: false,
      },
    };

    rules["prefer-supports-annotation"] = preferSupportsRule;

    const implementsMeta = ((implementsRule as any).meta =
      (implementsRule as any).meta ?? {});
    implementsMeta.deprecated = true;
    implementsMeta.replacedBy = ["prefer-supports-annotation"];

    if (
      implementsMeta.docs &&
      typeof implementsMeta.docs.description === "string"
    ) {
      implementsMeta.docs.description +=
        " (deprecated alias: use traceability/prefer-supports-annotation instead)";
    }
  }
}

/**
 * Plugin metadata used by ESLint for debugging and caching.
 *
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-NPM-PACKAGE
 */
const pluginMeta = (() => {
  type Pkg = { name?: string; version?: string };

  let pkg: Pkg = {};

  try {
    // When running from built output (lib/src/index.js)
    // this resolves to the package.json at the project root.
    // @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-NPM-PACKAGE
    pkg = require("../../package.json") as Pkg;
  } catch {
    try {
      // When running via the TypeScript sources (src/index.ts) in this repo,
      // fall back to resolving package.json one level up from src/.
      // @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-NPM-PACKAGE
      pkg = require("../package.json") as Pkg;
    } catch {
      // As a last resort (tests, unusual environments), provide sensible
      // defaults so that plugin loading never fails just for metadata.
      // @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
      pkg = {
        name: "eslint-plugin-traceability",
        version: "0.0.0-development",
      };
    }
  }

  return {
    name: pkg.name ?? "eslint-plugin-traceability",
    version: pkg.version ?? "0.0.0-development",
    namespace: "traceability",
  } as const;
})();

const plugin: {
  rules: typeof rules;
  configs?: unknown;
  maintenance?: unknown;
  meta?: typeof pluginMeta;
} = {
  rules,
  meta: pluginMeta,
};

/**
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ERROR-SEVERITY - Map rule types to appropriate ESLint severity levels (errors vs warnings)
 * The recommended and strict configs treat missing annotations and missing references as errors,
 * while formatting issues are reported as warnings, matching the story's severity conventions.
 */
const TRACEABILITY_RULE_SEVERITIES: Readonly<Record<string, "error" | "warn">> =
  {
    "traceability/require-story-annotation": "error",
    "traceability/require-req-annotation": "error",
    "traceability/require-branch-annotation": "error",
    "traceability/valid-annotation-format": "warn",
    "traceability/valid-story-reference": "error",
    "traceability/valid-req-reference": "error",
    "traceability/require-test-traceability": "error",
  } as const;

/**
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 * @req REQ-ERROR-SEVERITY - Map rule types to appropriate ESLint severity levels (errors vs warnings)
 * @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md
 * @req REQ-CONFIG-PRESETS - Provide flat-config presets that self-register the plugin and core rules
 */
function createTraceabilityFlatConfig() {
  return {
    rules: {
      ...TRACEABILITY_RULE_SEVERITIES,
    },
  };
}

/**
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ERROR-SEVERITY - Map rule types to appropriate ESLint severity levels (errors vs warnings)
 * The recommended and strict configs treat missing annotations and missing references as errors,
 * while formatting issues are reported as warnings, matching the story's severity conventions.
 */
const configs = {
  recommended: [createTraceabilityFlatConfig()],
  strict: [createTraceabilityFlatConfig()],
};

plugin.configs = configs;

/**
 * @story docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md
 * @req REQ-MAINTENANCE-API-EXPORT - Expose maintenance utilities alongside core plugin exports
 */
const maintenance = {
  detectStaleAnnotations,
  updateAnnotationReferences,
  batchUpdateAnnotations,
  verifyAnnotations,
  generateMaintenanceReport,
};

plugin.maintenance = maintenance;

export { rules, configs, maintenance };
export default plugin;
