/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
import {
  createAddStoryFix,
  coreReportMissing,
} from "../../src/rules/helpers/require-story-core";
import {
  getAnnotationTemplate,
  reportMissing,
} from "../../src/rules/helpers/require-story-helpers";
import { exerciseCreateAddStoryFixBranches } from "../utils/require-story-core-test-helpers";

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE
 */
function createAddStoryFixCoversPrimaryBranchCombinationsViaSharedHelper() {
  const defaultTemplate = getAnnotationTemplate();
  exerciseCreateAddStoryFixBranches(createAddStoryFix, {
    annotationText: defaultTemplate,
  });
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function getEmptyText() {
  return "";
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function reportMissingUsesContextGetSourceCodeFallbackWhenSourceCodeNotProvidedAndStillReports() {
  const node: any = {
    type: "FunctionDeclaration",
    id: { name: "fnX" },
    range: [0, 10],
  };
  const fakeSource: any = {
    /* intentionally missing getJSDocComment to exercise branch */ getText:
      getEmptyText,
  };
  const context: any = {
    getSourceCode: jest.fn(() => fakeSource),
    report: jest.fn(),
  };

  reportMissing(context, undefined as any, {
    node,
    target: node,
    options: { autoFixToggle: true },
  });
  expect(context.report).toHaveBeenCalledTimes(1);
  const call = (context.report as jest.Mock).mock.calls[0][0];
  expect(call.node).toBe(node);
  expect(call.messageId).toBe("missingStory");
}

/**
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function throwBoom() {
  throw new Error("boom");
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function hasStoryAnnotationThrows() {
  return throwBoom();
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function getReportedFunctionNameFnX() {
  return "fnX";
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function resolveAnnotationTargetNodeFunctionDeclaration() {
  return { type: "FunctionDeclaration" };
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function getNameNodeForReportIdentity(node: unknown) {
  return node;
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function buildTemplateConfigAllowFix() {
  return {
    effectiveTemplate:
      "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
    allowFix: true,
  };
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function extractNameFnX() {
  return "fnX";
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function getAnnotationTemplateFnStory() {
  return "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */";
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function shouldApplyAutoFixTrue() {
  return true;
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 */
function createNoopFixer() {
  return () => ({});
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function coreReportMissingSwallowsDependencyErrorsAndDoesNotBreakLintRun() {
  const deps: any = {
    hasStoryAnnotation: hasStoryAnnotationThrows,
    getReportedFunctionName: getReportedFunctionNameFnX,
    resolveAnnotationTargetNode: resolveAnnotationTargetNodeFunctionDeclaration,
    getNameNodeForReport: getNameNodeForReportIdentity,
    buildTemplateConfig: buildTemplateConfigAllowFix,
    extractName: extractNameFnX,
    getAnnotationTemplate: getAnnotationTemplateFnStory,
    shouldApplyAutoFix: shouldApplyAutoFixTrue,
    createAddStoryFix: createNoopFixer,
    createMethodFix: createNoopFixer,
  };

  const context: any = {
    report: jest.fn(),
  };

  const node: any = { type: "FunctionDeclaration" };

  expect(() =>
    coreReportMissing(deps, context as any, {} as any, { node }),
  ).not.toThrow();

  expect(context.report).not.toHaveBeenCalled();
}

/**
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-MISSING REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function requireStoryCoreAutofixSuite() {
  test(
    "createAddStoryFix covers primary branch combinations via shared helper",
    createAddStoryFixCoversPrimaryBranchCombinationsViaSharedHelper,
  );

  test(
    "reportMissing uses context.getSourceCode fallback when sourceCode not provided and still reports",
    reportMissingUsesContextGetSourceCodeFallbackWhenSourceCodeNotProvidedAndStillReports,
  );

  test(
    "coreReportMissing swallows dependency errors and does not break lint run",
    coreReportMissingSwallowsDependencyErrorsAndDoesNotBreakLintRun,
  );
}

describe("Require Story Core (Story 003.0)", requireStoryCoreAutofixSuite);
