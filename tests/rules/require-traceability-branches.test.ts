/**
 * Unit tests for require-traceability rule edge cases and branch coverage
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-UNIFIED-ALIAS-ENGINE
 */

import { RuleTester } from "eslint";
import rule from "../../src/rules/require-traceability";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

/**
 * @supports docs/stories/010.4-DEV-UNIFIED-FUNCTION-RULE-AND-ALIASES.story.md REQ-UNIFIED-ALIAS-ENGINE
 */
ruleTester.run("require-traceability basic", rule, {
  valid: [
    {
      name: "function with both annotations",
      code: `/**
 * @story docs/stories/test.story.md
 * @req REQ-TEST-001
 */
function validFunc() {}`,
    },
    {
      name: "function with empty options",
      code: `/**
 * @story docs/stories/test.story.md
 * @req REQ-TEST-001
 */
function validFunc() {}`,
      options: [{}],
    },
    {
      name: "exported function with exportPriority=exported",
      code: `function validFunc() {}

/**
 * @story docs/stories/test.story.md
 * @req REQ-TEST-001
 */
export function exported() {
  return true;
}`,
      options: [{ exportPriority: "exported" }],
    },
    {
      name: "inside annotation placement",
      code: `function validFunc() {
  // @story docs/stories/test.story.md
  // @req REQ-TEST-001
  return true;
}`,
      options: [{ annotationPlacement: "inside" }],
    },
    {
      name: "scope limited to FunctionDeclaration",
      code: `/**
 * @story docs/stories/test.story.md
 * @req REQ-TEST-001
 */
function validFunc() {}

const arrow = () => {};`,
      options: [{ scope: ["FunctionDeclaration"] }],
    },
    {
      name: "excludeTestCallbacks enabled",
      code: `describe('test', () => {});`,
      options: [{ excludeTestCallbacks: true }],
    },
  ],
  invalid: [
    {
      name: "function with only story annotation",
      code: `/**
 * @story docs/stories/test.story.md
 */
function missingReq() {}`,
      errors: 1,
    },
    {
      name: "function with only requirement annotation",
      code: `/**
 * @req REQ-TEST-001
 */
function missingStory() {}`,
      output: `/**
 * @req REQ-TEST-001
 */
/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function missingStory() {}`,
      errors: 1,
    },
    {
      name: "function with no annotations",
      code: `function noAnnotations() {}`,
      output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
function noAnnotations() {}`,
      errors: 2, // Both story and req are missing
    },
    {
      name: "function with no annotations and autoFix disabled",
      code: `function noAnnotations() {}`,
      options: [{ autoFix: false }],
      errors: 2,
    },
  ],
});
