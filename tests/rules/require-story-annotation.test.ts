/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";

const ruleTester = new RuleTester();

describe("Require Story Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
  ruleTester.run("require-story-annotation", rule, {
    valid: [
      {
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction foo() {}`,
      },
    ],
    invalid: [
      {
        code: `function bar() {}`,
        errors: [{ messageId: "missingStory" }],
      },
    ],
  });
});
