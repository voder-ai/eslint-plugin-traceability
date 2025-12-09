/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify require-story-annotation rule enforces @story annotation on functions
 * @req REQ-REQUIRE-ACCEPTS-IMPLEMENTS - Verify @supports annotation is accepted as satisfying story requirements
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";
import {
  tsRuleTesterLanguageOptions,
  withTsLanguageOptions,
} from "../utils/ts-language-options";

const ruleTester = new RuleTester({
  languageOptions: tsRuleTesterLanguageOptions,
} as any);

describe("Require Story Annotation Rule (Story 003.0-DEV-FUNCTION-ANNOTATIONS)" /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */ /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */, () => {
  ruleTester.run("require-story-annotation", rule, {
    valid: [
      {
        name: "[REQ-ANNOTATION-REQUIRED] valid with JSDoc @story annotation",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction foo() {}`,
      },
      {
        name: "[REQ-REQUIRE-ACCEPTS-IMPLEMENTS] valid with only @implements annotation",
        code: `/**\n * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED\n */\nfunction implOnly() {}`,
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
      withTsLanguageOptions({
        name: "[REQ-ANNOTATION-REQUIRED] valid on class method with annotation",
        code: `class A {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
      }),
      withTsLanguageOptions({
        name: "[REQ-FUNCTION-DETECTION] valid with annotation on TS declare function",
        code: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
declare function tsDecl(): void;`,
      }),
      withTsLanguageOptions({
        name: "[REQ-FUNCTION-DETECTION] valid with annotation on TS method signature",
        code: `interface C {
  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */
  method(): void;
}`,
      }),
      {
        name: "[REQ-ARROW-FUNCTION-EXCLUDED] anonymous arrow callback in higher-order function is allowed without annotation",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction mapValues(items) {\n  return items.map(() => {\n    return 1;\n  });\n}`,
      },
      {
        name: "[REQ-NESTED-FUNCTION-INHERITANCE] anonymous inner function inherits outer annotation",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction outer() {\n  const inner = function() {\n    return 1;\n  };\n  return inner();\n}`,
      },
      {
        name: "[REQ-TEST-CALLBACK-EXCLUSION][Story 003.0] default exclusion of Jest-style anonymous test callbacks",
        code: `/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TEST-CALLBACK-EXCLUSION
 */
describe('Feature X', () => {
  it('does something', () => {});
});

// Mocha-style suite/context/specify examples
suite('Mocha suite', () => {
  beforeEach(() => {});
  afterEach(() => {});
  before(() => {});
  after(() => {});

  test('Mocha test', () => {});
  specify('Mocha specify', () => {});
  context('Mocha context', () => {
    it('nested it', () => {});
  });
});

// Vitest-style APIs including hooks and bench
describe('Vitest suite', () => {
  beforeEach(() => {});
  afterEach(() => {});
  beforeAll(() => {});
  afterAll(() => {});

  it('Vitest it', () => {});
  test('Vitest test', () => {});
  bench('Vitest bench', () => {});
});`,
      },
    ],
    invalid: [
      {
        // Backward compatibility: plain unannotated functions remain invalid under multi-story support
        name: "[REQ-ANNOTATION-REQUIRED][BACKCOMPAT] missing @story annotation on function with no @supports",
        code: `function bar() {}`,
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'bar' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction bar() {}`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on function expression",
        code: `const fnExpr = function() {};`,
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst fnExpr = function() {};`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'fnExpr' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst fnExpr = function() {};`,
              },
            ],
          },
        ],
      },
      withTsLanguageOptions({
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on class method",
        code: `class C {\n  method() {}\n}`,
        output: `class C {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
        errors: [
          {
            messageId: "missingStory",
            data: { name: "method", functionName: "method" },
            suggestions: [
              {
                desc: `Add traceability annotation for function 'method' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `class C {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n  method() {}\n}`,
              },
            ],
          },
        ],
      }),
      withTsLanguageOptions({
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on TS declare function",
        code: `declare function tsDecl(): void;`,
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ndeclare function tsDecl(): void;`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'tsDecl' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ndeclare function tsDecl(): void;`,
              },
            ],
          },
        ],
      }),
      withTsLanguageOptions({
        name: "[REQ-ANNOTATION-REQUIRED] missing @story on TS method signature",
        code: `interface D {\n  method(): void;\n}`,
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ninterface D {\n  method(): void;\n}`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'method' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\ninterface D {\n  method(): void;\n}`,
              },
            ],
          },
        ],
      }),
      {
        name: "[REQ-ARROW-FUNCTION-EXCLUDED] named arrow function must be annotated",
        code: `const handler = () => {};`,
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst handler = () => {};`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'handler' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nconst handler = () => {};`,
              },
            ],
          },
        ],
      },
      {
        name: "[REQ-NESTED-FUNCTION-INHERITANCE] named inner function inside annotated outer must still be annotated",
        code: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction outer() {\n  function innerNamed() {\n    return 1;\n  }\n  return innerNamed();\n}`,
        output: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction outer() {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction innerNamed() {\n    return 1;\n  }\n  return innerNamed();\n}`,
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'innerNamed' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\nfunction outer() {\n  /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction innerNamed() {\n    return 1;\n  }\n  return innerNamed();\n}`,
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
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nexport function exportedMissing() {}`,
        options: [{ exportPriority: "exported" }],
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'exportedMissing' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nexport function exportedMissing() {}`,
              },
            ],
          },
        ],
      },
      {
        name: "[exportPriority][REQ-ARROW-FUNCTION-EXCLUDED] exported named arrow function must be annotated",
        code: `export const arrowExported = () => {};`,
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nexport const arrowExported = () => {};`,
        options: [{ exportPriority: "exported" }],
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'arrowExported' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
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
        output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction onlyDecl() {}`,
        options: [{ scope: ["FunctionDeclaration"] }],
        errors: [
          {
            messageId: "missingStory",
            suggestions: [
              {
                desc: `Add traceability annotation for function 'onlyDecl' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                output: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\nfunction onlyDecl() {}`,
              },
            ],
          },
        ],
      },
    ],
  });

  ruleTester.run(
    "require-story-annotation with excludeTestCallbacks option",
    rule,
    {
      valid: [
        {
          name: "[REQ-TEST-CALLBACK-EXCLUSION][Story 003.0] non-test arrow function annotated when excludeTestCallbacks=false",
          code: `/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
const handler = () => {};`,
          options: [{ excludeTestCallbacks: false }],
        },
      ],
      invalid: [
        {
          name: "[REQ-TEST-CALLBACK-EXCLUSION][Story 003.0] Jest-style it() callback requires annotation when excludeTestCallbacks=false",
          code: `it('does something', () => {});`,
          options: [{ excludeTestCallbacks: false, autoFix: false }],
          errors: [
            {
              messageId: "missingStory",
              suggestions: [
                {
                  desc: `Add traceability annotation for function '(anonymous)' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */`,
                  output: `it('does something', /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */\n() => {});`,
                },
              ],
            },
          ],
        },
      ],
    },
  );
});
