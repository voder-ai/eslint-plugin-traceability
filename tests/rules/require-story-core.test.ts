/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Verify createMethodFix and reportMethod behaviors
 */
import {
  createMethodFix,
  reportMethod,
} from "../../src/rules/helpers/require-story-core";
import { ANNOTATION } from "../../src/rules/helpers/require-story-helpers";

describe("Require Story Core (Story 003.0)", () => {
  test("createMethodFix uses parent range start when parent is export", () => {
    const node: any = {
      type: "MethodDefinition",
      range: [30, 60],
      parent: { type: "ExportNamedDeclaration", range: [12, 90] },
    };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;

    const fixFn = createMethodFix(node);
    const result = fixFn(fixer);

    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
    const calledArgs = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];
    expect(calledArgs[0]).toEqual([12, 12]);
    expect(calledArgs[1]).toBe(`${ANNOTATION}\n  `);
    expect(result).toEqual({ r: [12, 12], t: `${ANNOTATION}\n  ` });
  });

  test("reportMethod calls context.report with proper data and suggest.fix works", () => {
    const node: any = {
      type: "MethodDefinition",
      key: { name: "myMethod" },
      range: [40, 80],
      parent: { type: "ClassBody" },
    };

    const fakeSource: any = { getText: () => "" };
    const context: any = {
      getSourceCode: () => fakeSource,
      report: jest.fn(),
    };

    reportMethod(context, fakeSource, node, node);

    expect(context.report).toHaveBeenCalledTimes(1);
    const call = (context.report as jest.Mock).mock.calls[0][0];
    expect(call.messageId).toBe("missingStory");
    expect(call.data).toEqual({ name: "myMethod" });

    // The suggest fix should be a function; exercise it with a mock fixer
    expect(Array.isArray(call.suggest)).toBe(true);
    expect(typeof call.suggest[0].fix).toBe("function");

    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const fixResult = call.suggest[0].fix(fixer);
    expect(fixer.insertTextBeforeRange).toHaveBeenCalled();
    const args = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];
    expect(args[0]).toEqual([40, 40]);
    expect(args[1]).toBe(`${ANNOTATION}\n  `);
    expect(fixResult).toEqual({ r: [40, 40], t: `${ANNOTATION}\n  ` });
  });
});
