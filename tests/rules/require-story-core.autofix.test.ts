/* eslint-disable traceability/valid-req-reference */
/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-AUTOFIX
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
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

describe("Require Story Core (Story 003.0)", () => {
  test("createAddStoryFix covers primary branch combinations via shared helper", () => {
    const defaultTemplate = getAnnotationTemplate();
    const factory = (target: any, _annotationTemplate: string) =>
      createAddStoryFix(target, defaultTemplate);
    exerciseCreateAddStoryFixBranches(factory, {
      annotationText: defaultTemplate,
    });
  });

  test("reportMissing uses context.getSourceCode fallback when sourceCode not provided and still reports", () => {
    const node: any = {
      type: "FunctionDeclaration",
      id: { name: "fnX" },
      range: [0, 10],
    };
    const fakeSource: any = {
      /* intentionally missing getJSDocComment to exercise branch */ getText:
        () => "",
    };
    const context: any = { getSourceCode: () => fakeSource, report: jest.fn() };

    reportMissing(context, undefined as any, {
      node,
      target: node,
      options: { autoFixToggle: true },
    });
    expect(context.report).toHaveBeenCalledTimes(1);
    const call = (context.report as jest.Mock).mock.calls[0][0];
    expect(call.node).toBe(node);
    expect(call.messageId).toBe("missingStory");
  });

  test("coreReportMissing swallows dependency errors and does not break lint run", () => {
    const deps: any = {
      hasStoryAnnotation: () => {
        throw new Error("boom");
      },
      getReportedFunctionName: () => "fnX",
      resolveAnnotationTargetNode: () => ({ type: "FunctionDeclaration" }),
      getNameNodeForReport: (node: any) => node,
      buildTemplateConfig: () => ({
        effectiveTemplate:
          "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
        allowFix: true,
      }),
      extractName: () => "fnX",
      getAnnotationTemplate: () =>
        "/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
      shouldApplyAutoFix: () => true,
      createAddStoryFix: () => () => ({}),
      createMethodFix: () => () => ({}),
    };

    const context: any = {
      report: jest.fn(),
    };

    const node: any = { type: "FunctionDeclaration" };

    expect(() =>
      coreReportMissing(deps, context as any, {} as any, { node }),
    ).not.toThrow();

    expect(context.report).not.toHaveBeenCalled();
  });
});
