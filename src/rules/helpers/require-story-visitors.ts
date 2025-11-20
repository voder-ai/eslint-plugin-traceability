/**
 * Visitor builders for require-story-annotation rule
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-EXTRACT-VISITORS - Extract visitor logic into helper module to reduce rule file size
 */

import type { Rule } from "eslint";
import {
  resolveTargetNode,
  reportMissing as helperReportMissing,
  reportMethod as helperReportMethod,
} from "./require-story-helpers";

/**
 * Build visitor for FunctionDeclaration nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS-FNDECL - Provide visitor for FunctionDeclaration
 */
function buildFunctionDeclarationVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  /**
   * Handle FunctionDeclaration nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on function declarations
   */
  function handleFunctionDeclaration(_node: any) {
    /**
     * Debug logging for visitor entry
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-DEBUG-LOG - Provide debug logging for visitor entry
     */
    void _node;
    console.debug(
      "require-story-annotation:FunctionDeclaration",
      typeof context.getFilename === "function"
        ? context.getFilename()
        : "<unknown>",
      _node && _node.id ? _node.id.name : "<anonymous>",
    );

    if (!options.shouldProcessNode(_node)) return;

    const target = resolveTargetNode(sourceCode, _node, {
      scope: options.scope,
      exportPriority: options.exportPriority,
    });
    helperReportMissing(context, sourceCode, _node, target);
  }

  return {
    FunctionDeclaration: handleFunctionDeclaration,
  };
}

/**
 * Build visitor for FunctionExpression nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS-FNEXPR - Provide visitor for FunctionExpression
 */
function buildFunctionExpressionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  /**
   * Handle FunctionExpression nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on function expressions
   */
  function handleFunctionExpression(_node: any) {
    void _node;
    if (!options.shouldProcessNode(_node)) return;

    /**
     * Do not report when function expression is a MethodDefinition
     * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
     * @req REQ-METHOD-SKIP - Skip MethodDefinition function expressions
     */
    if (_node.parent && _node.parent.type === "MethodDefinition") return;

    const target = resolveTargetNode(sourceCode, _node, {
      scope: options.scope,
      exportPriority: options.exportPriority,
    });
    helperReportMissing(context, sourceCode, _node, target);
  }

  return {
    FunctionExpression: handleFunctionExpression,
  };
}

/**
 * Build visitor for ArrowFunctionExpression nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS-ARROW - Provide visitor for ArrowFunctionExpression
 */
function buildArrowFunctionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  /**
   * Handle ArrowFunctionExpression nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on arrow functions
   */
  function handleArrowFunctionExpression(_node: any) {
    void _node;
    if (!options.shouldProcessNode(_node)) return;
    const target = resolveTargetNode(sourceCode, _node, {
      scope: options.scope,
      exportPriority: options.exportPriority,
    });
    helperReportMissing(context, sourceCode, _node, target);
  }

  return {
    ArrowFunctionExpression: handleArrowFunctionExpression,
  };
}

/**
 * Build visitor for TypeScript TSDeclareFunction nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS-TSDECL - Provide visitor for TSDeclareFunction
 */
function buildTSDeclareFunctionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  /**
   * Handle TSDeclareFunction nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on TS declare functions
   */
  function handleTSDeclareFunction(_node: any) {
    void _node;
    if (!options.shouldProcessNode(_node)) return;
    helperReportMissing(context, sourceCode, _node, _node);
  }

  return {
    TSDeclareFunction: handleTSDeclareFunction,
  };
}

/**
 * Build visitor for TypeScript TSMethodSignature nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS-TSMSIG - Provide visitor for TSMethodSignature
 */
function buildTSMethodSignatureVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  /**
   * Handle TSMethodSignature nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on TS method signatures
   */
  function handleTSMethodSignature(_node: any) {
    void _node;
    if (!options.shouldProcessNode(_node)) return;
    const target = resolveTargetNode(sourceCode, _node, {
      scope: options.scope,
      exportPriority: options.exportPriority,
    });
    helperReportMissing(context, sourceCode, _node, target);
  }

  return {
    TSMethodSignature: handleTSMethodSignature,
  };
}

/**
 * Build visitor for MethodDefinition nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS-METHODDEF - Provide visitor for MethodDefinition
 */
function buildMethodDefinitionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  /**
   * Handle MethodDefinition nodes (class/object methods).
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Report missing @story on class/object methods
   */
  function handleMethodDefinition(_node: any) {
    void _node;
    if (!options.shouldProcessNode(_node)) return;
    helperReportMethod(context, sourceCode, _node);
  }

  return {
    MethodDefinition: handleMethodDefinition,
  };
}

/**
 * Build visitor handlers for various function-like AST nodes.
 * Returns merged listener object from smaller builders.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-BUILD-VISITORS - Provide visitor implementations for rule create()
 */
export function buildVisitors(
  context: Rule.RuleContext,
  sourceCode: any,
  options: {
    shouldProcessNode: (_node: any) => boolean;
    scope?: any;
    exportPriority?: any;
  },
): Rule.RuleListener {
  const fnDecl = buildFunctionDeclarationVisitor(context, sourceCode, options);
  const fnExpr = buildFunctionExpressionVisitor(context, sourceCode, options);
  const arrow = buildArrowFunctionVisitor(context, sourceCode, options);
  const tsDecl = buildTSDeclareFunctionVisitor(context, sourceCode, options);
  const tsSig = buildTSMethodSignatureVisitor(context, sourceCode, options);
  const methodDef = buildMethodDefinitionVisitor(context, sourceCode, options);

  return Object.assign({}, fnDecl, fnExpr, arrow, tsDecl, tsSig, methodDef);
}