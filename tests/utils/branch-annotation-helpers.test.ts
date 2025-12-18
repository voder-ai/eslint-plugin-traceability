/**
 * Unit tests for branch annotation helpers
 * Tests for: docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement
 * @supports docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md REQ-CONFIGURABLE-SCOPE
 */
import { validateBranchTypes, DEFAULT_BRANCH_TYPES, gatherBranchCommentText, AnnotationPlacement } from "../../src/utils/branch-annotation-helpers";
import type { Rule } from "eslint";

describe("validateBranchTypes helper (Story 004.0-DEV-BRANCH-ANNOTATIONS)", () => {
  let context: Partial<Rule.RuleContext> & { report: jest.Mock };

  beforeEach(() => {
    context = { options: [], report: jest.fn() };
  });

  it("should return default branch types when no options provided", () => {
    const result = validateBranchTypes(context as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(DEFAULT_BRANCH_TYPES);
  });

  it("should return custom branch types when valid options provided", () => {
    context.options = [{ branchTypes: ["IfStatement", "ForStatement"] }];
    const result = validateBranchTypes(context as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["IfStatement", "ForStatement"]);
  });

  it("should return listener when invalid branch types provided and report errors", () => {
    const invalid = ["UnknownType", "Foo"];
    context.options = [{ branchTypes: invalid }];
    // Invoke helper
    const result = validateBranchTypes(context as any);
    // Should return a listener object
    expect(typeof result).toBe("object");
    expect(result).toHaveProperty("Program");
    // Call the Program listener
    const fakeNode = {};
    (result as any).Program(fakeNode);
    // report should be called for each invalid type
    expect(context.report).toHaveBeenCalledTimes(invalid.length);
    invalid.forEach((t) => {
      expect(context.report).toHaveBeenCalledWith(expect.objectContaining({
        node: fakeNode,
        message: expect.stringContaining(`Value "${t}" should be equal to one of the allowed values:`),
      }));
    });
  });

  it("should gather SwitchCase comment text via gatherBranchCommentText (Story 004.0-DEV-BRANCH-ANNOTATIONS)", () => {
    // Fake SourceCode-like object with lines aligned to PRE_COMMENT_OFFSET logic
    const sourceCode: any = {
      lines: [
        "// @story first part",
        "// continuation second part",
        "case 1:",
      ],
      getCommentsBefore: () => [],
      getText: jest.fn(),
    };

    // SwitchCase-like node with loc.start.line corresponding to "case 1:" line (line 3)
    const switchCaseNode: any = {
      type: "SwitchCase",
      loc: {
        start: { line: 3, column: 0 },
        end: { line: 3, column: 7 },
      },
    };

    const text = gatherBranchCommentText(sourceCode as any, switchCaseNode as any);

    // Expect combined text using space separator and preserving leading //
    expect(text).toBe("// @story first part // continuation second part");
  });

  it("should gather comment text for CatchClause and loop nodes via gatherBranchCommentText (Story 004.0-DEV-BRANCH-ANNOTATIONS)", () => {
    // CatchClause: comments come from getCommentsBefore when beforeText already contains @story
    const catchComments = [
      { type: "Line", value: "@story catch branch story" },
      { type: "Line", value: "additional info" },
    ];
    const sourceCodeCatch: any = {
      getCommentsBefore: jest.fn().mockReturnValue(catchComments),
      getText: jest.fn().mockReturnValue("@story existing beforeText"),
      lines: [],
    };

    const catchNode: any = {
      type: "CatchClause",
      loc: {
        start: { line: 10, column: 0 },
        end: { line: 12, column: 1 },
      },
    };

    const catchText = gatherBranchCommentText(sourceCodeCatch as any, catchNode as any);
    expect(sourceCodeCatch.getCommentsBefore).toHaveBeenCalledWith(catchNode);
    expect(catchText).toContain("@story catch branch story");
    expect(catchText).toContain("additional info");

    // Loop node: ForStatement currently uses beforeComments.map(extractCommentValue).join(" ")
    const loopComments = [
      { type: "Line", value: "@story loop branch story" },
      { type: "Block", value: "loop details" },
    ];
    const sourceCodeLoop: any = {
      getCommentsBefore: jest.fn().mockReturnValue(loopComments),
      getText: jest.fn().mockReturnValue("@story loop beforeText"),
      lines: [],
    };

    const forNode: any = {
      type: "ForStatement",
      loc: {
        start: { line: 20, column: 0 },
        end: { line: 25, column: 1 },
      },
    };

    const loopText = gatherBranchCommentText(sourceCodeLoop as any, forNode as any);
    expect(sourceCodeLoop.getCommentsBefore).toHaveBeenCalledWith(forNode);
    expect(loopText).toBe("@story loop branch story loop details");
  });
});

/**
 * Tests for annotationPlacement wiring at helper level
 * @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG
 * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-DEFAULT-BACKWARD-COMPAT
 */
describe("gatherBranchCommentText annotationPlacement wiring (Story 028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION)", () => {
  it("[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] honors configured placement for simple if-statements", () => {
    const sourceCode: any = {
      lines: [
        "function demo() {",
        "  if (condition) {",
        "    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
        "    // @req REQ-INSIDE",
        "    doSomething();",
        "  }",
        "}",
      ],
      getCommentsBefore: jest
        .fn()
        .mockReturnValue([
          { value: "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md" },
          { value: "@req REQ-BEFORE" },
        ]),
    };

    const ifNode: any = {
      type: "IfStatement",
      loc: {
        start: { line: 2, column: 2 },
        end: { line: 5, column: 3 },
      },
      consequent: {
        type: "BlockStatement",
        loc: {
          start: { line: 2, column: 18 },
          end: { line: 5, column: 3 },
        },
      },
    };

    const parent: any = {
      type: "BlockStatement",
      body: [ifNode],
    };

    const beforeText = gatherBranchCommentText(
      sourceCode as any,
      ifNode,
      parent,
      "before" as AnnotationPlacement,
    );
    expect(beforeText).toContain(
      "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
    );
    expect(beforeText).toContain("@req REQ-BEFORE");

    const insideText = gatherBranchCommentText(
      sourceCode as any,
      ifNode,
      parent,
      "inside" as AnnotationPlacement,
    );
    expect(insideText).toContain(
      "@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
    );
    expect(insideText).toContain("@req REQ-INSIDE");
    expect(insideText).not.toContain("@req REQ-BEFORE");
  });
});