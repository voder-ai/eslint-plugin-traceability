/**
 * Tests for: docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION - Verify require-branch-annotation rule enforces branch annotations
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-branch-annotation";

const ruleTester = new RuleTester({
  languageOptions: { parserOptions: { ecmaVersion: 2020 } },
} as any);

describe("Require Branch Annotation Rule", () => {
  ruleTester.run("require-branch-annotation", rule, {
    valid: [
      {
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (condition) {}`,
      },
      {
        code: `/* @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md */
/* @req REQ-BRANCH-DETECTION */
for (let i = 0; i < 10; i++) {}`,
      },
    ],
    invalid: [
      {
        code: `if (condition) {}`,
        errors: [
          { messageId: "missingAnnotation", data: { missing: "@story" } },
          { messageId: "missingAnnotation", data: { missing: "@req" } },
        ],
      },
      {
        code: `// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
for (let i = 0; i < 5; i++) {}`,
        errors: [{ messageId: "missingAnnotation", data: { missing: "@req" } }],
      },
      {
        code: `// @req REQ-BRANCH-DETECTION
while (true) {}`,
        errors: [
          { messageId: "missingAnnotation", data: { missing: "@story" } },
        ],
      },
    ],
  });
});
