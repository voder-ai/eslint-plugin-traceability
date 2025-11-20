/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Cover additional branch cases in require-story-core (addStoryFixer/reportMissing)
 */
import {
  createAddStoryFix,
  reportMissing,
} from "../../src/rules/helpers/require-story-core";
import { ANNOTATION } from "../../src/rules/helpers/require-story-helpers";

describe("Require Story Core (Story 003.0)", () => {
  test("createAddStoryFix falls back to 0 when target is falsy", () => {
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const fixFn = createAddStoryFix(null as any);
    const res = fixFn(fixer);
    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
    const args = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];
    expect(args[0]).toEqual([0, 0]);
    expect(args[1]).toBe(`${ANNOTATION}\n`);
    expect(res).toEqual({ r: [0, 0], t: `${ANNOTATION}\n` });
  });

  test("createAddStoryFix uses target.range when parent not export and parent.range missing", () => {
    const target: any = {
      type: "FunctionDeclaration",
      range: [21, 33],
      parent: { type: "ClassBody" },
    };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const fixFn = createAddStoryFix(target);
    const res = fixFn(fixer);
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][0]).toEqual(
      [21, 21],
    );
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][1]).toBe(
      `${ANNOTATION}\n`,
    );
    expect(res).toEqual({ r: [21, 21], t: `${ANNOTATION}\n` });
  });

  test("createAddStoryFix prefers ExportDefaultDeclaration parent.range when present", () => {
    const target: any = {
      type: "FunctionDeclaration",
      range: [50, 70],
      parent: { type: "ExportDefaultDeclaration", range: [5, 100] },
    };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const fixFn = createAddStoryFix(target);
    const res = fixFn(fixer);
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][0]).toEqual(
      [5, 5],
    );
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][1]).toBe(
      `${ANNOTATION}\n`,
    );
    expect(res).toEqual({ r: [5, 5], t: `${ANNOTATION}\n` });
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

    reportMissing(context, undefined as any, node, node);
    expect(context.report).toHaveBeenCalledTimes(1);
    const call = (context.report as jest.Mock).mock.calls[0][0];
    expect(call.node).toBe(node);
    expect(call.messageId).toBe("missingStory");
  });
});
