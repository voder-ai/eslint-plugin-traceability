/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Edge case tests for IO helpers (linesBeforeHasStory/fallbackTextBeforeHasStory/parentChainHasStory)
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */

import {
  linesBeforeHasStory,
  fallbackTextBeforeHasStory,
  parentChainHasStory,
} from "../../src/rules/helpers/require-story-io";
import { runFallbackTextBeforeHasStoryDetectsStoryTest } from "../utils/ioTestHelpers";

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function getTextNoStoryHere() {
  return "no story here";
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function getCommentsBeforeWithStory() {
  return [
    {
      type: "Block",
      value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
    },
  ];
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function getCommentsBeforeEmpty() {
  return [];
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function linesBeforeHasStoryReturnsFalseWhenSourceLinesOrNodeLocMissing() {
  const fakeSource: any = {};
  const node: any = { loc: null };
  expect(linesBeforeHasStory(fakeSource, node)).toBe(false);

  const fakeSource2: any = { lines: ["line1", "line2"] };
  const node2: any = { loc: { start: { line: 100 } } };
  expect(linesBeforeHasStory(fakeSource2, node2)).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function fallbackTextBeforeHasStoryReturnsFalseWhenGetTextMissingOrNodeRangeMissing() {
  const fakeSource: any = {};
  const node: any = { range: null };
  expect(fallbackTextBeforeHasStory(fakeSource, node)).toBe(false);

  const fakeSource2: any = { getText: getTextNoStoryHere };
  const node2: any = { range: [] };
  expect(fallbackTextBeforeHasStory(fakeSource2, node2)).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function fallbackTextBeforeHasStoryDetectsStoryInTextBeforeNodeRange() {
  runFallbackTextBeforeHasStoryDetectsStoryTest(fallbackTextBeforeHasStory);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function parentChainHasStoryReturnsTrueWhenAncestorCommentsContainStory() {
  const fakeSource: any = {
    getCommentsBefore: getCommentsBeforeWithStory,
  };
  const node: any = { parent: { parent: { type: "SomeParent" } } };
  expect(parentChainHasStory(fakeSource, node)).toBe(true);

  const fakeSource2: any = { getCommentsBefore: getCommentsBeforeEmpty };
  const node2: any = { parent: null };
  expect(parentChainHasStory(fakeSource2, node2)).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function requireStoryIoHelpersEdgecasesSuite() {
  test(
    "linesBeforeHasStory returns false when source.lines missing or node.loc missing",
    linesBeforeHasStoryReturnsFalseWhenSourceLinesOrNodeLocMissing,
  );

  test(
    "fallbackTextBeforeHasStory returns false when getText missing or node.range missing",
    fallbackTextBeforeHasStoryReturnsFalseWhenGetTextMissingOrNodeRangeMissing,
  );

  test(
    "fallbackTextBeforeHasStory detects @story in text before node.range",
    fallbackTextBeforeHasStoryDetectsStoryInTextBeforeNodeRange,
  );

  test(
    "parentChainHasStory returns true when ancestor comments contain @story",
    parentChainHasStoryReturnsTrueWhenAncestorCommentsContainStory,
  );
}

describe(
  "Require Story IO helpers - edge cases (Story 003.0)",
  requireStoryIoHelpersEdgecasesSuite,
);
