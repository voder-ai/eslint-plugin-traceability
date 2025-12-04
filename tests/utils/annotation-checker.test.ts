/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 * @req REQ-TEST-UTILS-TS-LANG - Shared TS RuleTester language options helper
 */
import { RuleTester } from "eslint";
import { checkReqAnnotation } from "../../src/utils/annotation-checker";
import { withTsLanguageOptions } from "./ts-language-options";

const ruleTester = new RuleTester();

type AnnotationCheckerTestConfig = {
  rule: any;
  valid: Array<{ name: string; code: string; [key: string]: any }>;
  invalid: Array<{ name: string; code: string; errors: any[]; [key: string]: any }>;
};

/**
 * Shared helper for running tests that exercise the annotation-checker logic
 * for TypeScript constructs.
 *
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 * @req REQ-TEST-UTILS-TS-LANG - Shared TS RuleTester language options helper
 */
export function runAnnotationCheckerTests(
  ruleName: string,
  config: AnnotationCheckerTestConfig,
) {
  const { rule, valid, invalid } = config;

  ruleTester.run(ruleName, rule, {
    valid: valid.map(withTsLanguageOptions) as any,
    invalid: invalid.map(withTsLanguageOptions) as any,
  });
}

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
  runAnnotationCheckerTests("annotation-checker", {
    rule,
    valid: [
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] valid TSDeclareFunction with @req",
        code: `/** @req REQ-TEST */\ndeclare function foo(): void;`,
      },
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] valid TSMethodSignature with @req",
        code: `interface I { /** @req REQ-TEST */ method(): void; }`,
      },
    ],
    invalid: [
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] missing @req on TSDeclareFunction",
        code: `declare function foo(): void;`,
        output: `/** @req <REQ-ID> */\ndeclare function foo(): void;`,
        errors: [{ messageId: "missingReq" }],
      },
      {
        name: "[REQ-TYPESCRIPT-SUPPORT] missing @req on TSMethodSignature",
        code: `interface I { method(): void; }`,
        output: `interface I { /** @req <REQ-ID> */\nmethod(): void; }`,
        errors: [{ messageId: "missingReq" }],
      },
    ],
  });
})