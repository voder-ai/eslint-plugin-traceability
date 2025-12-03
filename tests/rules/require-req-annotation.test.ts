/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-req-annotation rule enforces @req on functions
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @req REQ-ERROR-SPECIFIC - Verify enhanced, specific error messaging behavior
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Verify TypeScript declarations are checked via shared annotation checker helper
 *
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Verify @implements is accepted as satisfying requirement annotations
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-req-annotation";
import { withTsLanguageOptions } from "../utils/ts-language-options";
import { runAnnotationCheckerTests } from "../utils/annotation-checker.test";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  },
} as any);

/**
 * @trace Story 003.0-DEV-FUNCTION-ANNOTATIONS / REQ-TYPESCRIPT-SUPPORT
 * Exercise the require-req-annotation rule's behavior on TSDeclareFunction and
 * TSMethodSignature via the shared runAnnotationCheckerTests helper.
 *
 * The helper delegates to the real rule's TypeScript-specific visitors
 * without changing its behavior; it provides the common TS parser
 * configuration and assertion plumbing.
 */
runAnnotationCheckerTests("require-req-annotation", {
  rule,
  valid: [
    {
      name: "[REQ-TYPESCRIPT-SUPPORT] valid with @req annotation on TSDeclareFunction",
      code: `/**\n * @req REQ-EXAMPLE\n */\ndeclare function foo(): void;`,
    },
    {
      name: "[REQ-TYPESCRIPT-SUPPORT] valid with @req annotation on TSMethodSignature",
      code: `interface I {\n  /**\n   * @req REQ-EXAMPLE\n   */\n  method(): void;\n}`,
    },
  ],
  invalid: [
    {
      name: "[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction",
      code: `declare function baz(): void;`,
      errors: [
        {
          messageId: "missingReq",
          data: { name: "baz", functionName: "baz" },
        },
      ],
    },
    {
      name: "[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature",
      code: `interface I { method(): void; }`,
      errors: [
        {
          messageId: "missingReq",
          data: { name: "method", functionName: "method" },
        },
      ],
    },
  ],
});

