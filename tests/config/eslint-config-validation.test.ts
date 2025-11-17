import validStoryReference from '../../src/rules/valid-story-reference';

/** @story docs/stories/002.0-DEV-ESLINT-CONFIG.story.md */
describe('ESLint Configuration Setup (Story 002.0-DEV-ESLINT-CONFIG)', () => {
  it('[REQ-RULE-OPTIONS] rule meta.schema defines expected properties', () => {
    const schema = ((validStoryReference.meta as any).schema as any)[0];
    expect(schema.properties).toHaveProperty('storyDirectories');
    expect(schema.properties).toHaveProperty('allowAbsolutePaths');
    expect(schema.properties).toHaveProperty('requireStoryExtension');
  });

  it('[REQ-CONFIG-VALIDATION] schema disallows unknown options', () => {
    const schema = ((validStoryReference.meta as any).schema as any)[0];
    expect(schema.additionalProperties).toBe(false);
  });
});