/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT REQ-JSDOC-PARSING
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
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT REQ-JSDOC-PARSING
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

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
 */
function checkTSDeclareFunction(context: any, node: any) {
  return checkReqAnnotation(context, node);
}

/**
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
 */
function checkTSMethodSignature(context: any, node: any) {
  return checkReqAnnotation(context, node);
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
  /**
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
   */
  create(context: any) {
    return {
      TSDeclareFunction: checkTSDeclareFunction.bind(null, context),
      TSMethodSignature: checkTSMethodSignature.bind(null, context),
    };
  },
};

describe("annotation-checker helper (Story 003.0-DEV-FUNCTION-ANNOTATIONS)", () => {
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