/**
 * ESLint Traceability Plugin
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-PLUGIN-STRUCTURE - Provide foundational plugin export and registration
 * @req REQ-ERROR-HANDLING - Gracefully handles plugin loading errors and missing dependencies
 */
import type { Rule } from "eslint";

import {
  detectStaleAnnotations,
  updateAnnotationReferences,
  batchUpdateAnnotations,
  verifyAnnotations,
  generateMaintenanceReport,
} from "./maintenance";

const RULE_NAMES = [
  "require-traceability",
  "require-story-annotation",
  "require-req-annotation",
  "require-branch-annotation",
  "valid-annotation-format",
  "valid-story-reference",
  "valid-req-reference",
  "prefer-implements-annotation",
  "require-test-traceability",
  "no-redundant-annotation",
] as const;

const rules: Record<string, Rule.RuleModule> = {} as any;

RULE_NAMES.forEach((name) => {
  try {
    // Dynamically require rule module
    const mod = require(`./rules/${name}`);
    // Support ESModule default export
    rules[name] = mod.default ?? mod;
  } catch (error: any) {
    /**
     * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
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
});

/**
 * Wire up the unified function-annotation rule and its backward-compatible
 * aliases so that:
 * - traceability/require-traceability is the canonical rule implementation
 * - traceability/require-story-annotation and
 *   traceability/require-req-annotation act as aliases that share the same
 *   underlying logic while preserving their legacy metadata (docs, schema,
 *   and diagnostics).
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-CONFIGURABLE-SCOPE REQ-EXPORT-PRIORITY
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-UNIFIED-ALIAS-ENGINE
 */
function createAliasRuleMeta(
  unifiedRule: Rule.RuleModule,
  legacyRule: Rule.RuleModule | undefined,
): Rule.RuleMetaData | null {
  if (!legacyRule) {
    return null;
  }

  const baseMeta = ((unifiedRule as any).meta ?? {}) as Record<string, any>;
  const legacyMeta = ((legacyRule as any).meta ?? {}) as Record<string, any>;

  return {
    ...baseMeta,
    ...legacyMeta,
    docs: {
      ...(baseMeta.docs ?? {}),
      ...(legacyMeta.docs ?? {}),
    },
    messages: {
      ...(baseMeta.messages ?? {}),
      ...(legacyMeta.messages ?? {}),
    },
    schema:
      (legacyMeta.schema as Rule.RuleMetaData["schema"]) ??
      (baseMeta.schema as Rule.RuleMetaData["schema"]) ??
      [],
    hasSuggestions:
      (legacyMeta.hasSuggestions as boolean | undefined) ??
      (baseMeta.hasSuggestions as boolean | undefined),
    fixable:
      (legacyMeta.fixable as Rule.RuleMetaData["fixable"]) ??
      (baseMeta.fixable as Rule.RuleMetaData["fixable"]),
    deprecated:
      (legacyMeta.deprecated as boolean | undefined) ??
      (baseMeta.deprecated as boolean | undefined),
    replacedBy:
      (legacyMeta.replacedBy as string[] | undefined) ??
      (baseMeta.replacedBy as string[] | undefined),
    type:
      (legacyMeta.type as Rule.RuleMetaData["type"]) ??
      (baseMeta.type as Rule.RuleMetaData["type"]) ??
      "problem",
  };
}

/**
 * Wire up the unified `require-traceability` rule and its legacy alias rules
 * so that they share the same implementation while preserving legacy metadata.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-EXPORT-PRIORITY
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-UNIFIED-ALIAS-ENGINE
 */
function wireUnifiedFunctionAnnotationAliases(): void {
  const unifiedRule = rules["require-traceability"] as
    | Rule.RuleModule
    | undefined;
  const legacyStoryRule = rules["require-story-annotation"] as
    | Rule.RuleModule
    | undefined;
  const legacyReqRule = rules["require-req-annotation"] as
    | Rule.RuleModule
    | undefined;

  if (unifiedRule) {
    const createAliasRule = (
      legacyRule: Rule.RuleModule | undefined,
    ): Rule.RuleModule => {
      const mergedMeta = createAliasRuleMeta(unifiedRule, legacyRule);
      if (!mergedMeta) {
        return unifiedRule;
      }

      return {
        ...(unifiedRule as any),
        meta: mergedMeta,
        create: unifiedRule.create,
      };
    };

    rules["require-story-annotation"] = createAliasRule(legacyStoryRule);
    rules["require-req-annotation"] = createAliasRule(legacyReqRule);
  }
}

wireUnifiedFunctionAnnotationAliases();

/**
 * @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-RULE-NAME
 * Wire up traceability/prefer-supports-annotation as the primary rule name and
 * traceability/prefer-implements-annotation as its deprecated alias.
 *
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-MIGRATION-RULE-NAMING
 */
function wirePreferSupportsAlias(): void {
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

wirePreferSupportsAlias();

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
    "traceability/require-traceability": "error",
    "traceability/require-story-annotation": "error",
    "traceability/require-req-annotation": "error",
    "traceability/require-branch-annotation": "error",
    "traceability/valid-annotation-format": "warn",
    "traceability/valid-story-reference": "error",
    "traceability/valid-req-reference": "error",
    "traceability/require-test-traceability": "error",
    "traceability/no-redundant-annotation": "warn",
  } as const;

/**
 * Create flat config preset for ESLint v9.
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SEVERITY
 * @supports docs/stories/002.0-DEV-ESLINT-CONFIG.story.md REQ-CONFIG-PRESETS
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
