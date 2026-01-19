/* eslint-disable traceability/valid-story-reference -- TODO test cases contain placeholder story paths */
/* eslint-disable traceability/require-traceability */

/**
 * Tests for: docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md
 * @story docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md
 * @req REQ-SCOPE-ANALYSIS - Verify that the rule understands scope coverage for branch and block annotations
 * @req REQ-DUPLICATION-DETECTION - Verify detection of duplicate annotations within the same scope
 * @req REQ-STATEMENT-SIGNIFICANCE - Verify that simple statements are treated as redundant when covered by scope
 * @req REQ-SAFE-REMOVAL - Verify that auto-fix removes only redundant annotations and preserves code
 * @req REQ-DIFFERENT-REQUIREMENTS - Verify that annotations with different requirement IDs are preserved
 * @req REQ-CATCH-BLOCK-HANDLING - Verify that catch block annotations are not incorrectly treated as redundant
 * @supports docs/stories/027.0-DEV-REDUNDANT-ANNOTATION-DETECTION.story.md REQ-SCOPE-ANALYSIS REQ-DUPLICATION-DETECTION REQ-STATEMENT-SIGNIFICANCE REQ-SAFE-REMOVAL REQ-DIFFERENT-REQUIREMENTS REQ-CATCH-BLOCK-HANDLING REQ-SCOPE-INHERITANCE REQ-CONFIGURABLE-STRICTNESS
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/no-redundant-annotation";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

const runRule = (tests: Parameters<typeof ruleTester.run>[2]) =>
  ruleTester.run("no-redundant-annotation", rule, tests);

describe("no-redundant-annotation rule (Story 027.0-DEV-REDUNDANT-ANNOTATION-DETECTION)", () => {
  runRule({
    valid: [
      {
        name: "[REQ-DIFFERENT-REQUIREMENTS] preserves child annotation with different requirement ID",
        code: `function example() {\n  // @story docs/stories/002.0-EXAMPLE.story.md\n  // @req REQ-EXAMPLE-PARENT\n  if (flag) {\n    // @story docs/stories/002.0-EXAMPLE.story.md\n    // @req REQ-EXAMPLE-CHILD\n    doWork();\n  }\n}`,
      },
      {
        name: "[REQ-STATEMENT-SIGNIFICANCE] preserves annotation on complex nested branch",
        code: `function example() {\n  // @story docs/stories/006.0-EXAMPLE.story.md\n  // @req REQ-OUTER-CHECK\n  if (enabled) {\n    // @story docs/stories/006.0-EXAMPLE.story.md\n    // @req REQ-INNER-VALIDATION\n    if (validate) {\n      validate(data);\n    }\n  }\n}`,
      },
      {
        name: "[REQ-SCOPE-ANALYSIS] preserves non-redundant mixed @supports/@req pairs when only partially covered by scope",
        code: `function example() {\n  /**\n   * @story docs/stories/010.0-EXAMPLE.story.md\n   * @req REQ-FN-LEVEL\n   * @supports REQ-SHARED\n   */\n  if (flag) {\n    // @story docs/stories/010.0-EXAMPLE.story.md\n    // @req REQ-BRANCH-SPECIFIC\n    // @supports REQ-SHARED\n    doThing();\n  }\n}`,
      },
      {
        name: "[REQ-SCOPE-ANALYSIS] preserves annotations on both branch and statement when they intentionally duplicate each other",
        code: `function example() {\n  if (condition) { // @story docs/stories/007.0-EXAMPLE.story.md @req REQ-BRANCH\n    // @story docs/stories/007.0-EXAMPLE.story.md\n    // @req REQ-BRANCH\n    doBranchWork();\n  }\n}`,
      },
      {
        name: "[REQ-CATCH-BLOCK-HANDLING] preserves catch block annotation from issue #6 scenario",
        code: `async function example() {\n  try {\n    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md\n    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY\n    if (isSafeVersion({ version, vulnerabilityData })) {\n      return version;\n    }\n\n    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md\n    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY\n    if (!vulnerabilityData.isVulnerable) {\n      return version;\n    }\n  } catch (error) {\n    // @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md\n    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY\n    return null;\n  }\n}`,
      },
      {
        name: "[REQ-CATCH-BLOCK-HANDLING] preserves annotations in nested catch blocks with repeated requirements",
        code: `async function nestedCatches() {\n  try {\n    await checkPrimary();\n  } catch (outerError) {\n    // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY\n    try {\n      await attemptRecovery(outerError);\n    } catch (innerError) {\n      // @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-SAFE-ONLY\n      await reportFailure(innerError);\n    }\n  }\n}`,
      },
    ],
    invalid: [
      {
        name: "[REQ-SCOPE-ANALYSIS][REQ-STATEMENT-SIGNIFICANCE] flags redundant annotation on simple return inside annotated if",
        code: `function example() {
  // @story docs/stories/004.0-EXAMPLE.story.md
  // @req REQ-PROCESS
  if (condition) {
    /* @story docs/stories/004.0-EXAMPLE.story.md\n     * @req REQ-PROCESS
     */
    return value;
  }
}`,
        output: `function example() {
  // @story docs/stories/004.0-EXAMPLE.story.md
  // @req REQ-PROCESS
  if (condition) {
    return value;
  }
}`,
        errors: [
          {
            messageId: "redundantAnnotation",
          },
        ],
      },
      {
        name: "[REQ-DUPLICATION-DETECTION] flags redundant annotations on sequential simple statements in same scope",
        code: `// @story docs/stories/003.0-EXAMPLE.story.md\n// @req REQ-INIT\nfunction init() {\n  // @story docs/stories/003.0-EXAMPLE.story.md\n  // @req REQ-INIT\n  const config = loadConfig();\n  const validator = new Validator(config);\n}`,
        output: `// @story docs/stories/003.0-EXAMPLE.story.md\n// @req REQ-INIT\nfunction init() {\n  const config = loadConfig();\n  const validator = new Validator(config);\n}`,
        errors: [{ messageId: "redundantAnnotation" }],
      },
      {
        name: "[REQ-SAFE-REMOVAL] removes full-line redundant comment without touching code on same line above",
        code: `function example() {\n  const keep = 1;\n  // @story docs/stories/003.0-EXAMPLE.story.md\n  // @req REQ-INIT\n  if (flag) {\n    // @story docs/stories/003.0-EXAMPLE.story.md\n    // @req REQ-INIT\n    const value = 1;\n  }\n}`,
        output: `function example() {\n  const keep = 1;\n  // @story docs/stories/003.0-EXAMPLE.story.md\n  // @req REQ-INIT\n  if (flag) {\n    const value = 1;\n  }\n}`,
        errors: [{ messageId: "redundantAnnotation" }],
      },
      {
        name: "[REQ-SCOPE-INHERITANCE] flags redundant statement annotation when scopePairs come from parent function JSDoc",
        code: `/**\n * @story docs/stories/008.0-EXAMPLE.story.md\n * @req REQ-FUNC\n */\nfunction example() {\n  // @story docs/stories/008.0-EXAMPLE.story.md\n  // @req REQ-FUNC\n  const result = compute();\n}`,
        output: `/**\n * @story docs/stories/008.0-EXAMPLE.story.md\n * @req REQ-FUNC\n */\nfunction example() {\n  const result = compute();\n}`,
        errors: [{ messageId: "redundantAnnotation" }],
      },
      {
        name: "[REQ-SCOPE-ANALYSIS][REQ-DUPLICATION-DETECTION] flags redundant statement with multiple fully-covered @supports pairs",
        code: `/**\n * @story docs/stories/009.0-EXAMPLE.story.md\n * @supports REQ-SUP-A, REQ-SUP-B\n */\nfunction example() {\n  // @story docs/stories/009.0-EXAMPLE.story.md\n  // @supports REQ-SUP-A, REQ-SUP-B\n  const supported = checkSupport();\n}`,
        output: `/**\n * @story docs/stories/009.0-EXAMPLE.story.md\n * @supports REQ-SUP-A, REQ-SUP-B\n */\nfunction example() {\n  const supported = checkSupport();\n}`,
        errors: [{ messageId: "redundantAnnotation" }],
      },
      {
        name: "[REQ-SCOPE-ANALYSIS][REQ-STATEMENT-SIGNIFICANCE] flags redundant annotation in finally block that repeats try-path coverage",
        code: `async function example() {\n  // @supports docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION\n  try {\n    await doWork();\n  } finally {\n    // @supports docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION\n    await cleanUp();\n  }\n}`,
        output: `async function example() {\n  // @supports docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION\n  try {\n    await doWork();\n  } finally {\n    await cleanUp();\n  }\n}`,
        errors: [{ messageId: "redundantAnnotation" }],
      },
      // TODO: rule implementation exists; full invalid-case behavior tests pending refinement
      // {
      //   name: "[REQ-SCOPE-ANALYSIS][REQ-STATEMENT-SIGNIFICANCE] flags redundant annotation on simple return inside annotated if",
      //   code: `function example() {\n  // @story docs/stories/004.0-EXAMPLE.story.md\n  // @req REQ-PROCESS\n  if (condition) {\n    // @req REQ-PROCESS\n    return value;\n  }\n}`,
      //   output: `function example() {\n  // @story docs/stories/004.0-EXAMPLE.story.md\n  // @req REQ-PROCESS\n  if (condition) {\n    return value;\n  }\n}`,
      //   errors: [
      //     {
      //       messageId: "redundantAnnotation",
      //     },
      //   ],
      // },
      // {
      //   name: "[REQ-DUPLICATION-DETECTION] flags redundant annotations on sequential simple statements in same scope",
      //   code: `// @story docs/stories/003.0-EXAMPLE.story.md\n// @req REQ-INIT\nfunction init() {\n  // @req REQ-INIT\n  const config = loadConfig();\n  const validator = new Validator(config);\n}`,
      //   output: `// @story docs/stories/003.0-EXAMPLE.story.md\n// @req REQ-INIT\nfunction init() {\n  const config = loadConfig();\n  const validator = new Validator(config);\n}`,
      //   errors: [
      //     { messageId: "redundantAnnotation" },
      //   ],
      // },
      // {
      //   name: "[REQ-SAFE-REMOVAL] removes full-line redundant comment without touching code on same line above",
      //   code: `function example() {\n  const keep = 1;\n  // @story docs/stories/003.0-EXAMPLE.story.md\n  // @req REQ-INIT\n  if (flag) {\n    // @req REQ-INIT\n    const value = 1;\n  }\n}`,
      //   output: `function example() {\n  const keep = 1;\n  // @story docs/stories/003.0-EXAMPLE.story.md\n  // @req REQ-INIT\n  if (flag) {\n    const value = 1;\n  }\n}`,
      //   errors: [
      //     { messageId: "redundantAnnotation" },
      //   ],
      // },
    ],
  });

  runRule({
    valid: [
      {
        name: "[REQ-CONFIGURABLE-STRICTNESS] permissive mode does not flag expression statements as redundant",
        options: [{ strictness: "permissive" }],
        code: `function example() {\n  // @story docs/stories/004.0-EXAMPLE.story.md\n  // @req REQ-PROCESS\n  if (condition) {\n    // @story docs/stories/004.0-EXAMPLE.story.md\n    // @req REQ-PROCESS\n    doSomething();\n  }\n}`,
      },
      {
        name: "[REQ-CONFIGURABLE-STRICTNESS] allowEmphasisDuplication skips single covered pair",
        options: [{ allowEmphasisDuplication: true }],
        code: `function example() {\n  // @story docs/stories/004.0-EXAMPLE.story.md\n  // @req REQ-PROCESS\n  if (condition) {\n    // @story docs/stories/004.0-EXAMPLE.story.md\n    // @req REQ-PROCESS\n    return value;\n  }\n}`,
      },
      {
        name: "[REQ-SCOPE-INHERITANCE] maxScopeDepth=1 does not treat grandparent function annotations as covering nested block",
        options: [{ maxScopeDepth: 1 }],
        code: `/**\n * @story docs/stories/004.0-EXAMPLE.story.md\n * @req REQ-PROCESS\n */\nfunction example() {\n  if (outer) {\n    {\n      // @story docs/stories/004.0-EXAMPLE.story.md\n      // @req REQ-PROCESS\n      const value = compute();\n    }\n  }\n}`,
      },
    ],
    invalid: [
      {
        name: "[REQ-SCOPE-INHERITANCE] maxScopeDepth>1 treats function-level annotations as covering nested block statements",
        options: [{ maxScopeDepth: 4 }],
        code: `/**\n * @story docs/stories/004.0-EXAMPLE.story.md\n * @req REQ-PROCESS\n */\nfunction example() {\n  if (outer) {\n    {\n      // @story docs/stories/004.0-EXAMPLE.story.md\n      // @req REQ-PROCESS\n      const value = compute();\n    }\n  }\n}`,
        output: `/**\n * @story docs/stories/004.0-EXAMPLE.story.md\n * @req REQ-PROCESS\n */\nfunction example() {\n  if (outer) {\n    {\n      const value = compute();\n    }\n  }\n}`,
        errors: [{ messageId: "redundantAnnotation" }],
      },
    ],
  });
});
