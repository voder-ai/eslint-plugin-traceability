/**
 * Create a fixer function that inserts a @story annotation before the target node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix function for missing @story annotations
 */
export function createAddStoryFix(target: any, annotationTemplate: string) {
  /**
   * Fixer that inserts a @story annotation before the target node.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Provide automatic fix function for missing @story annotations
   */

  function addStoryFixer(fixer: any) {
    const start =
      target && typeof target === "object"
        ? target.parent &&
          (target.parent.type === "ExportNamedDeclaration" ||
            target.parent.type === "ExportDefaultDeclaration") &&
          Array.isArray(target.parent.range) &&
          typeof target.parent.range[0] === "number"
          ? target.parent.range[0]
          : Array.isArray(target.range) && typeof target.range[0] === "number"
            ? target.range[0]
            : 0
        : 0;
    return fixer.insertTextBeforeRange(
      [start, start],
      `${annotationTemplate}\n`,
    );
  }
  return addStoryFixer;
}

/**
 * Create a fixer function for class method annotations.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
 */
export function createMethodFix(node: any, annotationTemplate: string) {
  /**
   * Fixer that inserts a @story annotation before a method node.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
   */

  function methodFixer(fixer: any) {
    const start =
      node && typeof node === "object"
        ? node.parent &&
          (node.parent.type === "ExportNamedDeclaration" ||
            node.parent.type === "ExportDefaultDeclaration") &&
          Array.isArray(node.parent.range) &&
          typeof node.parent.range[0] === "number"
          ? node.parent.range[0]
          : Array.isArray(node.range) && typeof node.range[0] === "number"
            ? node.range[0]
            : 0
        : 0;
    return fixer.insertTextBeforeRange(
      [start, start],
      `${annotationTemplate}\n  `,
    );
  }
  return methodFixer;
}

/**
 * Default set of node types to check for missing @story annotations.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Provide sensible default scope for rule checks
 */
export const DEFAULT_SCOPE: string[] = [
  "FunctionDeclaration",
  "FunctionExpression",
  "MethodDefinition",
  "TSMethodSignature",
  "TSDeclareFunction",
];

/**
 * Path to the story file for function-annotation helpers.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Provide a single source of truth for the canonical story path used by helper modules
 */
export const STORY_PATH =
  "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";

/**
 * Allowed values for export priority option.
 */
export const EXPORT_PRIORITY_VALUES = ["all", "exported", "non-exported"];

import type { Rule } from "eslint";

type CoreReportOptions = {
  annotationTemplateOverride?: string;
  autoFixToggle?: boolean;
};

type ReportDeps = {
  hasStoryAnnotation: (_sourceCode: any, _node: any) => boolean;
  getReportedFunctionName: (_node: any) => string;
  resolveAnnotationTargetNode: (
    _sourceCode: any,
    _node: any,
    _passedTarget: any,
  ) => any;
  getNameNodeForReport: (_node: any) => any;
  buildTemplateConfig: (_options?: CoreReportOptions) => {
    effectiveTemplate: string;
    allowFix: boolean;
  };
  extractName: (_node: any) => string;
  getAnnotationTemplate: (_override?: string) => string;
  shouldApplyAutoFix: (_autoFix: boolean | undefined) => boolean;
  createAddStoryFix: (_target: any, _annotationTemplate: string) => any;
  createMethodFix: (_node: any, _annotationTemplate: string) => any;
};

/**
 * Core helper to report a missing @story annotation for a function-like node.
 * Delegates actual behavior to injected dependencies so higher-level helpers
 * can remain small while sharing error-reporting behavior.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @req REQ-AUTOFIX-MISSING
 * @req REQ-ERROR-SPECIFIC
 */
export function coreReportMissing(
  deps: ReportDeps,
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: CoreReportOptions },
): void {
  const { node, target: passedTarget, options = {} } = config;

  try {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const functionName = deps.getReportedFunctionName(node);
    const resolvedTarget = deps.resolveAnnotationTargetNode(
      sourceCode,
      node,
      passedTarget,
    );
    const nameNode = deps.getNameNodeForReport(node);
    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);
    const name = functionName;

    context.report({
      node: nameNode,
      messageId: "missingStory",
      data: { name, functionName: name },
      fix: allowFix
        ? deps.createAddStoryFix(resolvedTarget, effectiveTemplate)
        : undefined,
      suggest: [
        {
          desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
          fix: deps.createAddStoryFix(resolvedTarget, effectiveTemplate),
        },
      ],
    });
  } catch {
    /* noop */
  }
}

/**
 * Core helper to report a missing @story annotation for a method-like node.
 * Delegates actual behavior to injected dependencies while keeping this
 * module focused on core error-reporting behavior.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
 * @story docs/stories/008.0-DEV-AUTO-FIX.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @req REQ-AUTOFIX-MISSING
 * @req REQ-ERROR-SPECIFIC
 */
export function coreReportMethod(
  deps: ReportDeps,
  context: Rule.RuleContext,
  sourceCode: any,
  config: { node: any; target?: any; options?: CoreReportOptions },
): void {
  const { node, target: passedTarget, options = {} } = config;

  try {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const resolvedTarget =
      passedTarget ?? deps.resolveAnnotationTargetNode(sourceCode, node, null);
    const name = deps.extractName(node);
    const nameNode =
      (node.key && node.key.type === "Identifier" && node.key) || node;

    const effectiveTemplate = deps.getAnnotationTemplate(
      options.annotationTemplateOverride,
    );
    const allowFix = deps.shouldApplyAutoFix(options.autoFixToggle);

    context.report({
      node: nameNode,
      messageId: "missingStory",
      data: { name, functionName: name },
      fix: allowFix
        ? deps.createMethodFix(resolvedTarget, effectiveTemplate)
        : undefined,
      suggest: [
        {
          desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
          fix: deps.createMethodFix(resolvedTarget, effectiveTemplate),
        },
      ],
    });
  } catch {
    /* noop */
  }
}
