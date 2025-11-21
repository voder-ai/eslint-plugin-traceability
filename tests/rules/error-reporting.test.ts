/**
 * Tests for: docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
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

describe("Error Reporting Enhancements for require-story-annotation (Story 007.0-DEV-ERROR-REPORTING)", () => {
  describe("valid cases", () => {
    ruleTester.run("require-story-annotation", rule, {
      valid: [
        {
          name: "[007.0-DEV-ERROR-REPORTING] valid with existing annotation",
          code: `/** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */ function foo() {}`,
        },
      ],
      invalid: [],
    });
  });

  describe("REQ-ERROR-SPECIFIC - missing @story annotation should report specific details and suggestion", () => {
    it("reports specific message, data, and suggestions for function 'bar'", () => {
      const code = "function bar() {}";

      const reported: any[] = [];

      const context: any = {
        id: "require-story-annotation",
        options: [],
        report: (descriptor: any) => {
          reported.push(descriptor);
        },
        getFilename: () => "test.js",
        getSourceCode: () => ({
          text: code,
          getText: () => code,
          ast: {
            type: "Program",
            body: [],
            sourceType: "module",
          },
        }),
      };

      const listeners = rule.create(context);

      // Minimal synthetic AST nodes for the visitors
      const programNode = {
        type: "Program",
        body: [
          {
            type: "FunctionDeclaration",
            id: { type: "Identifier", name: "bar" },
            params: [],
            body: {
              type: "BlockStatement",
              body: [],
            },
          },
        ],
        sourceType: "module",
      } as any;

      const functionNode = programNode.body[0];

      // Invoke visitors if they exist
      if (typeof listeners.Program === "function") {
        listeners.Program(programNode);
      }

      if (typeof listeners.FunctionDeclaration === "function") {
        listeners.FunctionDeclaration(functionNode);
      }

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
        "Add JSDoc @story annotation for function 'bar', e.g., /** @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md */",
      );
      expect(suggestion.fix).toBeDefined();
    });
  });
});