describe("Require Req Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
  ruleTester.run("require-req-annotation", rule, {
    valid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with only @req annotation",
        code: `/**\n * @req REQ-EXAMPLE\n */\nfunction foo() {}`,
      },
      {
        name: "[REQ-REQUIRE-ACCEPTS-IMPLEMENTS] valid with only @implements annotation",
        code: `/**\n * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction implOnly() {}`,
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with @story and @req annotations",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n * @req REQ-EXAMPLE\n */\nfunction bar() {}`,
      },
      {
        name: "[REQ-FUNCTION-DETECTION][Story 003.0] valid FunctionExpression with @req annotation",
        code: `const fn = /**\n * @req REQ-EXAMPLE\n */\nfunction() {};`,
      },
      {
        name: "[REQ-FUNCTION-DETECTION][Story 003.0] valid MethodDefinition with @req annotation",
        code: `class C {\n  /**\n   * @req REQ-EXAMPLE\n   */\n  m() {}\n}`,
      },
      withTsLanguageOptions({
        name: "[REQ-TYPESCRIPT-SUPPORT][REQ-FUNCTION-DETECTION][Story 003.0] valid TS FunctionExpression in variable declarator with @req",
        code: `const fn = /**\n * @req REQ-EXAMPLE\n */\nfunction () {};`,
      }),
      withTsLanguageOptions({
        name: "[REQ-TYPESCRIPT-SUPPORT][REQ-FUNCTION-DETECTION][Story 003.0] valid exported TS FunctionExpression in variable declarator with @req",
        code: `export const fn = /**\n * @req REQ-EXAMPLE\n */\nfunction () {};`,
      }),
      {
        name: "[REQ-CONFIGURABLE-SCOPE][Story 003.0] FunctionExpression ignored when scope only includes FunctionDeclaration",
        code: `const fn = function () {};`,
        options: [{ scope: ["FunctionDeclaration"] }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] non-exported function ignored when exportPriority is 'exported'",
        code: `function nonExported() {}`,
        options: [{ exportPriority: "exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] exported function required when exportPriority is 'exported'",
        code: `/** @req REQ-EXAMPLE */\nexport function exportedFn() {}`,
        options: [{ exportPriority: "exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] exported function ignored when exportPriority is 'non-exported'",
        code: `export function exportedFn() {}`,
        options: [{ exportPriority: "non-exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] non-exported function required when exportPriority is 'non-exported'",
        code: `/** @req REQ-EXAMPLE */\nfunction nonExported() {}`,
        options: [{ exportPriority: "non-exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] exported method ignored when exportPriority is 'non-exported'",
        code: `export class C {\n  m() {}\n}`,
        options: [{ exportPriority: "non-exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] non-exported method required when exportPriority is 'non-exported'",
        code: `class C {\n  /** @req REQ-EXAMPLE */\n  m() {}\n}`,
        options: [{ exportPriority: "non-exported" }],
      },
    ],
    invalid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED][REQ-REQUIRE-ACCEPTS-IMPLEMENTS] missing @req on function without JSDoc remains invalid under multi-story support",
        code: `function baz() {}`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "baz", functionName: "baz" },
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @req on function with only @story annotation",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction qux() {}`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "qux", functionName: "qux" },
          },
        ],
      },
      {
        name: "[REQ-FUNCTION-DETECTION][Story 003.0] missing @req on FunctionExpression assigned to variable",
        code: `const fn = function () {};`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "fn", functionName: "fn" },
          },
        ],
      },
      {
        name: "[REQ-FUNCTION-DETECTION][Story 003.0] missing @req on anonymous FunctionExpression (no variable name)",
        code: `(function () {})();`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "(anonymous)", functionName: "(anonymous)" },
          },
        ],
      },
      {
        name: "[REQ-FUNCTION-DETECTION][Story 003.0] missing @req on MethodDefinition in class",
        code: `class C {\n  m() {}\n}`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "m", functionName: "m" },
          },
        ],
      },
      {
        name: "[REQ-FUNCTION-DETECTION][Story 003.0] missing @req on MethodDefinition in object literal",
        code: `const o = { m() {} };`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "m", functionName: "m" },
          },
        ],
      },
      withTsLanguageOptions({
        name: "[REQ-TYPESCRIPT-SUPPORT][REQ-FUNCTION-DETECTION][Story 003.0] missing @req on TS FunctionExpression in variable declarator",
        code: `const fn = function () {};`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "fn", functionName: "fn" },
          },
        ],
      }),
      withTsLanguageOptions({
        name: "[REQ-TYPESCRIPT-SUPPORT][REQ-FUNCTION-DETECTION][Story 003.0] missing @req on exported TS FunctionExpression in variable declarator",
        code: `export const fn = function () {};`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "fn", functionName: "fn" },
          },
        ],
      }),
      {
        name: "[REQ-CONFIGURABLE-SCOPE][Story 003.0] FunctionDeclaration still reported when scope only includes FunctionDeclaration",
        code: `function scoped() {}`,
        options: [{ scope: ["FunctionDeclaration"] }],
        errors: [
          {
            messageId: "missingReq",
            data: { name: "scoped", functionName: "scoped" },
          },
        ],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] exported function reported when exportPriority is 'exported'",
        code: `export function exportedFn() {}`,
        options: [{ exportPriority: "exported" }],
        errors: [
          {
            messageId: "missingReq",
            data: { name: "exportedFn", functionName: "exportedFn" },
          },
        ],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] non-exported function reported when exportPriority is 'non-exported'",
        code: `function nonExported() {}`,
        options: [{ exportPriority: "non-exported" }],
        errors: [
          {
            messageId: "missingReq",
            data: { name: "nonExported", functionName: "nonExported" },
          },
        ],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] exported method reported when exportPriority is 'exported'",
        code: `export class C {\n  m() {}\n}`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "m", functionName: "m" },
          },
        ],
        options: [{ exportPriority: "exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] non-exported method reported when exportPriority is 'non-exported'",
        code: `class C {\n  m() {}\n}`,
        errors: [
          {
            messageId: "missingReq",
            data: { name: "m", functionName: "m" },
          },
        ],
        options: [{ exportPriority: "non-exported" }],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] exported FunctionExpression reported when exportPriority is 'exported'",
        code: `export const fn = function () {};`,
        options: [{ exportPriority: "exported" }],
        errors: [
          {
            messageId: "missingReq",
            data: { name: "fn", functionName: "fn" },
          },
        ],
      },
      {
        name: "[REQ-EXPORT-PRIORITY][Story 003.0] non-exported FunctionExpression reported when exportPriority is 'non-exported'",
        code: `const fn = function () {};`,
        options: [{ exportPriority: "non-exported" }],
        errors: [
          {
            messageId: "missingReq",
            data: { name: "fn", functionName: "fn" },
          },
        ],
      },
    ],
  });
});
