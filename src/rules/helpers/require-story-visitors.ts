/**
 * Visitor builders for require-story-annotation rule
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
 */

import type { Rule } from "eslint";
import {
  resolveTargetNode,
  reportMissing as helperReportMissing,
  reportMethod as helperReportMethod,
} from "./require-story-helpers";

/**
 * Build visitor for FunctionDeclaration nodes.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function buildFunctionDeclarationVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  /**
   * Handle FunctionDeclaration nodes.
   *
   * Developers who need to troubleshoot this handler may temporarily add
   * console.debug statements here, but by default no debug logging runs so that
   * file paths and other details are not leaked during normal linting.
   *
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
   */
  function handleFunctionDeclaration(node: any) {
    if (!options.shouldProcessNode(node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
      return;
    }

    const target = resolveTargetNode(sourceCode, node);
    helperReportMissing(context, sourceCode, {
      node,
      target,
      options: {
        annotationTemplateOverride: options.annotationTemplate,
        autoFixToggle: options.autoFix,
        annotationPlacement: options.annotationPlacement,
      },
    });
  }

  return {
    FunctionDeclaration: handleFunctionDeclaration,
  };
}

/**
 * Build visitor for FunctionExpression nodes.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function buildFunctionExpressionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  /**
   * Handle FunctionExpression nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
   */
  function handleFunctionExpression(node: any) {
    if (!options.shouldProcessNode(node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
      return;
    }

    /**
     * Do not report when function expression is a MethodDefinition
     */
    if (node.parent && node.parent.type === "MethodDefinition") {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
      return;
    }

    const target = resolveTargetNode(sourceCode, node);
    helperReportMissing(context, sourceCode, {
      node,
      target,
      options: {
        annotationTemplateOverride: options.annotationTemplate,
        autoFixToggle: options.autoFix,
        annotationPlacement: options.annotationPlacement,
      },
    });
  }

  return {
    FunctionExpression: handleFunctionExpression,
  };
}

/**
 * Build visitor for ArrowFunctionExpression nodes.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function buildArrowFunctionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  /**
   * Handle ArrowFunctionExpression nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
   */
  function handleArrowFunctionExpression(node: any) {
    if (!options.shouldProcessNode(node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
      return;
    }
    const target = resolveTargetNode(sourceCode, node);
    helperReportMissing(context, sourceCode, {
      node,
      target,
      options: {
        annotationTemplateOverride: options.annotationTemplate,
        autoFixToggle: options.autoFix,
        annotationPlacement: options.annotationPlacement,
      },
    });
  }

  return {
    ArrowFunctionExpression: handleArrowFunctionExpression,
  };
}

/**
 * Build visitor for TypeScript TSDeclareFunction nodes.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
 */
function buildTSDeclareFunctionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  /**
   * Handle TSDeclareFunction nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
   */
  function handleTSDeclareFunction(node: any) {
    if (!options.shouldProcessNode(node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-TYPESCRIPT-SUPPORT
      return;
    }
    helperReportMissing(context, sourceCode, {
      node,
      target: node,
      options: {
        annotationTemplateOverride: options.annotationTemplate,
        autoFixToggle: options.autoFix,
        annotationPlacement: options.annotationPlacement,
      },
    });
  }

  return {
    TSDeclareFunction: handleTSDeclareFunction,
  };
}

/**
 * Build visitor for TypeScript TSMethodSignature nodes.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-TYPESCRIPT-SUPPORT
 */
function buildTSMethodSignatureVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  /**
   * Handle TSMethodSignature nodes.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
   */
  function handleTSMethodSignature(node: any) {
    if (!options.shouldProcessNode(node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED REQ-TYPESCRIPT-SUPPORT
      return;
    }
    const target = resolveTargetNode(sourceCode, node);
    helperReportMissing(context, sourceCode, {
      node,
      target,
      options: {
        annotationTemplateOverride:
          options.methodAnnotationTemplate ?? options.annotationTemplate,
        autoFixToggle: options.autoFix,
        annotationPlacement: options.annotationPlacement,
      },
    });
  }

  return {
    TSMethodSignature: handleTSMethodSignature,
  };
}

/**
 * Build visitor for MethodDefinition nodes.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
function buildMethodDefinitionVisitor(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  /**
   * Handle MethodDefinition nodes (class/object methods).
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
   */
  function handleMethodDefinition(node: any) {
    if (!options.shouldProcessNode(node)) {
      // @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
      return;
    }
    helperReportMethod(context, sourceCode, {
      node,
      options: {
        annotationTemplateOverride:
          options.methodAnnotationTemplate ?? options.annotationTemplate,
        autoFixToggle: options.autoFix,
        annotationPlacement: options.annotationPlacement,
      },
    });
  }

  return {
    MethodDefinition: handleMethodDefinition,
  };
}

/**
 * Build visitor handlers for various function-like AST nodes.
 * Returns merged listener object from smaller builders.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */
export function buildVisitors(
  context: Rule.RuleContext,
  sourceCode: any,
  options: any,
): Rule.RuleListener {
  const fnDecl = buildFunctionDeclarationVisitor(context, sourceCode, options);
  const fnExpr = buildFunctionExpressionVisitor(context, sourceCode, options);
  const arrow = buildArrowFunctionVisitor(context, sourceCode, options);
  const tsDecl = buildTSDeclareFunctionVisitor(context, sourceCode, options);
  const tsSig = buildTSMethodSignatureVisitor(context, sourceCode, options);
  const methodDef = buildMethodDefinitionVisitor(context, sourceCode, options);

  return Object.assign({}, fnDecl, fnExpr, arrow, tsDecl, tsSig, methodDef);
}
