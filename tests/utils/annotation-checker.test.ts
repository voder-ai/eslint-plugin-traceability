/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 */
import { RuleTester } from "eslint";
import { checkReqAnnotation } from "../../src/utils/annotation-checker";

const ruleTester = new RuleTester();

const rule: any = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Test helper for checking @req annotation",
      recommended: "error",
    },
    messages: { missingReq: "Missing @req annotation" },
    schema: [],
  },
  create(context: any) {
    return {
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
       */
      TSDeclareFunction: (node: any) => checkReqAnnotation(context, node),
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
       */
      TSMethodSignature: (node: any) => checkReqAnnotation(context, node),
    };
  },
};

describe("annotation-checker helper", () => {
  ruleTester.run("annotation-checker", rule, {
    valid: [
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] valid TSDeclareFunction with @req",
        code: `/** @req REQ-TEST */\ndeclare function foo(): void;`,
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2022, sourceType: "module" },
        },
      },
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] valid TSMethodSignature with @req",
        code: `interface I { /** @req REQ-TEST */ method(): void; }`,
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2022, sourceType: "module" },
        },
      },
    ],
    invalid: [
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction",
        code: `declare function foo(): void;`,
        output: `/** @req <REQ-ID> */\ndeclare function foo(): void;`,
        errors: [{ messageId: "missingReq" }],
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2022, sourceType: "module" },
        },
      },
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature",
        code: `interface I { method(): void; }`,
        output: `interface I { /** @req <REQ-ID> */\nmethod(): void; }`,
        errors: [{ messageId: "missingReq" }],
        languageOptions: {
          parser: require("@typescript-eslint/parser") as any,
          parserOptions: { ecmaVersion: 2022, sourceType: "module" },
        },
      },
    ],
  });
});
