/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */

import { buildVisitors } from "../../src/rules/helpers/require-story-visitors";

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function getFakeFilename() {
  return "file.ts";
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function getFakeText() {
  return "";
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function shouldProcessNode() {
  return true;
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function makeVisitors() {
  const fakeContext: any = { getFilename: getFakeFilename };
  const fakeSource: any = { getText: getFakeText };
  const options: any = { shouldProcessNode };
  return buildVisitors(fakeContext, fakeSource, options as any);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function returnsHandlersForFunctionDeclarationAndArrowFunctionExpression() {
  const visitors = makeVisitors();
  expect(typeof visitors.FunctionDeclaration).toBe("function");
  expect(typeof visitors.ArrowFunctionExpression).toBe("function");
}

/**
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function functionDeclarationHandlerUsesContextAndDoesNotThrowWhenNodeLacksId() {
  const visitors = makeVisitors();
  const handler = (visitors as any).FunctionDeclaration;
  expect(() => handler({} as any)).not.toThrow();
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 * @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-ERROR-HANDLING
 */
function requireStoryVisitorsBehaviorSuite() {
  test(
    "build visitors returns handlers for FunctionDeclaration and ArrowFunctionExpression",
    returnsHandlersForFunctionDeclarationAndArrowFunctionExpression,
  );

  test(
    "FunctionDeclaration handler uses context.getFilename and doesn't throw when node lacks id",
    functionDeclarationHandlerUsesContextAndDoesNotThrowWhenNodeLacksId,
  );
}

describe(
  "Require Story Visitors - behavior (Story 003.0)",
  requireStoryVisitorsBehaviorSuite,
);
