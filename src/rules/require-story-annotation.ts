/* eslint-disable traceability/require-traceability */

/**
 * ESLint rule module: require-story-annotation
 *
 * This file implements the ESLint rule that requires `@story` annotations
 * on functions and methods according to configured scope and export priority.
 * Example: see docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md for function annotations,
 * and docs/stories/008.0-DEV-AUTO-FIX.story.md for auto-fix behavior.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-CONFIGURABLE-SCOPE REQ-EXPORT-PRIORITY REQ-TEST-CALLBACK-EXCLUSION
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-TEMPLATE REQ-AUTOFIX-SELECTIVE
 */
import type { Rule } from "eslint";
import { buildVisitors } from "./helpers/require-story-visitors";
import {
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  shouldProcessNode,
} from "./helpers/require-story-helpers";

function getNormalizedOptions(context: Rule.RuleContext) {
  const sourceCode = context.getSourceCode();
  const opts = (context.options && context.options[0]) || {};
  const scope = opts.scope || DEFAULT_SCOPE;
  const exportPriority = opts.exportPriority || "all";
  const annotationTemplate =
    typeof opts.annotationTemplate === "string" &&
    opts.annotationTemplate.trim().length > 0
      ? opts.annotationTemplate.trim()
      : undefined;
  const methodAnnotationTemplate =
    typeof opts.methodAnnotationTemplate === "string" &&
    opts.methodAnnotationTemplate.trim().length > 0
      ? opts.methodAnnotationTemplate.trim()
      : undefined;
  const autoFix = typeof opts.autoFix === "boolean" ? opts.autoFix : true;
  const excludeTestCallbacks =
    typeof opts.excludeTestCallbacks === "boolean"
      ? opts.excludeTestCallbacks
      : true;
  const additionalTestHelperNames =
    Array.isArray(opts.additionalTestHelperNames) &&
    opts.additionalTestHelperNames.every(
      (name: unknown) => typeof name === "string",
    )
      ? opts.additionalTestHelperNames
      : undefined;
  const rawAnnotationPlacement = (opts as any).annotationPlacement;
  const annotationPlacement: "before" | "inside" =
    rawAnnotationPlacement === "inside" || rawAnnotationPlacement === "before"
      ? rawAnnotationPlacement
      : "before";

  return {
    sourceCode,
    scope,
    exportPriority,
    annotationTemplate,
    methodAnnotationTemplate,
    autoFix,
    excludeTestCallbacks,
    additionalTestHelperNames,
    annotationPlacement,
  } as const;
}

/**
 * ESLint rule to require `@story` annotations on functions/methods.
 *
 * This rule participates in Story 028.0 placement standardization by supporting
 * configurable annotation placement, including inside-brace function annotations
 * when configured.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-CONFIGURABLE-SCOPE REQ-EXPORT-PRIORITY REQ-ERROR-LOCATION
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONSISTENCY
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-TEMPLATE REQ-AUTOFIX-SELECTIVE
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT REQ-ALL-BLOCK-TYPES
 */
const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require traceability annotations on functions and methods, preferring @supports for story coverage while still accepting legacy @story annotations, and provide optional auto-fix for missing annotations.",
      recommended: "error",
    },
    hasSuggestions: true,
    /**
     * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE
     * @req REQ-AUTOFIX-SAFE - Auto-fix is conservative and only adds a single-line JSDoc `@story` annotation without modifying existing runtime expressions.
     * @req REQ-AUTOFIX-PRESERVE - Auto-fix behavior preserves surrounding code formatting and indentation when inserting the placeholder JSDoc.
     */
    fixable: "code",
    messages: {
      missingStory:
        "Function '{{name}}' must declare a traceability annotation. Prefer adding an @supports line that links this function to at least one story (for example, '@supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED'), or, when you only need a single-story reference, add a legacy @story annotation that points to the implementing story file, such as docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md.",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: {
            type: "array",
            items: { type: "string", enum: DEFAULT_SCOPE },
            uniqueItems: true,
          },
          exportPriority: { type: "string", enum: EXPORT_PRIORITY_VALUES },
          annotationTemplate: { type: "string" },
          methodAnnotationTemplate: { type: "string" },
          autoFix: { type: "boolean" },
          excludeTestCallbacks: { type: "boolean" },
          additionalTestHelperNames: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
          /**
           * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT REQ-ALL-BLOCK-TYPES
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
   * Create the rule visitor functions.
   *
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-CONFIGURABLE-SCOPE REQ-EXPORT-PRIORITY
   * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING
   */
  create(context) {
    const {
      sourceCode,
      scope,
      exportPriority,
      annotationTemplate,
      methodAnnotationTemplate,
      autoFix,
      excludeTestCallbacks,
      additionalTestHelperNames,
      annotationPlacement,
    } = getNormalizedOptions(context);

    /**
     * Optional debug logging for troubleshooting this rule.
     * Developers can temporarily uncomment the block below to log when the rule
     * is activated for a given file during ESLint runs.
     */
    // console.debug(
    //   "require-story-annotation:create",
    //   typeof context.getFilename === "function"
    //     ? context.getFilename()
    //     : "<unknown>",
    // );

    // Local closure that binds configured scope and export priority to the helper.
    const should = (node: any) =>
      shouldProcessNode(node, scope, exportPriority, {
        excludeTestCallbacks,
        additionalTestHelperNames,
        annotationPlacement,
      });

    // Delegate visitor construction to helper to keep this file concise.
    return buildVisitors(context, sourceCode, {
      shouldProcessNode: should,
      scope,
      exportPriority,
      annotationTemplate,
      methodAnnotationTemplate,
      autoFix,
      excludeTestCallbacks,
      additionalTestHelperNames,
      annotationPlacement,
    });
  },
};

export default rule;
