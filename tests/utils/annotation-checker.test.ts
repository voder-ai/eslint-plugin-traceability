/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 */
import { RuleTester } from "eslint";
import { checkReqAnnotation } from "../../src/utils/annotation-checker";
import { tsRuleTesterLanguageOptions } from "./ts-language-options";

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

type RuleTesterTestCase = {
  name: string;
  code: string;
  output?: string;
  errors?: { messageId: string }[];
};

function runTsAnnotationCheckerTests(
  ruleName: string,
  ruleToRun: any,
  description: string,
  testCases: {
    valid: RuleTesterTestCase[];
    invalid: RuleTesterTestCase[];
  },
) {
  const withTsOptions = <T extends RuleTesterTestCase>(test: T): T & {
    languageOptions: typeof tsRuleTesterLanguageOptions;
  } => ({
    ...test,
    languageOptions: tsRuleTesterLanguageOptions,
  });

  ruleTester.run(
    ruleName,
    ruleToRun,
    {
      valid: testCases.valid.map(withTsOptions),
      invalid: testCases.invalid.map(withTsOptions),
    },
  );
}

describe("annotation-checker helper", () => {
  runTsAnnotationCheckerTests("annotation-checker", rule, "TS annotation checker", {
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