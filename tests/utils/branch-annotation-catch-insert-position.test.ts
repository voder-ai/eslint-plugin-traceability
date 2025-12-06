/**
 * Unit tests for CatchClause insert position calculation.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-PRETTIER-AUTOFIX
 */
import { reportMissingAnnotations } from "../../src/utils/branch-annotation-helpers";

describe("CatchClause insert position (Story 025.0-DEV-CATCH-ANNOTATION-POSITION)", () => {
  it("[REQ-PRETTIER-AUTOFIX] inserts annotations at the first statement inside the catch body", () => {
    const lines = [
      "try {",
      "  doSomething();",
      "}",
      "catch (error) {",
      "  handleError(error);",
      "}",
    ];

    const fixer = {
      insertTextBeforeRange: jest.fn((r: [number, number], t: string) => ({ r, t })),
    } as any;

    const context: any = {
      getSourceCode() {
        return {
          lines,
          getCommentsBefore() {
            return [];
          },
          getIndexFromLoc({ line, column }: { line: number; column: number }) {
            // simple line/column to index mapping for the test: assume each line ends with "\n"
            const prefix = lines.slice(0, line - 1).join("\n");
            return prefix.length + (line > 1 ? 1 : 0) + column;
          },
        } as any;
      },
      report({ fix }: { fix: (_f: any) => any }) {
        // immediately invoke the fixer to exercise the insert position
        if (typeof fix === "function") {
          fix(fixer);
        }
      },
    };

    const node: any = {
      type: "CatchClause",
      loc: { start: { line: 4 } },
      body: {
        type: "BlockStatement",
        loc: { start: { line: 4 } },
        body: [
          {
            type: "ExpressionStatement",
            loc: { start: { line: 5 } },
          },
        ],
      },
    };

    const storyFixCountRef = { count: 0 };

    reportMissingAnnotations(context as any, node, storyFixCountRef);

    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
    const [range, text] = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];

    // ensure we are inserting before the first statement in the catch body (line 5)
    const expectedIndex = context.getSourceCode().getIndexFromLoc({ line: 5, column: 0 });
    expect(range).toEqual([expectedIndex, expectedIndex]);
    // and that the inserted text is prefixed with the inner indentation from line 5
    expect(text.startsWith("  ")).toBe(true);
  });
});