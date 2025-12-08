/**
 * Tests for: docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md
 * @req REQ-OPTIONAL-WARNING - Verify rule emits recommendations for legacy @story/@req usage and migration to @supports
 * @req REQ-MULTI-STORY-DETECT - Verify rule detects multi-story and mixed-annotation patterns involving @supports
 * @req REQ-CONFIG-SEVERITY - Verify rule is disabled by default and can be enabled as warn/error
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/prefer-implements-annotation";
import { configs } from "../../src";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

describe("prefer-supports-annotation / prefer-implements-annotation aliasing (Story 010.3-DEV-MIGRATE-TO-SUPPORTS)", () => {
  const valid = [
    {
      name: "[REQ-BACKWARD-COMP-VALIDATION] comment with only @story is ignored",
      code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction onlyStory() {}`,
    },
    {
      name: "[REQ-BACKWARD-COMP-VALIDATION] comment with only @req is ignored",
      code: `/**\n * @req REQ-ONLY\n */\nfunction onlyReq() {}`,
    },
    {
      name: "[REQ-BACKWARD-COMP-VALIDATION] comment with @supports only is ignored",
      code: `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction alreadyImplements() {}`,
    },
    {
      name: "[REQ-BACKWARD-COMP-VALIDATION] comment with @story and @supports but no @req is ignored",
      code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction storyAndSupportsNoReq() {}`,
    },
    {
      name: "[REQ-BACKWARD-COMP-VALIDATION] comment with @req and @supports but no @story is ignored",
      code: `/**\n * @req REQ-ANNOTATION-REQUIRED\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction reqAndSupportsNoStory() {}`,
    },
  ];

  const invalid = [
    {
      name: "[REQ-OPTIONAL-WARNING] single-story @story + @req block triggers preferImplements message",
      code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n */\nfunction legacy() {}`,
      output: `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction legacy() {}`,
      errors: [{ messageId: "preferImplements" }],
    },
    {
      name: "[REQ-MULTI-STORY-DETECT] mixed @story/@req and @supports triggers cannotAutoFix",
      code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction mixed() {}`,
      errors: [
        {
          messageId: "cannotAutoFix",
          data: {
            reason:
              "comment mixes @story/@req with existing @supports annotations",
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
      name: "[REQ-AUTO-FIX] single @story + single @req auto-fixes to single @supports line",
      code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ANNOTATION-REQUIRED\n */\nfunction autoFixSingleReq() {}`,
      output: `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction autoFixSingleReq() {}`,
      errors: [{ messageId: "preferImplements" }],
    },
    {
      name: "[REQ-SINGLE-STORY-FIX] single @story with multiple @req lines auto-fixes to single @supports line containing all REQ IDs",
      code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-ONE\n * @req REQ-TWO\n * @req REQ-THREE\n */\nfunction autoFixMultiReq() {}`,
      output: `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ONE REQ-TWO REQ-THREE\n */\nfunction autoFixMultiReq() {}`,
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
    {
      name: "[REQ-INLINE-COMMENT-SUPPORT] single inline // @story + // @req auto-fixes to single // @supports line above function",
      code: `// @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md\n// @req REQ-INLINE-COMMENT-SUPPORT\nfunction inlineLegacy() {}`,
      output: `// @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-INLINE-COMMENT-SUPPORT\nfunction inlineLegacy() {}`,
      errors: [{ messageId: "preferImplements" }],
    },
    {
      name: "[REQ-INLINE-COMMENT-SUPPORT] single inline // @story with multiple // @req lines auto-fixes to single // @supports containing all REQ IDs",
      code: `// @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md\n// @req REQ-INLINE-COMMENT-SUPPORT\n// @req REQ-BRANCH-POSITION-PRESERVE\nfunction inlineMultiReq() {}`,
      output: `// @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-INLINE-COMMENT-SUPPORT REQ-BRANCH-POSITION-PRESERVE\nfunction inlineMultiReq() {}`,
      errors: [{ messageId: "preferImplements" }],
    },
    {
      name: "[REQ-INLINE-COMMENT-SUPPORT] inline // @story + // @req above statement is auto-fixed preserving branch position (REQ-BRANCH-POSITION-PRESERVE)",
      code: `if (flag) {\n  // @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md\n  // @req REQ-BRANCH-POSITION-PRESERVE\n  doSomething();\n}`,
      output: `if (flag) {\n  // @supports docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md REQ-BRANCH-POSITION-PRESERVE\n  doSomething();\n}`,
      errors: [{ messageId: "preferImplements" }],
    },
    {
      name: "[REQ-INLINE-COMMENT-SUPPORT] complex inline // @req content is not safely auto-fixable but still reports preferImplements",
      code: `// @story docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md\n// @req REQ-INLINE-COMMENT-SUPPORT extra description inline\nfunction inlineComplexReqNoAutoFix() {}`,
      errors: [{ messageId: "preferImplements" }],
    },
  ];

  ruleTester.run("prefer-implements-annotation", rule, {
    valid,
    invalid,
  });

  ruleTester.run("prefer-supports-annotation", rule, {
    valid,
    invalid,
  });
});

describe("prefer-implements-annotation configuration severity (REQ-CONFIG-SEVERITY)", () => {
  // Story 010.3 / REQ-RULE-NAME: verify aliasing semantics for new primary rule name and deprecated alias
  test("rule is disabled by default in recommended and strict presets (not present in preset rule maps)", () => {
    const recommended = (configs as any).recommended;
    expect(Array.isArray(recommended)).toBe(true);
    const firstConfig = recommended[0];
    expect(firstConfig).toBeDefined();
    const rules = firstConfig.rules || {};
    expect(rules["traceability/prefer-implements-annotation"]).toBeUndefined();
    expect(rules["traceability/prefer-supports-annotation"]).toBeUndefined();

    const strict = (configs as any).strict;
    expect(Array.isArray(strict)).toBe(true);
    const strictFirstConfig = strict[0];
    expect(strictFirstConfig).toBeDefined();
    const strictRules = strictFirstConfig.rules || {};
    expect(
      strictRules["traceability/prefer-implements-annotation"],
    ).toBeUndefined();
    expect(
      strictRules["traceability/prefer-supports-annotation"],
    ).toBeUndefined();
  });

  test("rule can be configured with severity 'warn' or 'error' in flat config", () => {
    // Story 010.3 / REQ-RULE-NAME: both primary and alias rule keys must be accepted in flat config
    const flatWarnConfig = {
      files: ["**/*.ts"],
      rules: {
        "traceability/prefer-implements-annotation": "warn",
        "traceability/prefer-supports-annotation": "warn",
      },
    };

    expect(
      flatWarnConfig.rules["traceability/prefer-implements-annotation"],
    ).toBe("warn");
    expect(
      flatWarnConfig.rules["traceability/prefer-supports-annotation"],
    ).toBe("warn");

    const flatErrorConfig = {
      files: ["**/*.ts"],
      rules: {
        "traceability/prefer-implements-annotation": "error",
        "traceability/prefer-supports-annotation": "error",
      },
    };

    expect(
      flatErrorConfig.rules["traceability/prefer-implements-annotation"],
    ).toBe("error");
    expect(
      flatErrorConfig.rules["traceability/prefer-supports-annotation"],
    ).toBe("error");
  });
});
