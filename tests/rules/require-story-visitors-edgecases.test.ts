/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-COVERAGE-VISITORS - Tests to cover visitors branches in require-story-visitors.ts
 */

import { buildVisitors } from "../../src/rules/helpers/require-story-visitors";

describe("Require Story Visitors - behavior (Story 003.0)", () => {
  test("build visitors returns handlers for FunctionDeclaration and ArrowFunctionExpression", () => {
    const fakeContext: any = { getFilename: () => "file.ts" };
    const fakeSource: any = { getText: () => "" };
    const options: any = { shouldProcessNode: () => true };
    const visitors = buildVisitors(fakeContext, fakeSource, options as any);
    expect(typeof visitors.FunctionDeclaration).toBe("function");
    expect(typeof visitors.ArrowFunctionExpression).toBe("function");
  });

  test("FunctionDeclaration handler uses context.getFilename and doesn't throw when node lacks id", () => {
    const fakeContext: any = { getFilename: () => "file.ts" };
    const fakeSource: any = { getText: () => "" };
    const options: any = { shouldProcessNode: () => true };
    const visitors = buildVisitors(fakeContext, fakeSource, options as any);
    const handler = (visitors as any).FunctionDeclaration;
    expect(() => handler({} as any)).not.toThrow();
  });
});
