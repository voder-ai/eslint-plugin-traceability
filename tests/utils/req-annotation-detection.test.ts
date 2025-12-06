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
});
