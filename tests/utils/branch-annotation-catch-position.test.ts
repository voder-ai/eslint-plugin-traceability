 
/* eslint-disable traceability/require-traceability */

/**
 * Unit tests for CatchClause annotation gathering and insert position logic.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md
 * @supports docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION REQ-FALLBACK-LOGIC REQ-POSITION-PRIORITY REQ-PRETTIER-AUTOFIX
 */
import type { Rule } from "eslint";
import { gatherBranchCommentText } from "../../src/utils/branch-annotation-helpers";

function createMockSourceCode(options: {
  lines?: string[];
  commentsBefore?: Array<{ value: string }>;
  commentsInside?: Array<{ value: string }>;
}): ReturnType<Rule.RuleContext["getSourceCode"]> {
  const { lines = [], commentsBefore = [], commentsInside = [] } = options;

  return {
    lines,
    getCommentsBefore() {
      return commentsBefore;
    },
    getCommentsInside(node: any) {
      // exercise the code path that passes node.body into getCommentsInside
      if (node && node.type === "BlockStatement") {
        return commentsInside;
      }
      return [];
    },
  } as any;
}

describe("gatherBranchCommentText CatchClause behavior (Story 025.0-DEV-CATCH-ANNOTATION-POSITION)", () => {
  it("[REQ-DUAL-POSITION-DETECTION] prefers before-catch annotations when present", () => {
    const sourceCode = createMockSourceCode({
      commentsBefore: [
        { value: "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md" },
        { value: "@req REQ-BRANCH-DETECTION" },
      ],
      commentsInside: [
        { value: "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md" },
      ],
    });

    const node: any = {
      type: "CatchClause",
      loc: { start: { line: 5 } },
      body: { type: "BlockStatement" },
    };

    const text = gatherBranchCommentText(sourceCode, node);
    expect(text).toContain("@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md");
    expect(text).toContain("@req REQ-BRANCH-DETECTION");
  });

  it("[REQ-FALLBACK-LOGIC] falls back to inside-catch annotations when before-catch is missing", () => {
    const sourceCode = createMockSourceCode({
      commentsBefore: [],
      commentsInside: [
        { value: "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md" },
        { value: "@req REQ-CATCH-PATH" },
      ],
    });

    const node: any = {
      type: "CatchClause",
      loc: { start: { line: 10 } },
      body: { type: "BlockStatement" },
    };

    const text = gatherBranchCommentText(sourceCode, node);
    expect(text).toContain("@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md");
    expect(text).toContain("@req REQ-CATCH-PATH");
  });

  it("[REQ-FALLBACK-LOGIC] returns before-catch text when getCommentsInside is not available", () => {
    const lines = [
      "try {",
      "  doSomething();",
      "}",
      "catch (error) {",
      "  // body", 
      "}",
    ];

    const sourceCode: any = {
      lines,
      getCommentsBefore() {
        return [
          { value: "@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md" },
          { value: "@req REQ-BRANCH-DETECTION" },
        ];
      },
      // intentionally omit getCommentsInside so that the CatchClause path
      // falls back to the before-catch comments.
    };

    const node: any = {
      type: "CatchClause",
      loc: { start: { line: 4 } },
      body: { type: "BlockStatement" },
    };

    const text = gatherBranchCommentText(sourceCode, node);
    expect(text).toContain("@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md");
    expect(text).toContain("@req REQ-BRANCH-DETECTION");
  });

  it("[REQ-FALLBACK-LOGIC] collects inside-catch comments using line-based fallback when getCommentsInside is unavailable", () => {
    const lines = [
      "try {",
      "  doSomething();",
      "} catch (error) {",
      "  // @story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
      "  // @req REQ-CATCH-LINE-FALLBACK",
      "  handleError(error);",
      "}",
    ];

    const sourceCode: any = {
      lines,
      getCommentsBefore() {
        return [];
      },
    };

    const node: any = {
      type: "CatchClause",
      loc: { start: { line: 3 } },
      body: {
        type: "BlockStatement",
        loc: { start: { line: 3 }, end: { line: 7 } },
        body: [],
      },
    };

    const text = gatherBranchCommentText(sourceCode, node);
    expect(text).toContain(
      "@story docs/stories/025.0-DEV-CATCH-ANNOTATION-POSITION.story.md",
    );
    expect(text).toContain("@req REQ-CATCH-LINE-FALLBACK");
  });
});