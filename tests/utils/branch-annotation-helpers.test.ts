/**
 * Unit tests for branch annotation helpers
 * Tests for: docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of branch types for annotation enforcement
 */
import { validateBranchTypes, DEFAULT_BRANCH_TYPES } from "../../src/utils/branch-annotation-helpers";
import type { Rule } from "eslint";

describe("validateBranchTypes helper", () => {
  let context: Partial<Rule.RuleContext> & { report: jest.Mock };

  beforeEach(() => {
    context = { options: [], report: jest.fn() };
  });

  it("should return default branch types when no options provided", () => {
    const result = validateBranchTypes(context as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(DEFAULT_BRANCH_TYPES);
  });

  it("should return custom branch types when valid options provided", () => {
    context.options = [{ branchTypes: ["IfStatement", "ForStatement"] }];
    const result = validateBranchTypes(context as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["IfStatement", "ForStatement"]);
  });

  it("should return listener when invalid branch types provided and report errors", () => {
    const invalid = ["UnknownType", "Foo"];
    context.options = [{ branchTypes: invalid }];
    // Invoke helper
    const result = validateBranchTypes(context as any);
    // Should return a listener object
    expect(typeof result).toBe("object");
    expect(result).toHaveProperty("Program");
    // Call the Program listener
    const fakeNode = {};
    (result as any).Program(fakeNode);
    // report should be called for each invalid type
    expect(context.report).toHaveBeenCalledTimes(invalid.length);
    invalid.forEach((t) => {
      expect(context.report).toHaveBeenCalledWith(expect.objectContaining({
        node: fakeNode,
        message: expect.stringContaining(`Value "${t}" should be equal to one of the allowed values:`),
      }));
    });
  });
});
