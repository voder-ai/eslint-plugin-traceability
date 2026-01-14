/**
 * Focused autofix behavior tests for annotation-checker helper.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-JSDOC-PARSING REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/008.0-DEV-AUTO-FIX.story.md REQ-AUTOFIX-SAFE REQ-AUTOFIX-PRESERVE REQ-AUTOFIX-SELECTIVE
 */

jest.mock("../../src/utils/reqAnnotationDetection", () => ({
  // Always report that no requirement annotation is present so we exercise
  // the missing-annotation reporting and autofix paths in the helper.
  hasReqAnnotation: jest.fn(() => false),
}));

jest.mock("../../src/rules/helpers/require-story-utils", () => ({
  // Provide a stable, human-readable name so reporting paths are predictable
  // without depending on the full real implementation.
  getNodeName: jest.fn(() => "mockName"),
}));

import { checkReqAnnotation } from "../../src/utils/annotation-checker";

/**
 * Build a minimal ESLint rule context stub that captures report() calls.
 *
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function createContextStub() {
  const report = jest.fn();
  const sourceCode = {
    getJSDocComment: jest.fn(() => null),
    getCommentsBefore: jest.fn(() => []),
  } as any;

  const context = {
    getSourceCode() {
      return sourceCode;
    },
    report,
  } as any;

  return { context, report };
}

describe(
  "annotation-checker helper autofix behavior (Story 003.0-DEV-FUNCTION-ANNOTATIONS)",
  () => {
    it("[REQ-AUTOFIX-PRESERVE] attaches fix directly to node when parent is missing", () => {
      const { context, report } = createContextStub();
      const node = { type: "FunctionDeclaration" } as any; // no parent property

      checkReqAnnotation(context, node, { enableFix: true });

      expect(report).toHaveBeenCalledTimes(1);
      const reportArg = report.mock.calls[0][0];

      expect(reportArg).toHaveProperty("fix");
      const fixer = { insertTextBefore: jest.fn() } as any;

      reportArg.fix(fixer);

      expect(fixer.insertTextBefore).toHaveBeenCalledWith(
        node,
        "/** @req <REQ-ID> */\n",
      );
    });

    it("[REQ-AUTOFIX-PRESERVE] attaches fix to MethodDefinition wrapper when parent is a method", () => {
      const { context, report } = createContextStub();
      const methodParent = { type: "MethodDefinition" } as any;
      const node = {
        type: "FunctionExpression",
        parent: methodParent,
        id: { type: "Identifier", name: "methodImpl" },
      } as any;

      checkReqAnnotation(context, node, { enableFix: true });

      expect(report).toHaveBeenCalledTimes(1);
      const reportArg = report.mock.calls[0][0];

      const fixer = { insertTextBefore: jest.fn() } as any;
      reportArg.fix(fixer);

      expect(fixer.insertTextBefore).toHaveBeenCalledWith(
        methodParent,
        "/** @req <REQ-ID> */\n",
      );
    });

    it("[REQ-AUTOFIX-PRESERVE] attaches fix to VariableDeclarator when node is its init", () => {
      const { context, report } = createContextStub();
      const declarator: any = { type: "VariableDeclarator" };
      const node: any = { type: "FunctionExpression", parent: declarator };
      declarator.init = node;

      checkReqAnnotation(context, node, { enableFix: true });

      expect(report).toHaveBeenCalledTimes(1);
      const reportArg = report.mock.calls[0][0];

      const fixer = { insertTextBefore: jest.fn() } as any;
      reportArg.fix(fixer);

      expect(fixer.insertTextBefore).toHaveBeenCalledWith(
        declarator,
        "/** @req <REQ-ID> */\n",
      );
    });

    it("[REQ-AUTOFIX-PRESERVE] attaches fix to ExpressionStatement wrapper when parent is an expression", () => {
      const { context, report } = createContextStub();
      const expressionParent = { type: "ExpressionStatement" } as any;
      const node = {
        type: "FunctionExpression",
        parent: expressionParent,
        id: { type: "Identifier", name: "iife" },
      } as any;

      checkReqAnnotation(context, node, { enableFix: true });

      expect(report).toHaveBeenCalledTimes(1);
      const reportArg = report.mock.calls[0][0];

      const fixer = { insertTextBefore: jest.fn() } as any;
      reportArg.fix(fixer);

      expect(fixer.insertTextBefore).toHaveBeenCalledWith(
        expressionParent,
        "/** @req <REQ-ID> */\n",
      );
    });

    it("[REQ-AUTOFIX-SELECTIVE] omits fix when enableFix is false", () => {
      const { context, report } = createContextStub();
      const node = {
        type: "FunctionDeclaration",
        parent: { type: "Program" },
        id: { type: "Identifier", name: "noFix" },
      } as any;

      checkReqAnnotation(context, node, { enableFix: false });

      expect(report).toHaveBeenCalledTimes(1);
      const reportArg = report.mock.calls[0][0];

      expect(reportArg.fix).toBeUndefined();
    });
  },
);
