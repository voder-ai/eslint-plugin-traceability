/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-COVERAGE-HELPERS - Additional tests to exercise edge branches in require-story-helpers.ts
 */

import {
  jsdocHasStory,
  commentsBeforeHasStory,
  leadingCommentsHasStory,
  resolveTargetNode,
  shouldProcessNode,
  reportMissing,
  DEFAULT_SCOPE,
} from "../../src/rules/helpers/require-story-helpers";

describe("Require Story Helpers - additional branch coverage (Story 003.0)", () => {
  test("jsdocHasStory returns false when JSDoc exists but value is not a string", () => {
    const fakeSource: any = { getJSDocComment: () => ({ value: 123 }) };
    const res = jsdocHasStory(fakeSource, {} as any);
    expect(res).toBe(false);
  });

  test("commentsBeforeHasStory returns false when comments exist but value is not a string", () => {
    const fakeSource: any = { getCommentsBefore: () => [{ value: 123 }] };
    const res = commentsBeforeHasStory(fakeSource, {} as any);
    expect(res).toBe(false);
  });

  test("leadingCommentsHasStory detects @story in leadingComments array", () => {
    const node: any = {
      leadingComments: [
        { type: "Block", value: "some other text" },
        {
          type: "Block",
          value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
        },
      ],
    };
    expect(leadingCommentsHasStory(node)).toBe(true);
  });

  test("resolveTargetNode returns ExpressionStatement parent for FunctionExpression", () => {
    const fakeSource: any = { getText: () => "" };
    const node: any = {
      type: "FunctionExpression",
      parent: { type: "ExpressionStatement" },
    };
    const resolved = resolveTargetNode(fakeSource, node);
    expect(resolved).toBe(node.parent);
  });

  test("shouldProcessNode respects exportPriority 'exported' and 'non-exported'", () => {
    const exportedNode: any = {
      type: "FunctionDeclaration",
      parent: { parent: { type: "ExportNamedDeclaration" } },
    };
    const nonExportedNode: any = {
      type: "FunctionDeclaration",
      parent: { parent: { type: "SomeOther" } },
    };

    expect(shouldProcessNode(exportedNode, DEFAULT_SCOPE, "exported")).toBe(
      true,
    );
    expect(shouldProcessNode(nonExportedNode, DEFAULT_SCOPE, "exported")).toBe(
      false,
    );

    // non-exported should reject exported nodes
    expect(shouldProcessNode(exportedNode, DEFAULT_SCOPE, "non-exported")).toBe(
      false,
    );
    expect(
      shouldProcessNode(nonExportedNode, DEFAULT_SCOPE, "non-exported"),
    ).toBe(true);
  });

  test("reportMissing does not report when linesBeforeHasStory finds a preceding @story", () => {
    const jsdoc =
      "/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n";
    const rest = "function fnA() {}\n";
    const full = jsdoc + rest;
    const fakeSource: any = {
      getText: () => full,
      getJSDocComment: () => null,
      lines: full.split(/\r?\n/),
      getCommentsBefore: () => [],
    };
    const node: any = {
      type: "FunctionDeclaration",
      range: [full.indexOf("function"), full.length],
      loc: {
        start: {
          line:
            fakeSource.lines.findIndex((l: string) =>
              l.includes("function fnA() {}"),
            ) + 1,
        },
      },
    };

    const context: any = { getSourceCode: () => fakeSource, report: jest.fn() };
    reportMissing(context, fakeSource, node, node);
    expect(context.report).not.toHaveBeenCalled();
  });
});
