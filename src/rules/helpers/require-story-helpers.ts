/**
 * Helpers for the "require-story" rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED - File-level header for rule helper utilities
 * @req REQ-AUTOFIX-MISSING
 * @req REQ-AUTOFIX-TEMPLATE
 * @req REQ-AUTOFIX-SELECTIVE
 */
import type { Rule } from "eslint";
import {
  linesBeforeHasStory,
  parentChainHasStory,
  fallbackTextBeforeHasStory,
} from "./require-story-io";

import {
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  STORY_PATH,
  createAddStoryFix,
  createMethodFix,
  coreReportMissing,
  coreReportMethod,
} from "./require-story-core";
import {
  isTestFrameworkCallback,
  type CallbackExclusionOptions,
} from "./test-callback-exclusion";
import {
  extractName,
  getReportedFunctionName,
  getNameNodeForReport,
} from "./require-story-name-extraction";
import {
  isAnonymousArrowFunction,
  isNestedFunction,
  isEffectivelyAnonymousFunction,
  isExportedNode,
  resolveTargetNode,
  resolveAnnotationTargetNode,
} from "./require-story-node-utils";
import {
  jsdocHasStory,
  commentsBeforeHasStory,
  leadingCommentsHasStory,
  hasStoryAnnotation,
  hasStoryAnnotationWithPlacement,
} from "./require-story-comment-detection";

/**
 * Shared configuration helpers
 */

interface ReportOptions extends CallbackExclusionOptions {
  annotationTemplateOverride?: string;
  autoFixToggle?: boolean;
  annotationPlacement?: "before" | "inside";
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function getAnnotationTemplate(
  override?: string,
  _options?: CallbackExclusionOptions,
): string {
  if (typeof override === "string" && override.trim().length > 0) {
    return override.trim();
  }
  return `/** @story ${STORY_PATH} */`;
}

function shouldApplyAutoFix(
  autoFix: boolean | undefined,
  _options?: CallbackExclusionOptions,
): boolean {
  if (autoFix === false) {
    return false;
  }
  return true;
}

/**
 * Build the effective annotation template and autofix toggle
 * from the provided report options.
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function buildTemplateConfig(options?: ReportOptions): {
  effectiveTemplate: string;
  allowFix: boolean;
} {
  const effectiveTemplate = getAnnotationTemplate(
    options?.annotationTemplateOverride,
    {
      excludeTestCallbacks: options?.excludeTestCallbacks,
      additionalTestHelperNames: options?.additionalTestHelperNames,
    },
  );
  const allowFix = shouldApplyAutoFix(options?.autoFixToggle, {
    excludeTestCallbacks: options?.excludeTestCallbacks,
    additionalTestHelperNames: options?.additionalTestHelperNames,
  });

  return { effectiveTemplate, allowFix };
}

/**
 * Determine whether a function node is required to carry its own annotation
 * according to Story 004.0-DEV-BRANCH-ANNOTATIONS rules.
 *
 * - Anonymous arrow functions used as callbacks are excluded from
 *   function-level annotation requirements.
 * - Named arrow functions must be annotated.
 * - Nested anonymous functions may inherit their parent function's
 *   annotation and therefore are not required to be annotated directly.
 * - Named nested functions must always carry their own explicit annotations.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ARROW-FUNCTION-EXCLUDED REQ-NESTED-FUNCTION-INHERITANCE
 */
function requiresOwnFunctionAnnotation(
  node: any,
  options?: CallbackExclusionOptions,
): boolean {
  if (isTestFrameworkCallback(node, options)) {
    return false;
  }

  // Anonymous arrow functions used as callbacks are excluded from function-level
  // requirements when they are nested inside another function or method.
  if (
    isAnonymousArrowFunction(node) &&
    isNestedFunction(node) &&
    isEffectivelyAnonymousFunction(node)
  ) {
    return false;
  }

  if (isNestedFunction(node) && isEffectivelyAnonymousFunction(node)) {
    return false;
  }

  return true;
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function shouldProcessNode(
  node: any,
  scope: string[],
  exportPriority: string = "all",
  options?: CallbackExclusionOptions,
): boolean {
  if (
    node &&
    (node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression") &&
    !requiresOwnFunctionAnnotation(node, options)
  ) {
    return false;
  }

  if (!scope.includes(node.type)) {
    return false;
  }
  const exported = isExportedNode(node);
  if (exportPriority === "exported" && !exported) {
    return false;
  }
  if (exportPriority === "non-exported" && exported) {
    return false;
  }
  return true;
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: ReportOptions },
): void {
  coreReportMissing(
    {
      hasStoryAnnotation,
      hasStoryAnnotationWithPlacement,
      getReportedFunctionName,
      resolveAnnotationTargetNode,
      getNameNodeForReport,
      buildTemplateConfig,
      extractName,
      getAnnotationTemplate,
      shouldApplyAutoFix,
      createAddStoryFix,
      createMethodFix,
    },
    context,
    sourceCode,
    config,
  );
}

/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function reportMethod(
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: ReportOptions },
): void {
  coreReportMethod(
    {
      hasStoryAnnotation,
      hasStoryAnnotationWithPlacement,
      getReportedFunctionName,
      resolveAnnotationTargetNode,
      getNameNodeForReport,
      buildTemplateConfig,
      extractName,
      getAnnotationTemplate,
      shouldApplyAutoFix,
      createAddStoryFix,
      createMethodFix,
    },
    context,
    sourceCode,
    config,
  );
}

/**
 * Explicit exports for require-story-annotation helpers.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
export {
  STORY_PATH,
  getAnnotationTemplate,
  shouldApplyAutoFix,
  isExportedNode,
  jsdocHasStory,
  commentsBeforeHasStory,
  leadingCommentsHasStory,
  hasStoryAnnotation,
  hasStoryAnnotationWithPlacement,
  extractName,
  resolveTargetNode,
  shouldProcessNode,
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  linesBeforeHasStory,
  parentChainHasStory,
  fallbackTextBeforeHasStory,
  reportMissing,
  reportMethod,
};
