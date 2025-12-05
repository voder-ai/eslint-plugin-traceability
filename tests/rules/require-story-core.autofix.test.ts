/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)
 */
import { createAddStoryFix } from "../../src/rules/helpers/require-story-core";
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
});
