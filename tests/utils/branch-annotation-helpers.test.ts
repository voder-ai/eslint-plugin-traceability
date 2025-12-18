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
    const sourceCode: any = {
      lines: [],
      getCommentsBefore: jest.fn().mockReturnValue([
        { value: "@story first part" },
        { value: "@req REQ-FIRST" },
      ]),
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

    expect(text).toBe("@story first part @req REQ-FIRST");
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

  it("[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] uses inside-loop comments when annotationPlacement is 'inside' and ignores before-loop annotations", () => {
    const sourceCode: any = {
      lines: [
        "// @story before-loop should be ignored in inside mode",
        "for (const item of items) {",
        "  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
        "  // @req REQ-LOOP-INSIDE",
        "  process(item);",
        "}",
      ],
      getCommentsBefore: jest
        .fn()
        .mockReturnValue([
          { value: "@story before-loop should be ignored in inside mode" },
        ]),
    };

    const loopNode: any = {
      type: "ForOfStatement",
      loc: {
        start: { line: 2, column: 0 },
        end: { line: 5, column: 1 },
      },
      body: {
        type: "BlockStatement",
        loc: {
          start: { line: 2, column: 27 },
          end: { line: 5, column: 1 },
        },
      },
    };

    const parent: any = {
      type: "BlockStatement",
      body: [loopNode],
    };

    const insideText = gatherBranchCommentText(
      sourceCode as any,
      loopNode,
      parent,
      "inside" as AnnotationPlacement,
    );

    expect(insideText).toContain(
      "@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
    );
    expect(insideText).toContain("@req REQ-LOOP-INSIDE");
    expect(insideText).not.toContain("before-loop should be ignored");
  });

  it("[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] uses inside-catch comments when annotationPlacement is 'inside' and ignores before-catch annotations", () => {
    const sourceCode: any = {
      lines: [
        "// @story before-catch should be ignored in inside mode",
        "try {",
        "  doSomething();",
        "}",
        "catch (error) {",
        "  // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
        "  // @req REQ-CATCH-INSIDE",
        "  handleError(error);",
        "}",
      ],
      getCommentsBefore: jest
        .fn()
        .mockReturnValue([
          { value: "@story before-catch should be ignored in inside mode" },
        ]),
    };

    const catchNode: any = {
      type: "CatchClause",
      loc: {
        start: { line: 5, column: 0 },
        end: { line: 8, column: 1 },
      },
      body: {
        type: "BlockStatement",
        loc: {
          start: { line: 5, column: 14 },
          end: { line: 8, column: 1 },
        },
      },
    };

    const parent: any = {
      type: "TryStatement",
      handler: catchNode,
    };

    const insideText = gatherBranchCommentText(
      sourceCode as any,
      catchNode,
      parent,
      "inside" as AnnotationPlacement,
    );

    expect(insideText).toContain(
      "@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
    );
    expect(insideText).toContain("@req REQ-CATCH-INSIDE");
    expect(insideText).not.toContain("before-catch should be ignored");
  });

  it("[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] uses inside-switch comments when annotationPlacement is 'inside' and ignores before-case annotations", () => {
    const sourceCode: any = {
      lines: [
        "// @story before-switch should be ignored in inside mode",
        "switch (value) {",
        "  case 'a': {",
        "    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
        "    // @req REQ-SWITCH-INSIDE",
        "    doSomething();",
        "  }",
        "}",
      ],
      getCommentsBefore: jest
        .fn()
        .mockReturnValue([
          { value: "@story before-switch should be ignored in inside mode" },
        ]),
    };

    const switchCaseNode: any = {
      type: "SwitchCase",
      loc: {
        start: { line: 3, column: 2 },
        end: { line: 7, column: 4 },
      },
      consequent: [
        {
          type: "BlockStatement",
          loc: {
            start: { line: 3, column: 16 },
            end: { line: 7, column: 4 },
          },
        },
      ],
    };

    const parent: any = {
      type: "SwitchStatement",
      discriminant: { type: "Identifier", name: "value" },
      cases: [switchCaseNode],
    };

    const insideText = gatherBranchCommentText(
      sourceCode as any,
      switchCaseNode,
      parent,
      "inside" as AnnotationPlacement,
    );

    expect(insideText).toContain(
      "@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
    );
    expect(insideText).toContain("@req REQ-SWITCH-INSIDE");
    expect(insideText).not.toContain("before-switch should be ignored");
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

  it("[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] honors Story 028.0 inside-placement semantics for else-if branches while preserving Story 026.0 before-else behavior", () => {
    const sourceCode: any = {
      lines: [
        "function demoElseIf(x) {", // 1
        "  if (x === 1) {", // 2
        "    // @story inside-if", // 3
        "    doOne();", // 4
        "  }", // 5
        "  // @story docs/stories/026.0-DEV-BRANCH-ANNOTATIONS-ELSE-BRANCHES.story.md", // 6 (before else-if)
        "  // @req REQ-BEFORE-ELSE", // 7
        "  else if (x === 2) {", // 8
        "    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md", // 9 (inside else-if)
        "    // @req REQ-ELSE-IF-INSIDE", // 10
        "    doTwo();", // 11
        "  }", // 12
        "}", // 13
      ],
      getCommentsBefore: jest.fn().mockImplementation((node: any) => {
        // Simulate ESLint getCommentsBefore only returning comments that are truly
        // "before" the node they are querying.
        // Our chain has:
        // - before-if comments not used in this test
        // - line 6-7 as before-else-if comments
        if (node && node.loc && node.loc.start && node.loc.start.line === 2) {
          // before the initial if (not used in assertions here)
          return [
            { value: "@story BEFORE-IF" },
            { value: "@req REQ-BEFORE-IF" },
          ];
        }
        if (node && node.loc && node.loc.start && node.loc.start.line === 8) {
          // before the else-if branch (Story 026.0 semantics)
          return [
            {
              value:
                "@story docs/stories/026.0-DEV-BRANCH-ANNOTATIONS-ELSE-BRANCHES.story.md",
            },
            { value: "@req REQ-BEFORE-ELSE" },
          ];
        }
        return [];
      }),
    };

    const elseIfNode: any = {
      type: "IfStatement",
      loc: {
        start: { line: 8, column: 2 },
        end: { line: 12, column: 3 },
      },
      consequent: {
        type: "BlockStatement",
        loc: {
          start: { line: 8, column: 22 },
          end: { line: 12, column: 3 },
        },
      },
    };

    const parent: any = {
      type: "IfStatement",
      alternate: elseIfNode,
    };

    const beforeText = gatherBranchCommentText(
      sourceCode as any,
      elseIfNode,
      parent,
      "before" as AnnotationPlacement,
    );

    expect(beforeText).toContain(
      "@story docs/stories/026.0-DEV-BRANCH-ANNOTATIONS-ELSE-BRANCHES.story.md",
    );
    expect(beforeText).toContain("@req REQ-BEFORE-ELSE");

    const insideText = gatherBranchCommentText(
      sourceCode as any,
      elseIfNode,
      parent,
      "inside" as AnnotationPlacement,
    );

    expect(insideText).toBe("");
    expect(insideText).not.toContain("REQ-BEFORE-ELSE");
    expect(insideText).not.toContain(
      "docs/stories/026.0-DEV-BRANCH-ANNOTATIONS-ELSE-BRANCHES.story.md",
    );
  });

  it("[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] honors configured placement for TryStatement branches in try/finally patterns", () => {
    const sourceCode: any = {
      lines: [
        "function demoTry() {", // 1
        "  // @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md", // 2 (before try)
        "  // @req REQ-BEFORE-TRY", // 3
        "  try {", // 4
        "    // @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md", // 5 (inside try)
        "    // @req REQ-TRY-INSIDE", // 6
        "    doWork();", // 7
        "  } finally {", // 8
        "    cleanup();", // 9
        "  }", // 10
        "}", // 11
      ],
      getCommentsBefore: jest.fn().mockImplementation((node: any) => {
        if (node && node.loc && node.loc.start && node.loc.start.line === 4) {
          return [
            {
              value:
                "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
            },
            { value: "@req REQ-BEFORE-TRY" },
          ];
        }
        return [];
      }),
    };

    const tryNode: any = {
      type: "TryStatement",
      loc: {
        start: { line: 4, column: 2 },
        end: { line: 9, column: 3 },
      },
      block: {
        type: "BlockStatement",
        loc: {
          start: { line: 4, column: 8 },
          end: { line: 7, column: 3 },
        },
      },
      handler: null,
      finalizer: {
        type: "BlockStatement",
        loc: {
          start: { line: 8, column: 12 },
          end: { line: 9, column: 3 },
        },
      },
    };

    const parent: any = {
      type: "BlockStatement",
      body: [tryNode],
    };

    const beforeText = gatherBranchCommentText(
      sourceCode as any,
      tryNode,
      parent,
      "before" as AnnotationPlacement,
    );

    expect(beforeText).toContain(
      "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
    );
    expect(beforeText).toContain("@req REQ-BEFORE-TRY");
    expect(beforeText).not.toContain("REQ-TRY-INSIDE");

    const insideText = gatherBranchCommentText(
      sourceCode as any,
      tryNode,
      parent,
      "inside" as AnnotationPlacement,
    );

    expect(insideText).toContain(
      "@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
    );
    expect(insideText).toContain("@req REQ-TRY-INSIDE");
    expect(insideText).not.toContain("REQ-BEFORE-TRY");
  });

  it("[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] honors before-case annotations for SwitchCase in default placement mode", () => {
    const sourceCode: any = {
      lines: [
        "// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
        "// @req REQ-SWITCH-BEFORE",
        "switch (value) {",
        "  case 'a':",
        "    doSomething();",
        "}",
      ],
      getCommentsBefore: jest
        .fn()
        .mockReturnValue([
          {
            value:
              "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
          },
          { value: "@req REQ-SWITCH-BEFORE" },
        ]),
    };

    const switchCaseNode: any = {
      type: "SwitchCase",
      loc: {
        start: { line: 4, column: 2 },
        end: { line: 5, column: 18 },
      },
      consequent: [
        {
          type: "ExpressionStatement",
          loc: {
            start: { line: 5, column: 4 },
            end: { line: 5, column: 18 },
          },
        },
      ],
    };

    const parent: any = {
      type: "SwitchStatement",
      discriminant: { type: "Identifier", name: "value" },
      cases: [switchCaseNode],
    };

    const beforeText = gatherBranchCommentText(
      sourceCode as any,
      switchCaseNode,
      parent,
      "before" as AnnotationPlacement,
    );

    expect(beforeText).toContain(
      "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md",
    );
    expect(beforeText).toContain("@req REQ-SWITCH-BEFORE");
  });
});