// @ts-nocheck
/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-story-annotation rule enforces @story annotation on functions
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

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
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid on function expression with annotation",
        code: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst fnExpr = function() {};`,
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid on arrow function with annotation",
        code: `// @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
const arrowFn = () => {};`,
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid on class method with annotation",
        code: `class A {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
      },
      {
        name: "[REQ-FUNCTION-DETECTION] valid with annotation on TS declare function",
        code: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
declare function tsDecl(): void;`,
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2020, sourceType: "module" },
        },
      },
      {
        name: "[REQ-FUNCTION-DETECTION] valid with annotation on TS method signature",
        code: `interface C {
  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
  method(): void;
}`,
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2020, sourceType: "module" },
        },
      },
    ],
    invalid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story annotation on function",
        code: `function bar() {}`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'bar', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on function expression",
        code: `const fnExpr = function() {};`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'fnExpr', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst fnExpr = function() {};`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on arrow function",
        code: `const arrowFn = () => {};`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'arrowFn', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst arrowFn = () => {};`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on class method",
        code: `class C {\n  method() {}\n}`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'method', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `class C {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on TS declare function",
        code: `declare function tsDecl(): void;`,
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2020, sourceType: "module" },
        },
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'tsDecl', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ndeclare function tsDecl(): void;`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on TS method signature",
        code: `interface D {\n  method(): void;\n}`,
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2020, sourceType: "module" },
        },
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'method', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ninterface D {\n  method(): void;\n}`,
              },
            ],
          },
        ],
      },
    ],
  });

  ruleTester.run("require-story-annotation with exportPriority option", rule, {
    valid: [
      {
        name: "[exportPriority] unexported function without @story should be valid",
        code: `function local() {}`,
        options: [{ exportPriority: "exported" }],
      },
      {
        name: "[exportPriority] exported with annotation",
        code: `// @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\nexport function exportedAnnotated() {}`,
        options: [{ exportPriority: "exported" }],
      },
    ],
    invalid: [
      {
        name: "[exportPriority] exported function missing @story annotation",
        code: `export function exportedMissing() {}`,
        options: [{ exportPriority: "exported" }],
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'exportedMissing', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nexport function exportedMissing() {}`,
              },
            ],
          },
        ],
      },
      {
        name: "[exportPriority] exported arrow function missing @story annotation",
        code: `export const arrowExported = () => {};`,
        options: [{ exportPriority: "exported" }],
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'arrowExported', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nexport const arrowExported = () => {};`,
              },
            ],
          },
        ],
      },
    ],
  });

  ruleTester.run("require-story-annotation with scope option", rule, {
    valid: [
      {
        name: "[scope] arrow function ignored when scope is FunctionDeclaration",
        code: `const arrow = () => {};`,
        options: [{ scope: ["FunctionDeclaration"] }],
      },
    ],
    invalid: [
      {
        name: "[scope] function declaration missing annotation when scope is FunctionDeclaration",
        code: `function onlyDecl() {}`,
        options: [{ scope: ["FunctionDeclaration"] }],
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add JSDoc @story annotation for function 'onlyDecl', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction onlyDecl() {}`,
              },
            ],
          },
        ],
      },
    ],
  });
});
