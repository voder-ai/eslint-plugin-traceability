/**
 * Shared IO helper tests for require-story-io behavior.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING REQ-ANNOTATION-REQUIRED
 */
export function runFallbackTextBeforeHasStoryDetectsStoryTest(
  storyAnnotationOrFallbackFn:
    | string
    | ((_source: any, _node: any) => boolean) = "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
  maybeFallbackFn?: (_source: any, _node: any) => boolean,
): void {
  const isFirstArgFn = typeof storyAnnotationOrFallbackFn === "function";

  const storyAnnotation = isFirstArgFn
    ? "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"
    : storyAnnotationOrFallbackFn;

  const fallbackFn = isFirstArgFn
    ? (storyAnnotationOrFallbackFn as (_source: any, _node: any) => boolean)
    : maybeFallbackFn!;

  const pre = `/* ${storyAnnotation} */\n`;
  const rest = "function y() {}";
  const full = pre + rest;
  const fakeSource: any = { getText: () => full };
  const node: any = { range: [full.indexOf("function"), full.length] };
  expect(fallbackFn(fakeSource, node)).toBe(true);
}