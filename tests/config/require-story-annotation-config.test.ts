import requireStoryAnnotation from "../../src/rules/require-story-annotation";

/** @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md */
describe("ESLint Configuration Rule Options (Story 002.0-DEV-ESLINT-CONFIG)", () => {
  it("[REQ-RULE-OPTIONS] require-story-annotation schema defines expected properties", () => {
    const schema = ((requireStoryAnnotation.meta as any).schema as any)[0];
    expect(schema.properties).toHaveProperty("scope");
    expect(schema.properties).toHaveProperty("exportPriority");
    expect(schema.additionalProperties).toBe(false);
  });
});
