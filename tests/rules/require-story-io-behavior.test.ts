/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-COVERAGE-IO - Additional tests to exercise uncovered branches in require-story-io.ts
 */

import {
  parentChainHasStory,
  fallbackTextBeforeHasStory,
} from "../../src/rules/helpers/require-story-io";

describe("Require Story IO helpers - additional behavior (Story 003.0)", () => {
  test("parentChainHasStory returns false when sourceCode.getCommentsBefore is not a function", () => {
    const fakeSource: any = {}; // no getCommentsBefore function
    const node: any = { parent: { parent: null } };
    expect(parentChainHasStory(fakeSource, node)).toBe(false);
  });

  test("parentChainHasStory returns false when getCommentsBefore returns comments but none contain @story", () => {
    const fakeSource: any = {
      getCommentsBefore: () => [{ value: 123 }, { value: "no story here" }],
    };
    const node: any = { parent: { leadingComments: [], parent: null } };
    expect(parentChainHasStory(fakeSource, node)).toBe(false);
  });

  test("parentChainHasStory returns true when ancestor leadingComments contain @story", () => {
    const fakeSource: any = { getCommentsBefore: () => [] };
    const node: any = {
      parent: {
        leadingComments: [
          {
            value:
              "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
          },
        ],
        parent: null,
      },
    };
    expect(parentChainHasStory(fakeSource, node)).toBe(true);
  });

  test("fallbackTextBeforeHasStory returns false when node.range[0] is not a number", () => {
    const fakeSource: any = { getText: () => "some text without story" };
    const node: any = { range: ["a", 10] } as any;
    expect(fallbackTextBeforeHasStory(fakeSource, node)).toBe(false);
  });

  test("fallbackTextBeforeHasStory detects @story in text before node.range", () => {
    const story = "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
    const pre = `/* ${story} */\n`;
    const rest = "function y() {}";
    const full = pre + rest;
    const fakeSource: any = { getText: () => full };
    const node: any = { range: [full.indexOf("function"), full.length] };
    expect(fallbackTextBeforeHasStory(fakeSource, node)).toBe(true);
  });
});
