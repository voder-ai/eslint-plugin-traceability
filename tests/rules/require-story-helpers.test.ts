/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify helper functions in require-story helpers produce correct fixes and reporting behavior
 */
import {
  createAddStoryFix,
  createMethodFix,
} from "../../src/rules/helpers/require-story-core";
import { ANNOTATION } from "../../src/rules/helpers/require-story-helpers";
import { reportMissing } from "../../src/rules/helpers/require-story-core";

describe("Require Story Helpers (Story 003.0)", () => {
  test("createAddStoryFix uses parent range start when available", () => {
    const target: any = {
      range: [20, 40],
      parent: { type: "ExportNamedDeclaration", range: [10, 50] },
    };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const fixFn = createAddStoryFix(target);
    const result = fixFn(fixer);
    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
    const calledArgs = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];
    expect(calledArgs[0]).toEqual([10, 10]);
    expect(calledArgs[1]).toBe(`${ANNOTATION}\n`);
    expect(result).toEqual({ r: [10, 10], t: `${ANNOTATION}\n` });
  });

  test("createMethodFix falls back to node.range when parent not export", () => {
    const node: any = { range: [30, 60], parent: { type: "ClassBody" } };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const fixFn = createMethodFix(node);
    const res = fixFn(fixer);
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][0]).toEqual(
      [30, 30],
    );
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][1]).toBe(
      `${ANNOTATION}\n  `,
    );
    expect(res).toEqual({ r: [30, 30], t: `${ANNOTATION}\n  ` });
  });

  test("reportMissing does not call context.report if JSDoc contains @story", () => {
    const node: any = { id: { name: "fn" }, range: [0, 10] };
    const fakeSource = {
      getJSDocComment: () => ({
        value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
      }),
    } as any;
    const context: any = {
      getSourceCode: () => fakeSource,
      report: jest.fn(),
    };

    reportMissing(context, fakeSource, node, node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test("reportMissing calls context.report when no JSDoc story present", () => {
    const node: any = { id: { name: "fn2" }, range: [0, 10] };
    const fakeSource = { getJSDocComment: () => null } as any;
    const context: any = {
      getSourceCode: () => fakeSource,
      report: jest.fn(),
    };

    reportMissing(context, fakeSource, node, node);
    expect(context.report).toHaveBeenCalledTimes(1);
    const call = (context.report as jest.Mock).mock.calls[0][0];
    expect(call.node).toBe(node);
    expect(call.messageId).toBe("missingStory");
  });
});
