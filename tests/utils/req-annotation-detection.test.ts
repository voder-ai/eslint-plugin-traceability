/**
 * Tests for advanced `@req` detection heuristics
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
import type { TSESTree } from "@typescript-eslint/utils";
import { hasReqAnnotation as _hasReqAnnotation } from "../../src/utils/reqAnnotationDetection";

// Small helper to construct a minimal SourceCode-like object for the detection helpers.
/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function getMockText(text: string) {
  return text;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function getMockCommentsBefore(commentsBefore: any[], _node?: unknown) {
  return commentsBefore;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function createMockSourceCode(options: {
  lines?: string[] | null;
  text?: string;
  commentsBefore?: any[];
} = {}) {
  const { lines = null, text = "", commentsBefore = [] } = options;
  return {
    lines: lines ?? undefined,
    getText: getMockText.bind(null, text),
    getCommentsBefore: getMockCommentsBefore.bind(null, commentsBefore),
  } as any;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function returnSourceCode(sourceCode: any) {
  return sourceCode;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function createContextWithSourceCode(sourceCode: any) {
  return {
    getSourceCode: returnSourceCode.bind(null, sourceCode),
  } as any;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function throwError(message: string) {
  throw new Error(message);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function getCommentsBeforeForTargetParent(n: any) {
  if (n && n.isTargetParent) {
    return [{ value: "/* @req REQ-FROM-PARENT */" }];
  }
  return [];
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function getCommentsBeforeForReqParent(n: any) {
  if (n && n.isReqParent) {
    return [{ value: "/* @req REQ-ADV-PARENT */" }];
  }
  return [{ value: "no req here" }];
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function returnsFalseWhenSourceCodeMissing() {
  const has = _hasReqAnnotation(null as any, [], undefined as any, {
    loc: null,
  } as unknown as TSESTree.Node);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function returnsFalseWhenNodeMissing() {
  const sourceCode = createMockSourceCode({ lines: ["/** @req REQ-TEST */"] });
  const context = createContextWithSourceCode(sourceCode);

  const has = _hasReqAnnotation(null as any, [], context, undefined as any);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function inspectsJsdocWhenAdvancedHeuristicsThrow() {
  // This object intentionally causes hasReqInAdvancedHeuristics to throw by
  // providing a getCommentsBefore implementation that throws on access.
  const sourceCode = {
    getCommentsBefore: throwError.bind(null, "boom"),
  } as any;

  const context = createContextWithSourceCode(sourceCode);
  const jsdoc = { value: "/** @req REQ-FROM-JSDOC */" } as any;

  const has = _hasReqAnnotation(jsdoc, [], context, {
    // Minimal shape – the helper will call into the mock sourceCode and trigger the throw
    parent: {},
  } as any);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function treatsSupportsInCommentsAsSatisfyingRequirement() {
  const context = createContextWithSourceCode(createMockSourceCode());
  const comments = [
    {
      value:
        "// @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-X",
    },
  ];

  const has = _hasReqAnnotation(null as any, comments, context, {
    parent: {},
  } as any);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function linesBeforeHasReqReturnsFalseWhenLinesNotArray() {
  // lines is null here, causing the helper to see a non-array and return false
  const context = createContextWithSourceCode(createMockSourceCode({ lines: null }));

  const has = _hasReqAnnotation(null as any, [], context, {
    // Provide a minimal location so advanced heuristics try to use line info
    loc: { start: { line: 5 } },
    parent: {},
  } as any);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function linesBeforeHasReqReturnsFalseWhenStartLineNotNumber() {
  const sourceCode = createMockSourceCode({
    lines: ["// @req REQ-SHOULD-NOT-BE-SEEN"],
  });
  const context = createContextWithSourceCode(sourceCode);

  const has = _hasReqAnnotation(null as any, [], context, {
    // loc is missing/undefined; startLine will not be a valid number
    loc: undefined,
    parent: {},
  } as any);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function parentChainHasReqReturnsFalseWhenCommentsBeforeNotFunction() {
  const sourceCode = {
    // getCommentsBefore is not a function here
    getCommentsBefore: 123,
  } as any;
  const context = createContextWithSourceCode(sourceCode);

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
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function parentChainHasReqReturnsTrueWhenGetCommentsBeforeContainsReq() {
  const sourceCode = {
    getCommentsBefore: getCommentsBeforeForTargetParent,
  } as any;

  const context = createContextWithSourceCode(sourceCode);
  const node = {
    parent: {
      isTargetParent: true,
      parent: {},
    },
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function fallbackTextBeforeHasReqReturnsFalseWhenGetTextNotFunction() {
  const sourceCode = {
    // getText is not a function
    getText: "not-a-function",
  } as any;
  const context = createContextWithSourceCode(sourceCode);

  const node = {
    range: [0, 10],
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function fallbackTextBeforeHasReqReturnsFalseWhenNodeRangeNotArray() {
  const context = createContextWithSourceCode(
    createMockSourceCode({ text: "/* @req REQ-IN-TEXT */" }),
  );

  const node = {
    // range is missing; helper should see non-array range and return false
    range: null,
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function fallbackTextBeforeHasReqReturnsFalseWhenRangeStartNotNumber() {
  const context = createContextWithSourceCode(
    createMockSourceCode({ text: "/* @req REQ-IN-TEXT-BUT-INVALID-RANGE */" }),
  );

  const node = {
    // First element of range is not a number; guard on numeric start index should trigger
    range: ["not-a-number", 10] as any,
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function fallbackTextBeforeHasReqReturnsTrueWhenTextWindowContainsReq() {
  const fullText = `
      // some header
      /** @req REQ-IN-TEXT-WINDOW */
      function foo() {}
    `;
  const context = createContextWithSourceCode(createMockSourceCode({ text: fullText }));

  // Choose a range that starts after the `@req` comment so the "text before"
  // window that the helper inspects includes the annotation.
  const startIndex = fullText.indexOf("function foo");
  const node = {
    range: [startIndex, startIndex + 5],
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function fallbackTextBeforeHasReqReturnsFalseWhenGetTextThrows() {
  const sourceCode = {
    getText: throwError.bind(null, "boom from getText"),
  } as any;
  const context = createContextWithSourceCode(sourceCode);

  const node = {
    range: [0, 10],
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function hasReqInAdvancedHeuristicsReturnsFalseWhenSourceCodeMissing() {
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
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function hasReqInAdvancedHeuristicsReturnsFalseWhenNodeMissing() {
  const context = createContextWithSourceCode(
    createMockSourceCode({ text: "@req REQ-SHOULD-NOT-BE-SEEN" }),
  );
  const has = _hasReqAnnotation(null as any, [], context, undefined as any);

  expect(has).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function hasReqAnnotationReturnsTrueWhenJsdocContainsSupports() {
  // Returning a sourceCode that will not satisfy any advanced heuristic
  // (no lines, no comments, empty text).
  const context = createContextWithSourceCode(createMockSourceCode({ lines: [], text: "" }));

  const jsdoc = {
    value: "/** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-SUPPORTS */",
  } as any;

  const node = {
    parent: {},
  } as any;

  const has = _hasReqAnnotation(jsdoc, [], context, node);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function fallsBackToJsdocWhenGetSourceCodeThrows() {
  const context = {
    getSourceCode: throwError.bind(null, "boom from getSourceCode"),
  } as any;

  const jsdoc = { value: "/** @req REQ-FROM-GETSOURCECODE */" } as any;

  const has = _hasReqAnnotation(jsdoc, [], context, { parent: {} } as any);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function linesBeforeHasReqReturnsTrueWhenPrecedingLinesContainReq() {
  const context = createContextWithSourceCode(
    createMockSourceCode({
      lines: [
        "// some header",
        "/** @req REQ-LINE-BEFORE */",
        "function foo() {}",
      ],
    }),
  );

  const node = {
    // Node starts on line 3 (1-based), so line 2 is inspected by linesBeforeHasReq
    loc: { start: { line: 3 } },
    parent: {},
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function parentChainHasReqReturnsTrueWhenLeadingCommentsContainSupports() {
  const context = createContextWithSourceCode({
    // Not a callable function; forces parentChainHasReq to rely on leadingComments
    getCommentsBefore: 42,
  } as any);

  const node = {
    parent: {
      leadingComments: [
        { value: "some other comment" },
        {
          value:
            "@supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FROM-LEADING-COMMENT",
        },
      ],
      parent: {},
    },
  } as any;

  const has = _hasReqAnnotation(null as any, [], context, node);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function returnsTrueWhenJsdocHasReqEvenIfContextUndefined() {
  const jsdoc = { value: "/** @req REQ-JSDOC-NO-CONTEXT */" } as any;

  const node = {
    parent: {},
  } as any;

  const has = _hasReqAnnotation(jsdoc, [], undefined as any, node);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function hasReqAnnotationReturnsTrueWhenAdvancedHeuristicsFindReqViaLinesBefore() {
  const context = createContextWithSourceCode(
    createMockSourceCode({
      lines: [
        "// header without req",
        "/** @req REQ-ADV-LINES */",
        "function bar() {}",
      ],
    }),
  );

  const node = {
    loc: { start: { line: 3 } },
    parent: {},
  } as any;

  const jsdoc = { value: "/** no req here */" } as any;
  const comments = [{ value: "no req or supports here" }];

  const has = _hasReqAnnotation(jsdoc as any, comments as any, context, node as any);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function hasReqAnnotationReturnsTrueWhenAdvancedHeuristicsFindReqViaParentChain() {
  const sourceCode = {
    getCommentsBefore: getCommentsBeforeForReqParent,
  } as any;

  const context = createContextWithSourceCode(sourceCode);
  const node = {
    parent: {
      isReqParent: true,
      parent: {},
    },
  } as any;

  const jsdoc = { value: "/** jsdoc without requirement */" } as any;
  const comments = [{ value: "comment without requirement" }];

  const has = _hasReqAnnotation(jsdoc as any, comments as any, context, node as any);

  expect(has).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQ-DETECTION
 */
function reqAnnotationDetectionSuite() {
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] returns false when sourceCode is missing",
    returnsFalseWhenSourceCodeMissing,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] returns false when node is missing",
    returnsFalseWhenNodeMissing,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] inspects jsdoc and comments when advanced heuristics throw",
    inspectsJsdocWhenAdvancedHeuristicsThrow,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] treats @supports in comments as satisfying requirement",
    treatsSupportsInCommentsAsSatisfyingRequirement,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when lines is not an array",
    linesBeforeHasReqReturnsFalseWhenLinesNotArray,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns false when startLine is not a number",
    linesBeforeHasReqReturnsFalseWhenStartLineNotNumber,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns false when getCommentsBefore is not a function and no leadingComments/parents have req",
    parentChainHasReqReturnsFalseWhenCommentsBeforeNotFunction,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns true when getCommentsBefore returns comments containing @req",
    parentChainHasReqReturnsTrueWhenGetCommentsBeforeContainsReq,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when getText is not a function",
    fallbackTextBeforeHasReqReturnsFalseWhenGetTextNotFunction,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when node.range is not an array",
    fallbackTextBeforeHasReqReturnsFalseWhenNodeRangeNotArray,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when range[0] is not a number",
    fallbackTextBeforeHasReqReturnsFalseWhenRangeStartNotNumber,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns true when text window contains @req",
    fallbackTextBeforeHasReqReturnsTrueWhenTextWindowContainsReq,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] fallbackTextBeforeHasReq returns false when getText throws",
    fallbackTextBeforeHasReqReturnsFalseWhenGetTextThrows,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] hasReqInAdvancedHeuristics short-circuits and returns false when sourceCode is missing",
    hasReqInAdvancedHeuristicsReturnsFalseWhenSourceCodeMissing,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] hasReqInAdvancedHeuristics short-circuits and returns false when node is missing",
    hasReqInAdvancedHeuristicsReturnsFalseWhenNodeMissing,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] hasReqAnnotation returns true when jsdoc contains @supports and advanced heuristics are false",
    hasReqAnnotationReturnsTrueWhenJsdocContainsSupports,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] falls back to jsdoc/comments when context.getSourceCode throws",
    fallsBackToJsdocWhenGetSourceCodeThrows,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] linesBeforeHasReq returns true when preceding lines contain @req marker",
    linesBeforeHasReqReturnsTrueWhenPrecedingLinesContainReq,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] parentChainHasReq returns true when leadingComments contain @supports and getCommentsBefore is unusable",
    parentChainHasReqReturnsTrueWhenLeadingCommentsContainSupports,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] returns true when jsdoc has @req even if context is undefined",
    returnsTrueWhenJsdocHasReqEvenIfContextUndefined,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] hasReqAnnotation returns true when advanced heuristics find req via linesBeforeHasReq",
    hasReqAnnotationReturnsTrueWhenAdvancedHeuristicsFindReqViaLinesBefore,
  );
  it(
    "[REQ-ANNOTATION-REQ-DETECTION] hasReqAnnotation returns true when advanced heuristics find req via parentChainHasReq",
    hasReqAnnotationReturnsTrueWhenAdvancedHeuristicsFindReqViaParentChain,
  );
}

describe(
  "reqAnnotationDetection advanced heuristics (Story 003.0-DEV-FUNCTION-ANNOTATIONS)",
  reqAnnotationDetectionSuite,
);