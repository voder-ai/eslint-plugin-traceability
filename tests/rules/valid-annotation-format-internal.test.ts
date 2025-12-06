/**
 * Tests for: docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md
 * @story docs/stories/024.0-DEV-IGNORE-INLINE-CODE-REFS.story.md
 * @req REQ-IGNORE-INLINE-CODE - Strip backtick-wrapped content before annotation detection
 * @req REQ-PRESERVE-BOUNDARIES - Replace backtick-wrapped content with spaces to preserve word boundaries
 * @req REQ-CENTRALIZED-FILTER - Apply backtick filtering in normalizeCommentLine for all rules
 */

import { describe, expect, it } from "@jest/globals";
import { normalizeCommentLine } from "../../src/rules/helpers/valid-annotation-format-internal";

describe("normalizeCommentLine inline code filtering (Story 024.0-DEV-IGNORE-INLINE-CODE-REFS)", () => {
  it("[REQ-IGNORE-INLINE-CODE] ignores backtick-wrapped @story in line without real annotations", () => {
    const raw = "This rule uses `@story` and other tags";
    const normalized = normalizeCommentLine(raw);
    expect(normalized).toBe("This rule uses          and other tags");
    expect(normalized).not.toMatch(/@story|@req|@supports/);
  });

  it("[REQ-IGNORE-INLINE-CODE] ignores backtick-wrapped @req in line without real annotations", () => {
    const raw = "Legacy pattern `@req` should not be treated as annotation";
    const normalized = normalizeCommentLine(raw);
    expect(normalized).toBe(
      "Legacy pattern        should not be treated as annotation",
    );
    expect(normalized).not.toMatch(/@story|@req|@supports/);
  });

  it("[REQ-IGNORE-INLINE-CODE][REQ-PRESERVE-BOUNDARIES] preserves spacing when removing backtick segments", () => {
    const raw = "`@story` + `@req` docs";
    const normalized = normalizeCommentLine(raw);
    expect(normalized).toBe("         +        docs");
    expect(normalized).not.toMatch(/@story|@req|@supports/);
  });

  it("[REQ-IGNORE-INLINE-CODE] still detects real @story annotation outside backticks", () => {
    const raw =
      "using `@supports` and real @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md";
    const normalized = normalizeCommentLine(raw);
    expect(normalized).toBe(
      "@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md",
    );
  });

  it("[REQ-IGNORE-INLINE-CODE][REQ-PRESERVE-BOUNDARIES] handles multiple backtick segments on one line", () => {
    const raw = "first `@story` and second `@req` markers";
    const normalized = normalizeCommentLine(raw);
    expect(normalized).toBe("first          and second        markers");
    expect(normalized).not.toMatch(/@story|@req|@supports/);
  });

  it("[REQ-IGNORE-INLINE-CODE] leaves lines without backticks unchanged apart from existing normalization", () => {
    const raw =
      " * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md";
    const normalized = normalizeCommentLine(raw);
    expect(normalized).toBe(
      "@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md",
    );
  });
});
