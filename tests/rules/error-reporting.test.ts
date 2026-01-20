/**
 * Tests for: docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT REQ-ERROR-LOCATION
 * @req REQ-ERROR-SPECIFIC - Specific details about what annotation is missing or invalid
 * @req REQ-ERROR-SUGGESTION - Suggest concrete steps to fix the issue
 * @req REQ-ERROR-CONTEXT - Include relevant context in error messages
 * @req REQ-ERROR-LOCATION - Include precise location information in error messages
 */
import { RuleTester } from "eslint";
import rule from "../../src/rules/require-story-annotation";

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
  },
} as any);

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-CONTEXT
 */
function returnText(text: string) {
  return text;
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-CONTEXT
 */
function createSourceCode(text: string) {
  return {
    text,
    getText: returnText.bind(null, text),
    ast: {
      type: "Program",
      body: [],
      sourceType: "module",
    },
  };
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-CONTEXT
 */
function pushReportedDescriptor(reported: any[], descriptor: any) {
  reported.push(descriptor);
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-LOCATION
 */
function getTestFilename() {
  return "test.js";
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-CONTEXT REQ-ERROR-LOCATION
 */
function createRuleContext(code: string, reported: any[]) {
  return {
    id: "require-story-annotation",
    options: [],
    report: pushReportedDescriptor.bind(null, reported),
    getFilename: getTestFilename,
    getSourceCode: createSourceCode.bind(null, code),
  };
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-CONTEXT
 */
function createProgramWithSingleNamedFunction(functionName: string) {
  return {
    type: "Program",
    body: [
      {
        type: "FunctionDeclaration",
        id: { type: "Identifier", name: functionName },
        params: [],
        body: {
          type: "BlockStatement",
          body: [],
        },
      },
    ],
    sourceType: "module",
  } as any;
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-LOCATION
 */
function maybeInvokeProgramListener(listeners: any, programNode: any) {
  if (typeof listeners.Program === "function") {
    listeners.Program(programNode);
  }
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-LOCATION
 */
function maybeInvokeFunctionDeclarationListener(
  listeners: any,
  functionNode: any,
) {
  if (typeof listeners.FunctionDeclaration === "function") {
    listeners.FunctionDeclaration(functionNode);
  }
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT
 */
function validCasesSuite() {
  ruleTester.run("require-story-annotation", rule, {
    valid: [
      {
        name: "[007.0-DEV-ERROR-REPORTING] valid with existing annotation",
        code: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */ function foo() {}`,
      },
    ],
    invalid: [],
  });
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT
 */
function reportsSpecificMessageForBar() {
  const code = "function bar() {}";

  const reported: any[] = [];
  const context: any = createRuleContext(code, reported);
  const listeners = rule.create(context);

  // Minimal synthetic AST nodes for the visitors
  const programNode = createProgramWithSingleNamedFunction("bar");
  const functionNode = programNode.body[0];

  maybeInvokeProgramListener(listeners, programNode);
  maybeInvokeFunctionDeclarationListener(listeners, functionNode);

  expect(reported.length).toBe(1);
  const error = reported[0];

  // Message template should be defined and contain the {{name}} placeholder
  const template = rule.meta?.messages?.missingStory as string;
  expect(typeof template).toBe("string");
  expect(template.length).toBeGreaterThan(0);
  expect(template.includes("{{name}}")).toBe(true);

  // Ensure messageId and data wiring is correct
  expect(error.messageId).toBe("missingStory");
  expect(error.data).toEqual({ name: "bar", functionName: "bar" });

  // Suggestions
  expect(Array.isArray(error.suggest)).toBe(true);
  expect(error.suggest.length).toBeGreaterThanOrEqual(1);

  const suggestion = error.suggest[0];
  expect(suggestion.desc).toBe(
    "Add traceability annotation for function 'bar' using @supports (preferred) or @story (legacy), for example: /** @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
  );
  expect(suggestion.fix).toBeDefined();
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC
 */
function missingStorySuite() {
  it(
    "reports specific message, data, and suggestions for function 'bar'",
    reportsSpecificMessageForBar,
  );
}

/**
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-SPECIFIC REQ-ERROR-SUGGESTION REQ-ERROR-CONTEXT REQ-ERROR-LOCATION
 */
function errorReportingSuite() {
  describe("valid cases", validCasesSuite);
  describe(
    "REQ-ERROR-SPECIFIC - missing @story annotation should report specific details and suggestion",
    missingStorySuite,
  );
}

describe(
  "Error Reporting Enhancements for require-story-annotation (Story 007.0-DEV-ERROR-REPORTING)",
  errorReportingSuite,
);
