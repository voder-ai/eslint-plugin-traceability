/**
 * Unit tests for else-if annotation gathering and position priority.
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md
 * @supports docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md REQ-DUAL-POSITION-DETECTION-ELSE-IF REQ-FALLBACK-LOGIC-ELSE-IF REQ-POSITION-PRIORITY-ELSE-IF REQ-SINGLE-LINE-ELSE-IF-SUPPORT
 */
import type { Rule } from "eslint";
import { gatherBranchCommentText } from "../../src/utils/branch-annotation-helpers";

function createMockSourceCode(options: {
  lines?: string[];
  commentsBefore?: Array<{ value: string }>;
}): ReturnType<Rule.RuleContext["getSourceCode"]> {
  const { lines = [], commentsBefore = [] } = options;

  return {
    lines,
    getCommentsBefore() {
      return commentsBefore;
    },
  } as any;
}

describe("gatherBranchCommentText else-if behavior (Story 026.0-DEV-ELSE-IF-ANNOTATION-POSITION)", () => {
  it("[REQ-DUAL-POSITION-DETECTION-ELSE-IF] detects annotations placed before the else-if keyword", () => {
    const sourceCode = createMockSourceCode({
      commentsBefore: [
        {
          value:
            "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
        },
        { value: "@req REQ-DUAL-POSITION-DETECTION-ELSE-IF" },
      ],
      // lines are unused in this case because we short-circuit on before-text annotations.
      lines: [],
    });

    const node: any = {
      type: "IfStatement",
      loc: { start: { line: 10 } },
    };

    const parent: any = {
      type: "IfStatement",
      alternate: node,
    };

    const text = gatherBranchCommentText(sourceCode, node, parent);

    expect(text).toContain(
      "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
    );
    expect(text).toContain("@req REQ-DUAL-POSITION-DETECTION-ELSE-IF");
  });

  it("[REQ-FALLBACK-LOGIC-ELSE-IF] falls back to annotations between condition and body when before-else-if comments lack annotations", () => {
    const lines = [
      "if (a) {",
      "  doA();",
      "} else if (b && c) {",
      "  // @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
      "  // @req REQ-FALLBACK-LOGIC-ELSE-IF",
      "  doB();",
      "}",
    ];

    const sourceCode = createMockSourceCode({
      commentsBefore: [{ value: "// some unrelated comment" }],
      lines,
    });

    const node: any = {
      type: "IfStatement",
      loc: { start: { line: 3 } },
      test: { loc: { end: { line: 3 } } },
      consequent: {
        type: "BlockStatement",
        loc: { start: { line: 6 } },
      },
    };

    const parent: any = {
      type: "IfStatement",
      alternate: node,
    };

    const text = gatherBranchCommentText(sourceCode, node, parent);

    expect(text).toContain(
      "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
    );
    expect(text).toContain("@req REQ-FALLBACK-LOGIC-ELSE-IF");
  });

  it("[REQ-POSITION-PRIORITY-ELSE-IF] prefers before-else-if annotations when both positions are present", () => {
    const lines = [
      "if (a) {",
      "  doA();",
      "} else if (b) {",
      "  // @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
      "  // @req REQ-POSITION-PRIORITY-ELSE-IF-BETWEEN",
      "  doB();",
      "}",
    ];

    const sourceCode = createMockSourceCode({
      commentsBefore: [
        {
          value:
            "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
        },
        { value: "@req REQ-POSITION-PRIORITY-ELSE-IF" },
      ],
      lines,
    });

    const node: any = {
      type: "IfStatement",
      loc: { start: { line: 3 } },
      test: { loc: { end: { line: 3 } } },
      consequent: {
        type: "BlockStatement",
        loc: { start: { line: 6 } },
      },
    };

    const parent: any = {
      type: "IfStatement",
      alternate: node,
    };

    const text = gatherBranchCommentText(sourceCode, node, parent);

    // The helper should use the before-else-if annotations and not need to
    // fall back to between-condition-and-body comments.
    expect(text).toContain(
      "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
    );
    expect(text).toContain("@req REQ-POSITION-PRIORITY-ELSE-IF");
    expect(text).not.toContain("REQ-POSITION-PRIORITY-ELSE-IF-BETWEEN");
  });

  it("[REQ-SINGLE-LINE-ELSE-IF-SUPPORT] detects annotations on single-line else-if without braces when placed before the else-if keyword", () => {
    const lines = [
      "let suggestion;",
      "// @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
      "// @req REQ-SINGLE-LINE-ELSE-IF-SUPPORT",
      "if (arg === \"--json\") suggestion = \"--format=json\";",
      "// @story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
      "// @req REQ-SINGLE-LINE-ELSE-IF-SUPPORT",
      "else if (arg.startsWith(\"--format\")) suggestion = \"--format\";",
    ];

    const sourceCode = createMockSourceCode({
      commentsBefore: [
        {
          value:
            "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
        },
        { value: "@req REQ-SINGLE-LINE-ELSE-IF-SUPPORT" },
      ],
      lines,
    });

    const node: any = {
      type: "IfStatement",
      loc: { start: { line: 7 } },
      test: { loc: { end: { line: 7 } } },
      consequent: {
        // single-line consequent without BlockStatement braces in the real-world source;
        // for this helper-level test we only care that loc values exist and are consistent.
        type: "ExpressionStatement",
        loc: { start: { line: 7 } },
      },
    };

    const parent: any = {
      type: "IfStatement",
      alternate: node,
    };

    const text = gatherBranchCommentText(sourceCode, node, parent);

    expect(text).toContain(
      "@story docs/stories/026.0-DEV-ELSE-IF-ANNOTATION-POSITION.story.md",
    );
    expect(text).toContain("@req REQ-SINGLE-LINE-ELSE-IF-SUPPORT");
  });
});