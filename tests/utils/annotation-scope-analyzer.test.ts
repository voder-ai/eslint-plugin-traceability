/**
 * Unit tests for annotation-scope-analyzer utilities
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION REQ-STATEMENT-SIGNIFICANCE REQ-SAFE-REMOVAL
 */
import type { Rule } from "eslint";
import {
  toStoryReqKey,
  extractStoryReqPairsFromText,
  extractStoryReqPairsFromComments,
  arePairsFullyCovered,
  isStatementEligibleForRedundancy,
  getCommentRemovalRange,
  type RedundancyRuleOptions,
} from "../../src/utils/annotation-scope-analyzer";

describe("annotation-scope-analyzer helpers (Story 027.0-DEV-REDUNDANT-ANNOTATION-DETECTION)", () => {
  it("[REQ-DUPLICATION-DETECTION] builds stable story/req keys", () => {
    const key = toStoryReqKey("docs/stories/001.story.md", "REQ-ONE");
    expect(key).toBe("docs/stories/001.story.md|REQ-ONE");
  });

  it("[REQ-DUPLICATION-DETECTION] extracts pairs from @story/@req sequences", () => {
    const text = `// @story docs/stories/001.story.md\n// @req REQ-ONE`;
    const pairs = extractStoryReqPairsFromText(text);
    expect(Array.from(pairs)).toEqual([
      "docs/stories/001.story.md|REQ-ONE",
    ]);
  });

  it("[REQ-SCOPE-ANALYSIS] extracts pairs from @supports lines", () => {
    const text = `// @supports docs/stories/002.story.md REQ-A REQ-B OTHER`;
    const pairs = extractStoryReqPairsFromText(text);
    expect(pairs.has("docs/stories/002.story.md|REQ-A")).toBe(true);
    expect(pairs.has("docs/stories/002.story.md|REQ-B")).toBe(true);
  });

  it("[REQ-DUPLICATION-DETECTION] aggregates pairs across comments", () => {
    const comments = [
      { value: "// @story docs/stories/001.story.md\n// @req REQ-ONE" },
      { value: "// @supports docs/stories/002.story.md REQ-TWO" },
    ];
    const pairs = extractStoryReqPairsFromComments(comments);
    expect(pairs.size).toBe(2);
  });

  it("[REQ-DUPLICATION-DETECTION] determines full coverage correctly", () => {
    const parent = new Set([
      "story|REQ-ONE",
      "story|REQ-TWO",
    ]);
    const childCovered = new Set(["story|REQ-ONE"]);
    const childNotCovered = new Set(["story|REQ-THREE"]);

    expect(arePairsFullyCovered(childCovered, parent)).toBe(true);
    expect(arePairsFullyCovered(childNotCovered, parent)).toBe(false);
  });

  it("[REQ-STATEMENT-SIGNIFICANCE] respects alwaysCovered and strictness levels", () => {
    const base: RedundancyRuleOptions = {
      strictness: "moderate",
      allowEmphasisDuplication: false,
      maxScopeDepth: 3,
      alwaysCovered: ["ReturnStatement"],
    };
    const branchTypes = ["IfStatement"];

    expect(
      isStatementEligibleForRedundancy(
        { type: "ReturnStatement" },
        base,
        branchTypes,
      ),
    ).toBe(true);
    expect(
      isStatementEligibleForRedundancy(
        { type: "ExpressionStatement" },
        base,
        branchTypes,
      ),
    ).toBe(true);
    expect(
      isStatementEligibleForRedundancy(
        { type: "IfStatement" },
        base,
        branchTypes,
      ),
    ).toBe(false);
  });

  it("[REQ-SAFE-REMOVAL] computes removal range for full-line comment", () => {
    const source = `const x = 1;\n// @story docs/stories/001.story.md\nconst y = 2;\n`;
    const sourceCode = {
      getText() {
        return source;
      },
    } as unknown as ReturnType<Rule.RuleContext["getSourceCode"]>;

    const start = source.indexOf("// @story");
    const end = start + "// @story docs/stories/001.story.md".length;
    const comment = { range: [start, end] };

    const [removalStart, removalEnd] = getCommentRemovalRange(comment, sourceCode);
    const removed =
      source.slice(0, removalStart) + source.slice(removalEnd);

    expect(removed).toBe("const x = 1;\nconst y = 2;\n");
  });

  it("[REQ-SAFE-REMOVAL] returns [0, 0] for comments with invalid range length (EXPECTS EXPECTED_RANGE_LENGTH usage)", () => {
    const source = "const x = 1;";
    const sourceCode = {
      getText() {
        return source;
      },
    } as unknown as ReturnType<Rule.RuleContext["getSourceCode"]>;

    const comment = { range: [0] as unknown as [number, number] };

    const range = getCommentRemovalRange(comment, sourceCode);
    expect(range).toEqual([0, 0]);
  });
});