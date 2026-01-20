/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-CONFIGURABLE-SCOPE
 */

import {
  parentChainHasStory,
  fallbackTextBeforeHasStory,
} from "../../src/rules/helpers/require-story-io";
import { runFallbackTextBeforeHasStoryDetectsStoryTest } from "../utils/ioTestHelpers";

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function getCommentsBeforeEmpty() {
  return [];
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function getCommentsBeforeNoStory() {
  return [{ value: 123 }, { value: "no story here" }];
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function getTextSomeTextWithoutStory() {
  return "some text without story";
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function parentChainHasStoryReturnsFalseWhenGetCommentsBeforeMissingOrNotFunction() {
  const fakeSource: any = {}; // no getCommentsBefore function
  const node: any = { parent: { parent: null } };
  expect(parentChainHasStory(fakeSource, node)).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function parentChainHasStoryReturnsFalseWhenCommentsPresentButNoStory() {
  const fakeSource: any = {
    getCommentsBefore: getCommentsBeforeNoStory,
  };
  const node: any = { parent: { leadingComments: [], parent: null } };
  expect(parentChainHasStory(fakeSource, node)).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function parentChainHasStoryReturnsTrueWhenAncestorLeadingCommentsContainStory() {
  const fakeSource: any = { getCommentsBefore: getCommentsBeforeEmpty };
  const node: any = {
    parent: {
      leadingComments: [
        {
          value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
        },
      ],
      parent: null,
    },
  };
  expect(parentChainHasStory(fakeSource, node)).toBe(true);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function fallbackTextBeforeHasStoryReturnsFalseWhenNodeRangeStartIsNotNumber() {
  const fakeSource: any = { getText: getTextSomeTextWithoutStory };
  const node: any = { range: ["a", 10] } as any;
  expect(fallbackTextBeforeHasStory(fakeSource, node)).toBe(false);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function fallbackTextBeforeHasStoryDetectsStoryInTextBeforeNodeRange() {
  runFallbackTextBeforeHasStoryDetectsStoryTest(
    "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
    fallbackTextBeforeHasStory,
  );
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-CONFIGURABLE-SCOPE
 */
function requireStoryIoHelpersAdditionalBehaviorSuite() {
  test(
    "parentChainHasStory returns false when sourceCode.getCommentsBefore is not a function",
    parentChainHasStoryReturnsFalseWhenGetCommentsBeforeMissingOrNotFunction,
  );

  test(
    "parentChainHasStory returns false when getCommentsBefore returns comments but none contain @story",
    parentChainHasStoryReturnsFalseWhenCommentsPresentButNoStory,
  );

  test(
    "parentChainHasStory returns true when ancestor leadingComments contain @story",
    parentChainHasStoryReturnsTrueWhenAncestorLeadingCommentsContainStory,
  );

  test(
    "fallbackTextBeforeHasStory returns false when node.range[0] is not a number",
    fallbackTextBeforeHasStoryReturnsFalseWhenNodeRangeStartIsNotNumber,
  );

  test(
    "fallbackTextBeforeHasStory detects @story in text before node.range",
    fallbackTextBeforeHasStoryDetectsStoryInTextBeforeNodeRange,
  );
}

describe(
  "Require Story IO helpers - additional behavior (Story 003.0)",
  requireStoryIoHelpersAdditionalBehaviorSuite,
);
