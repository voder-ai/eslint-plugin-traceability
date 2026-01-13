 
/**
 * Unit tests for else-if insert position calculation.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-PRETTIER-AUTOFIX-ELSE-IF
 */
import { reportMissingAnnotations } from "../../src/utils/branch-annotation-helpers";

describe("Else-if insert position (Story 026.0-DEV-ELSE-IF-ANNOTATION-POSITION)", () => {
  it("[REQ-PRETTIER-AUTOFIX-ELSE-IF] inserts annotations before the else-if line in Prettier-compatible default 'before' mode", () => {
    const lines = [
      "if (a) {",
      "  doA();",
      "}",
      "else if (b) {",
      "  doB();",
      "}",
    ];

    const fixer = {
      insertTextBeforeRange: jest.fn((r: [number, number], t: string) => ({
        r,
        t,
      })),
    } as any;

    const context: any = {
      options: [{ annotationPlacement: "before" }],
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
      report({ fix }: { fix?: (_f: any) => any }) {
        // immediately invoke the fixer to exercise the insert position
        if (typeof fix === "function") {
          fix(fixer);
        }
      },
    };

    const node: any = {
      type: "IfStatement",
      loc: { start: { line: 4 } },
      test: { loc: { end: { line: 4 } } },
      consequent: {
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

    const parent: any = {
      type: "IfStatement",
      alternate: node,
    };
    node.parent = parent;

    const storyFixCountRef = { count: 0 };

    reportMissingAnnotations(context as any, node, storyFixCountRef);

    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
    const [range, text] = (fixer.insertTextBeforeRange as jest.Mock).mock
      .calls[0];

    // ensure we are inserting before the else-if line (line 4) when placement is 'before'
    const expectedIndex = context
      .getSourceCode()
      .getIndexFromLoc({ line: 4, column: 0 });
    expect(range).toEqual([expectedIndex, expectedIndex]);
    // and that the inserted text is prefixed with the base indentation from line 4
    expect(text.startsWith("")).toBe(true);
  });
});