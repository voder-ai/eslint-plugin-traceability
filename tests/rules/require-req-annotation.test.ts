/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-req-annotation rule enforces @req on functions
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-req-annotation";

const ruleTester = new RuleTester();

describe("Require Req Annotation Rule", () => {
  ruleTester.run("require-req-annotation", rule, {
    valid: [
      {
        code: `/**\n * @req REQ-EXAMPLE\n */\nfunction foo() {}`,
      },
      {
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-EXAMPLE\n */\nfunction bar() {}`,
      },
    ],
    invalid: [
      {
        code: `function baz() {}`,
        errors: [{ messageId: "missingReq" }],
      },
      {
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction qux() {}`,
        errors: [{ messageId: "missingReq" }],
      },
    ],
  });
});
