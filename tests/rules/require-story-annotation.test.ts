/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-story-annotation rule enforces @story annotation on functions
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";

const ruleTester = new RuleTester();

describe("Require Story Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
  ruleTester.run("require-story-annotation", rule, {
    valid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with JSDoc @story annotation",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction foo() {}`,
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with line comment @story annotation",
        code: `// @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
function foo() {}`,
      },
    ],
    invalid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story annotation on function",
        code: `function bar() {}`,
        output: `/** @story <story-file>.story.md */\nfunction bar() {}`,
        errors: [{ messageId: "missingStory" }],
      },
    ],
  });
});