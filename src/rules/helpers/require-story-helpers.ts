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
/** Common array and Promise methods that don't require callback annotations. */
const COMMON_ARRAY_AND_PROMISE_METHODS = [
  "map",
  "filter",
  "forEach",
  "reduce",
  "reduceRight",
  "some",
  "every",
  "find",
  "findIndex",
  "findLast",
  "findLastIndex",
  "flatMap",
  "sort",
  "then",
  "catch",
  "finally",
];

/** Timing functions that don't require callback annotations. */
const TIMING_FUNCTIONS = [
  "setTimeout",
  "setInterval",
  "setImmediate",
  "requestAnimationFrame",
  "requestIdleCallback",
  "queueMicrotask",
];

/**
 * Check if callee is a common array or Promise method.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ARROW-FUNCTION-EXCLUDED
 */
function isCommonMethodCallback(callee: any): boolean {
  if (
    callee.type === "MemberExpression" &&
    callee.property?.type === "Identifier"
  ) {
    return COMMON_ARRAY_AND_PROMISE_METHODS.includes(callee.property.name);
  }
  return false;
}

/**
 * Check if callee is a timing function.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ARROW-FUNCTION-EXCLUDED
 */
function isTimingFunctionCallback(callee: any): boolean {
  if (callee.type === "Identifier") {
    return TIMING_FUNCTIONS.includes(callee.name);
  }
  return false;
}

/**
 * Check if an anonymous arrow is a common utility callback that should be excluded.
 *
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-ARROW-FUNCTION-EXCLUDED
 */
function isCommonUtilityCallback(node: any): boolean {
  if (!node || node.type !== "ArrowFunctionExpression") {
    return false;
  }

  const parent = node.parent;
  if (!parent || parent.type !== "CallExpression" || !parent.callee) {
    return false;
  }

  return (
    isCommonMethodCallback(parent.callee) ||
    isTimingFunctionCallback(parent.callee)
  );
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
  // Test framework callbacks respect the excludeTestCallbacks option.
  // When excludeTestCallbacks is false, test callbacks ARE checked.
  if (isTestFrameworkCallback(node, options)) {
    return false;
  }

  // Named nested functions must carry their own annotations.
  // Anonymous nested functions may inherit from parent.
  if (isNestedFunction(node) && isEffectivelyAnonymousFunction(node)) {
    return false;
  }

  // Anonymous arrow functions used as common utility callbacks (map, filter, setTimeout, etc.)
  // are excluded by default, UNLESS excludeTestCallbacks is explicitly false.
  // Named arrow functions require annotations like other function declarations.
  if (isAnonymousArrowFunction(node)) {
    // When excludeTestCallbacks is false, check ALL functions
    if (options?.excludeTestCallbacks === false) {
      return true;
    }

    // Special case: Vitest's bench callbacks should always be checked
    if (
      node.parent?.type === "CallExpression" &&
      node.parent.callee?.type === "Identifier" &&
      node.parent.callee.name === "bench"
    ) {
      return true; // bench callbacks are always checked
    }

    // Check if it's a common utility callback (map, filter, setTimeout, then, etc.)
    if (isCommonUtilityCallback(node)) {
      return false; // Exclude common utility callbacks
    }

    // Other anonymous arrows (like callbacks to user functions) should be checked
    return true;
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
