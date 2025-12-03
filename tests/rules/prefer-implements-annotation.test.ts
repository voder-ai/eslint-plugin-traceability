/**
 * Tests for: docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
 * @story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md
 * @req REQ-OPTIONAL-WARNING - Verify rule emits recommendations for legacy @story/@req usage
 * @req REQ-MULTI-STORY-DETECT - Verify rule detects multi-story and mixed-annotation patterns
 * @req REQ-CONFIG-SEVERITY - Verify rule is disabled by default and can be enabled as warn/error
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/prefer-implements-annotation";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

describe("prefer-implements-annotation rule (Story 010.3-DEV-MIGRATE-TO-IMPLEMENTS)", () => {
  ruleTester.run("prefer-implements-annotation", rule, {
    valid: [
      {
        name: "[REQ-BACKWARD-COMP-VALIDATION] comment with only @story is ignored",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction onlyStory() {}`,
      },
      {
        name: "[REQ-BACKWARD-COMP-VALIDATION] comment with only @req is ignored",
        code: `/**\n * @req REQ-ONLY\n */\nfunction onlyReq() {}`,
      },
      {
        name: "[REQ-BACKWARD-COMP-VALIDATION] comment with @implements only is ignored",
        code: `/**\n * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction alreadyImplements() {}`,
      },
    ],
    invalid: [
      {
        name: "[REQ-OPTIONAL-WARNING] single-story @story + @req block triggers preferImplements message",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n */\nfunction legacy() {}`,
        output: `/**\n * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction legacy() {}`,
        errors: [{ messageId: "preferImplements" }],
      },
      {
        name: "[REQ-MULTI-STORY-DETECT] mixed @story/@req and @implements triggers cannotAutoFix",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction mixed() {}`,
        errors: [
          {
            messageId: "cannotAutoFix",
            data: {
              reason:
                "comment mixes @story/@req with existing @implements annotations",
            },
          },
        ],
      },
      {
        name: "[REQ-MULTI-STORY-DETECT] multiple @story paths in same block trigger multiStoryDetected",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md\n * @req REQ-BRANCH-DETECTION\n */\nfunction multiStory() {}`,
        errors: [{ messageId: "multiStoryDetected" }],
      },
      {
        name: "[REQ-AUTO-FIX] single @story + single @req auto-fixes to single @implements line",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n */\nfunction autoFixSingleReq() {}`,
        output: `/**\n * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction autoFixSingleReq() {}`,
        errors: [{ messageId: "preferImplements" }],
      },
      {
        name: "[REQ-SINGLE-STORY-FIX] single @story with multiple @req lines auto-fixes to single @implements line containing all REQ IDs",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ONE\n * @req REQ-TWO\n * @req REQ-THREE\n */\nfunction autoFixMultiReq() {}`,
        output: `/**\n * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ONE REQ-TWO REQ-THREE\n */\nfunction autoFixMultiReq() {}`,
        errors: [{ messageId: "preferImplements" }],
      },
      {
        name: "[REQ-AUTO-FIX] complex @req content (extra description) does not auto-fix but still warns",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED must handle extra description\n */\nfunction complexReqNoAutoFix() {}`,
        errors: [{ messageId: "preferImplements" }],
      },
      {
        name: "[REQ-AUTO-FIX] complex @story content (extra description) does not auto-fix but still warns",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md additional descriptive text\n * @req REQ-ANNOTATION-REQUIRED\n */\nfunction complexStoryNoAutoFix() {}`,
        errors: [{ messageId: "preferImplements" }],
      },
    ],
  });
});
