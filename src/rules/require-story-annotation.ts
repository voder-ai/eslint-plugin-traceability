/* eslint-disable traceability/valid-annotation-format */
/**
 * ESLint rule module: require-story-annotation
 *
 * This file implements the ESLint rule that requires @story annotations
 * on functions and methods according to configured scope and export priority.
 * Example: see docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md for function annotations,
 * and docs/stories/008.0-DEV-AUTO-FIX.story.md for auto-fix behavior.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @req REQ-AUTOFIX-MISSING - This rule supports auto-fixing missing @story annotations per Story 008.0 auto-fix behavior.
 * @req REQ-AUTOFIX-SAFE - Auto-fix behavior only inserts @story annotation JSDoc comments and never changes executable or runtime code.
 * @req REQ-AUTOFIX-PRESERVE - Auto-fix inserts a minimal placeholder JSDoc in a way that preserves existing surrounding formatting and structure.
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
 * ESLint rule to require @story annotations on functions/methods.
 *
 * This rule participates in Story 028.0 placement standardization by supporting
 * configurable annotation placement, including inside-brace function annotations
 * when configured.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @req REQ-AUTOFIX-MISSING - This rule participates in auto-fix for missing @story annotations.
 * @req REQ-ERROR-MSG-CONTENT - Error message instructs adding an explicit @story annotation that points to the implementing story file.
 * @req REQ-ERROR-MSG-PLACEHOLDER - Error message retains the {{name}} placeholder while also providing functionName in the data payload for cross-rule consistency.
 * @req REQ-ERROR-MSG-ACTIONABLE - Error message text is concise, imperative, and describes the required remediation.
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
     * Auto-fix support for inserting @story annotations.
     *
     * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
     * @req REQ-ANNOTATION-REQUIRED
     * @req REQ-AUTOFIX-MISSING - `fixable: \"code\"` is used to implement REQ-AUTOFIX-MISSING for missing @story annotations.
     * @req REQ-AUTOFIX-SAFE - Auto-fix is conservative and only adds a single-line JSDoc @story annotation without modifying existing runtime expressions.
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
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
   * @req REQ-CREATE-HOOK
   * @req REQ-AUTOFIX-MISSING - The create hook wires in visitors that are capable of providing auto-fix suggestions for missing @story annotations.
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
     *
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-DEBUG-LOG
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
