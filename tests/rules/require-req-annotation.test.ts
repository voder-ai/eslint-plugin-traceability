/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-req-annotation rule enforces @req on functions
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-req-annotation";

const ruleTester = new RuleTester();

describe("Require Req Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
  ruleTester.run("require-req-annotation", rule, {
    valid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with only @req annotation",
        code: `/**\n * @req REQ-EXAMPLE\n */\nfunction foo() {}`,
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with @story and @req annotations",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-EXAMPLE\n */\nfunction bar() {}`,
      },
    ],
    invalid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @req on function without JSDoc",
        code: `function baz() {}`,
        output: `/** @req <REQ-ID> */\nfunction baz() {}`,
        errors: [{ messageId: "missingReq" }],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @req on function with only @story annotation",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction qux() {}`,
        output: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n/** @req <REQ-ID> */\nfunction qux() {}`,
        errors: [{ messageId: "missingReq" }],
      },
    ],
  });
});
