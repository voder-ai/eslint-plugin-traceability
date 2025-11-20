/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Edge case tests for IO helpers (linesBeforeHasStory/fallbackTextBeforeHasStory/parentChainHasStory)
 */

import {
  linesBeforeHasStory,
  fallbackTextBeforeHasStory,
  parentChainHasStory,
} from "../../src/rules/helpers/require-story-io";

describe("Require Story IO helpers - edge cases (Story 003.0)", () => {
  test("linesBeforeHasStory returns false when source.lines missing or node.loc missing", () => {
    const fakeSource: any = {};
    const node: any = { loc: null };
    expect(linesBeforeHasStory(fakeSource, node)).toBe(false);

    const fakeSource2: any = { lines: ["line1", "line2"] };
    const node2: any = { loc: { start: { line: 100 } } };
    expect(linesBeforeHasStory(fakeSource2, node2)).toBe(false);
  });

  test("fallbackTextBeforeHasStory returns false when getText missing or node.range missing", () => {
    const fakeSource: any = {};
    const node: any = { range: null };
    expect(fallbackTextBeforeHasStory(fakeSource, node)).toBe(false);

    const fakeSource2: any = { getText: () => "no story here" };
    const node2: any = { range: [] };
    expect(fallbackTextBeforeHasStory(fakeSource2, node2)).toBe(false);
  });

  test("fallbackTextBeforeHasStory detects @story in text before node.range", () => {
    const story = "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
    const pre = `/* ${story} */\\n`;
    const rest = "function x() {}";
    const full = pre + rest;
    const fakeSource: any = { getText: () => full };
    const node: any = { range: [full.indexOf("function"), full.length] };
    expect(fallbackTextBeforeHasStory(fakeSource, node)).toBe(true);
  });

  test("parentChainHasStory returns true when ancestor comments contain @story", () => {
    const fakeSource: any = {
      getCommentsBefore: () => [
        { type: "Block", value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md" },
      ],
    };
    const node: any = { parent: { parent: { type: "SomeParent" } } };
    expect(parentChainHasStory(fakeSource, node)).toBe(true);

    const fakeSource2: any = { getCommentsBefore: () => [] };
    const node2: any = { parent: null };
    expect(parentChainHasStory(fakeSource2, node2)).toBe(false);
  });
});
