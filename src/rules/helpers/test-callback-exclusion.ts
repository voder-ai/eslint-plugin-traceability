/**
 * Shared helpers for determining whether a function-like node should be
 * treated as a test framework callback that may be excluded from
 * function-level annotation requirements.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/013-exclude-test-framework-callbacks.proposed.md
 * @req REQ-TEST-CALLBACK-EXCLUSION - Provide reusable test callback exclusion logic
 */
import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Options controlling how test callbacks are treated by the helpers.
 *
 * - excludeTestCallbacks: when false, no callbacks are excluded and all
 *   function-like nodes are treated as regular functions.
 * - additionalTestHelperNames: optional array of additional helper names that
 *   should be treated like built-in test functions when excludeTestCallbacks
 *   is enabled.
 */
interface CallbackExclusionOptions {
  excludeTestCallbacks?: boolean;
  additionalTestHelperNames?: string[];
  annotationPlacement?: "before" | "inside";
}

type TraceabilityNodeWithParent = TSESTree.Node & {
  parent?: TraceabilityNodeWithParent | null;
};

/**
 * Known test framework function names and variants.
 * Includes Jest, Mocha, Vitest and their focused/skipped/concurrent variants.
 *
 * @req REQ-TEST-CALLBACK-EXCLUSION
 */
const TEST_FUNCTION_NAMES = new Set([
  // Core test/describe-style functions (Jest, Mocha, Vitest share many of these)
  "it",
  "test",
  "describe",
  "suite",

  // Focused variants
  "fit",
  "ftest",
  "fdescribe",
  "fsuite",

  // Skipped variants
  "xit",
  "xtest",
  "xdescribe",
  "xsuite",

  // Additional common aliases
  "context",
  "specify",
  "before",
  "after",
  "beforeEach",
  "afterEach",
  "beforeAll",
  "afterAll",
]);

const TEST_FUNCTION_CONCURRENT_PROP = "concurrent";

/**
 * Determine if a function name should be treated as a recognized test helper,
 * including core test functions and any configured additional helper names.
 *
 * Vitest's `bench` is explicitly never treated as an excluded test callback,
 * even if it appears in additionalTestHelperNames, to preserve the story
 * requirement that bench callbacks always require annotations.
 *
 * @req REQ-TEST-CALLBACK-EXCLUSION
 */
function isRecognizedTestHelperName(
  name: string,
  options?: CallbackExclusionOptions,
): boolean {
  if (name === "bench") {
    return false;
  }

  if (TEST_FUNCTION_NAMES.has(name)) {
    return true;
  }

  if (
    options?.additionalTestHelperNames &&
    Array.isArray(options.additionalTestHelperNames)
  ) {
    return options.additionalTestHelperNames.includes(name);
  }

  return false;
}

/**
 * Determine whether a node represents a callback passed to a known test
 * framework function (Jest, Mocha, Vitest, etc).
 *
 * Supports:
 * - it(), test(), describe(), suite(), context(), specify()
 * - lifecycle hooks: before(), after(), beforeEach(), afterEach(), beforeAll(), afterAll()
 * - focused variants: fit(), ftest(), fdescribe(), fsuite()
 * - skipped variants and helpers: xit(), xtest(), xdescribe(), xsuite()
 * - their .concurrent variants (e.g., it.concurrent(), test.concurrent())
 *
 * @req REQ-TEST-CALLBACK-EXCLUSION
 */
function isTestFrameworkCallback(
  node: TraceabilityNodeWithParent | null | undefined,
  options?: CallbackExclusionOptions,
): boolean {
  if (options?.excludeTestCallbacks === false) {
    return false;
  }

  if (!node || node.type !== "ArrowFunctionExpression") {
    return false;
  }

  const parent = node.parent;
  if (!parent || parent.type !== "CallExpression") {
    return false;
  }

  const callExpressionParent = parent as TraceabilityNodeWithParent &
    TSESTree.CallExpression;
  const callee = callExpressionParent.callee;

  if (callee.type === "Identifier") {
    return isRecognizedTestHelperName(callee.name, options);
  }

  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property &&
    callee.property.type === "Identifier" &&
    callee.property.name === TEST_FUNCTION_CONCURRENT_PROP
  ) {
    const obj = callee.object;
    if (obj && obj.type === "Identifier") {
      return isRecognizedTestHelperName(obj.name, options);
    }
  }

  return false;
}

export type { CallbackExclusionOptions };
export { isTestFrameworkCallback };
