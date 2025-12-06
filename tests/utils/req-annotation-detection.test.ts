/**
 * Tests for advanced @req detection heuristics
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
import type { TSESTree } from "@typescript-eslint/utils";
import { hasReqAnnotation as _hasReqAnnotation } from "../../src/utils/reqAnnotationDetection";

// Small helper to construct a minimal SourceCode-like object for the detection helpers.
function createMockSourceCode(options: {
  lines?: string[] | null;
  text?: string;
  commentsBefore?: any[];
} = {}) {
  const { lines = null, text = "", commentsBefore = [] } = options;
  return {
    lines: lines ?? undefined,
    getText() {
      return text;
    },
    getCommentsBefore() {
      return commentsBefore;
    },
  } as any;
}

describe("reqAnnotationDetection advanced heuristics (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
  it("[REQ-ANNOTATION-REQ-DETECTION] returns false when sourceCode is missing", () => {
    const has = _hasReqAnnotation(null as any, [], undefined as any, {
      loc: null,
    } as unknown as TSESTree.Node);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] returns false when node is missing", () => {
    const context = {
      getSourceCode() {
        return createMockSourceCode({ lines: ["/** @req REQ-TEST */"] });
      },
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, undefined as any);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] inspects jsdoc and comments when advanced heuristics throw", () => {
    const context = {
      getSourceCode() {
        // This object intentionally causes hasReqInAdvancedHeuristics to throw by
        // providing a getCommentsBefore implementation that throws on access.
        return {
          getCommentsBefore() {
            throw new Error("boom");
          },
        } as any;
      },
    } as any;

    const jsdoc = { value: "/** @req REQ-FROM-JSDOC */" } as any;

    const has = _hasReqAnnotation(jsdoc, [], context, {
      // Minimal shape – the helper will call into the mock sourceCode and trigger the throw
      parent: {},
    } as any);

    expect(has).toBe(true);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] treats @supports in comments as satisfying requirement", () => {
    const context = {
      getSourceCode() {
        return createMockSourceCode();
      },
    } as any;

    const comments = [{ value: "// @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-X" }];

    const has = _hasReqAnnotation(null as any, comments, context, {
      parent: {},
    } as any);

    expect(has).toBe(true);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when lines is not an array", () => {
    const context = {
      getSourceCode() {
        // lines is null here, causing the helper to see a non-array and return false
        return createMockSourceCode({ lines: null });
      },
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, {
      // Provide a minimal location so advanced heuristics try to use line info
      loc: { start: { line: 5 } },
      parent: {},
    } as any);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when startLine is not a number", () => {
    const sourceCode = createMockSourceCode({ lines: ["// @req REQ-SHOULD-NOT-BE-SEEN"] });
    const has = _hasReqAnnotation(null as any, [], { getSourceCode: () => sourceCode } as any, {
      // loc is missing/undefined; startLine will not be a valid number
      loc: undefined,
      parent: {},
    } as any);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns false when getCommentsBefore is not a function and no leadingComments/parents have req", () => {
    const context = {
      getSourceCode() {
        return {
          // getCommentsBefore is not a function here
          getCommentsBefore: 123,
        } as any;
      },
    } as any;

    const node = {
      parent: {
        leadingComments: [{ value: "no req here" }],
        parent: {
          leadingComments: [{ value: "still nothing" }],
        },
      },
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns true when getCommentsBefore returns comments containing @req", () => {
    const sourceCode = {
      getCommentsBefore(n: any) {
        if (n && n.isTargetParent) {
          return [{ value: "/* @req REQ-FROM-PARENT */" }];
        }
        return [];
      },
    } as any;

    const context = {
      getSourceCode() {
        return sourceCode;
      },
    } as any;

    const node = {
      parent: {
        isTargetParent: true,
        parent: {},
      },
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(true);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when getText is not a function", () => {
    const context = {
      getSourceCode() {
        return {
          // getText is not a function
          getText: "not-a-function",
        } as any;
      },
    } as any;

    const node = {
      range: [0, 10],
      parent: {},
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when node.range is not an array", () => {
    const context = {
      getSourceCode() {
        return createMockSourceCode({ text: "/* @req REQ-IN-TEXT */" });
      },
    } as any;

    const node = {
      // range is missing; helper should see non-array range and return false
      range: null,
      parent: {},
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns true when text window contains @req", () => {
    const fullText = `
      // some header
      /** @req REQ-IN-TEXT-WINDOW */
      function foo() {}
    `;
    const context = {
      getSourceCode() {
        return createMockSourceCode({ text: fullText });
      },
    } as any;

    // Choose a range that starts after the @req comment so the "text before"
    // window that the helper inspects includes the annotation.
    const startIndex = fullText.indexOf("function foo");
    const node = {
      range: [startIndex, startIndex + 5],
      parent: {},
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(true);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when getText throws", () => {
    const context = {
      getSourceCode() {
        return {
          getText() {
            throw new Error("boom from getText");
          },
        } as any;
      },
    } as any;

    const node = {
      range: [0, 10],
      parent: {},
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] hasReqInAdvancedHeuristics short-circuits and returns false when sourceCode is missing", () => {
    const context = {
      // No getSourceCode method at all – internal advanced heuristics
      // should immediately return false and not throw.
    } as any;

    const node = {
      loc: { start: { line: 3 } },
      range: [0, 10],
      parent: {},
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, node);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] hasReqInAdvancedHeuristics short-circuits and returns false when node is missing", () => {
    const context = {
      getSourceCode() {
        return createMockSourceCode({ text: "@req REQ-SHOULD-NOT-BE-SEEN" });
      },
    } as any;

    const has = _hasReqAnnotation(null as any, [], context, undefined as any);

    expect(has).toBe(false);
  });

  it("[REQ-ANNOTATION-REQ-DETECTION] hasReqAnnotation returns true when jsdoc contains @supports and advanced heuristics are false", () => {
    const context = {
      getSourceCode() {
        // Returning a sourceCode that will not satisfy any advanced heuristic
        // (no lines, no comments, empty text).
        return createMockSourceCode({ lines: [], text: "" });
      },
    } as any;

    const jsdoc = {
      value: "/** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-SUPPORTS */",
    } as any;

    const node = {
      parent: {},
    } as any;

    const has = _hasReqAnnotation(jsdoc, [], context, node);

    expect(has).toBe(true);
  });
});