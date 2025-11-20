/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify helper functions in require-story helpers produce correct fixes and reporting behavior
 */
import {
  createAddStoryFix,
  createMethodFix,
  reportMissing,
} from "../../src/rules/helpers/require-story-core";
import {
  ANNOTATION,
  resolveTargetNode,
  getNodeName,
  shouldProcessNode,
  linesBeforeHasStory,
  fallbackTextBeforeHasStory,
  parentChainHasStory,
  DEFAULT_SCOPE,
} from "../../src/rules/helpers/require-story-helpers";

describe("Require Story Helpers (Story 003.0)", () => {
  test("createAddStoryFix uses parent range start when available", () => {
    const target: any = {
      type: "FunctionDeclaration",
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
    const node: any = {
      type: "MethodDefinition",
      range: [30, 60],
      parent: { type: "ClassBody" },
    };
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
    const node: any = {
      type: "FunctionDeclaration",
      id: { name: "fn" },
      range: [0, 10],
    };
    const fakeSource = {
      getJSDocComment: () => ({
        value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
      }),
      getText: () => "",
    } as any;
    const context: any = {
      getSourceCode: () => fakeSource,
      report: jest.fn(),
    };

    reportMissing(context, fakeSource, node, node);
    expect(context.report).not.toHaveBeenCalled();
  });

  test("reportMissing calls context.report when no JSDoc story present", () => {
    const node: any = {
      type: "FunctionDeclaration",
      id: { name: "fn2" },
      range: [0, 10],
    };
    const fakeSource = {
      getJSDocComment: () => null,
      getText: () => "",
    } as any;
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

  /**
   * Additional helper tests for story annotations and IO helpers
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Verify resolveTargetNode/getNodeName/shouldProcessNode and IO helpers
   */
  test("resolveTargetNode prefers parent when parent is ExportNamedDeclaration", () => {
    const fakeSource: any = { getText: () => "" };
    const node: any = {
      type: "FunctionExpression",
      range: [5, 10],
      parent: { type: "ExportNamedDeclaration", range: [1, 20] },
    };
    const resolved = resolveTargetNode(fakeSource, node);
    expect(resolved).toBe(node.parent);
  });

  test("resolveTargetNode falls back to node when parent is not an export", () => {
    const fakeSource: any = { getText: () => "" };
    const node: any = {
      type: "FunctionDeclaration",
      range: [5, 10],
      parent: { type: "ClassBody", range: [1, 20] },
    };
    const resolved = resolveTargetNode(fakeSource, node);
    expect(resolved).toBe(node);
  });

  test("getNodeName extracts names from common node shapes", () => {
    const funcNode: any = {
      type: "FunctionDeclaration",
      id: { name: "myFunc" },
    };
    const propNode: any = { type: "MethodDefinition", key: { name: "myProp" } };
    expect(getNodeName(funcNode)).toBe("myFunc");
    expect(getNodeName(propNode)).toBe("myProp");
  });

  test("shouldProcessNode returns booleans for typical node types", () => {
    const funcDecl: any = { type: "FunctionDeclaration" };
    const varDecl: any = { type: "VariableDeclaration" };
    expect(shouldProcessNode(funcDecl, DEFAULT_SCOPE)).toBeTruthy();
    expect(shouldProcessNode(varDecl, DEFAULT_SCOPE)).toBeFalsy();
  });

  test("linesBeforeHasStory detects preceding JSDoc story text", () => {
    const jsdoc =
      "/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n";
    const rest = "function fn() {}\n";
    const full = jsdoc + rest;
    const fakeSource: any = {
      getText: () => full,
      getJSDocComment: () => ({
        value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
      }),
      lines: full.split(/\r?\n/),
    };
    const nodeLine =
      fakeSource.lines.findIndex((l: string) =>
        l.includes("function fn() {}"),
      ) + 1;
    const node: any = {
      type: "FunctionDeclaration",
      range: [full.indexOf("function"), full.length],
      loc: { start: { line: nodeLine } },
    };
    const has = linesBeforeHasStory(fakeSource, node);
    expect(has).toBeTruthy();
  });

  test("fallbackTextBeforeHasStory returns boolean when called with source text and range", () => {
    const jsdoc =
      "/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n";
    const rest = "function fnB() {}\n";
    const full = jsdoc + rest;
    const fakeSource: any = {
      getText: () => full,
    };
    const node: any = {
      type: "FunctionDeclaration",
      range: [full.indexOf("function"), full.length],
    };
    const res = fallbackTextBeforeHasStory(fakeSource, node);
    expect(typeof res).toBe("boolean");
    expect(res).toBeTruthy();
  });

  test("parentChainHasStory returns true when ancestors have JSDoc story", () => {
    const fakeSource: any = {
      getCommentsBefore: () => [
        {
          type: "Block",
          value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
        },
      ],
    };
    const node: any = {
      type: "Identifier",
      parent: { parent: { type: "ExportNamedDeclaration" } },
    };
    const res = parentChainHasStory(fakeSource, node);
    expect(res).toBeTruthy();
  });
});
