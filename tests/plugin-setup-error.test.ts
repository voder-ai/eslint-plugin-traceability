/**
 * Tests for: docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
 * @req REQ-ERROR-HANDLING - Gracefully handles plugin loading errors and missing dependencies
 */

describe("Traceability ESLint Plugin Error Handling (Story 001.0-DEV-PLUGIN-SETUP)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Mock a rule module to simulate load failure
    jest.mock("../src/rules/require-branch-annotation", () => {
      throw new Error("Test load error");
    });
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("[REQ-ERROR-HANDLING] should report error loading rule and provide placeholder rule", () => {
    const plugin = require("../src/index");
    // Expect console.error to have been called for the missing rule
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed to load rule "require-branch-annotation": Test load error'
      )
    );
    // Placeholder rule should exist
    const placeholderRule = plugin.rules["require-branch-annotation"];
    expect(placeholderRule).toBeDefined();
    // meta.docs.description should reflect load failure
    expect(
      placeholderRule.meta.docs.description
    ).toContain("Failed to load rule 'require-branch-annotation'");
    // Placeholder rule create should report an error message
    const fakeContext = { report: jest.fn() };
    const visitor = placeholderRule.create(fakeContext as any);
    visitor.Program({ type: "Program" });
    expect(fakeContext.report).toHaveBeenCalledWith({
      node: { type: "Program" },
      message: expect.stringContaining(
        'Error loading rule "require-branch-annotation": Test load error'
      ),
    });
  });
});
