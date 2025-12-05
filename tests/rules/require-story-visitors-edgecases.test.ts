/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-VISITORS-BEHAVIOR - Behavior tests for visitors in require-story-visitors.ts
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-VISITORS-BEHAVIOR
 */

import { buildVisitors } from "../../src/rules/helpers/require-story-visitors";

const makeVisitors = () => {
  const fakeContext: any = { getFilename: () => "file.ts" };
  const fakeSource: any = { getText: () => "" };
  const options: any = { shouldProcessNode: () => true };
  return buildVisitors(fakeContext, fakeSource, options as any);
};

describe("Require Story Visitors - behavior (Story 003.0)", () => {
  test("build visitors returns handlers for FunctionDeclaration and ArrowFunctionExpression", () => {
    const visitors = makeVisitors();
    expect(typeof visitors.FunctionDeclaration).toBe("function");
    expect(typeof visitors.ArrowFunctionExpression).toBe("function");
  });

  test("FunctionDeclaration handler uses context.getFilename and doesn't throw when node lacks id", () => {
    const visitors = makeVisitors();
    const handler = (visitors as any).FunctionDeclaration;
    expect(() => handler({} as any)).not.toThrow();
  });
});
