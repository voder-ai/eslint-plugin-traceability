/**
 * Compute the insertion start offset for inserting annotations before a node.
 * This helper ensures we insert before any export wrapper when present, while
 * remaining resilient to malformed or unexpected AST structures.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX
 * @req REQ-AUTOFIX-SAFE
 */
function getInsertionStart(candidate: any): number {
  if (!candidate || typeof candidate !== "object") {
    return 0;
  }

  const parent = candidate.parent;
  if (
    parent &&
    (parent.type === "ExportNamedDeclaration" ||
      parent.type === "ExportDefaultDeclaration") &&
    Array.isArray(parent.range) &&
    typeof parent.range[0] === "number"
  ) {
    return parent.range[0];
  }

  if (
    Array.isArray(candidate.range) &&
    typeof candidate.range[0] === "number"
  ) {
    return candidate.range[0];
  }

  return 0;
}

/**
 * Create a fixer function that inserts a @story annotation before the target node.
 * This fixer is responsible for placing the annotation immediately before the
 * resolved target node in the source code.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix function for missing @story annotations
 */
export function createAddStoryFix(target: any, annotationTemplate: string) {
  /**
   * Fixer that inserts a @story annotation before the target node.
   * This inner fixer is used by ESLint to apply the actual code modification.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Provide automatic fix function for missing @story annotations
   */

  function addStoryFixer(fixer: any) {
    const start = getInsertionStart(target);
    return fixer.insertTextBeforeRange(
      [start, start],
      `${annotationTemplate}\n`,
    );
  }
  return addStoryFixer;
}

/**
 * Create a fixer function for class method annotations.
 * This helper ensures that the @story annotation is inserted with appropriate
 * indentation and placement before a class method declaration.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
 */
export function createMethodFix(node: any, annotationTemplate: string) {
  /**
   * Fixer that inserts a @story annotation before a method node.
   * This inner fixer handles inserting the annotation with method-friendly
   * formatting and spacing.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
   */

  function methodFixer(fixer: any) {
    const start = getInsertionStart(node);
    return fixer.insertTextBeforeRange(
      [start, start],
      `${annotationTemplate}\n  `,
    );
  }
  return methodFixer;
}

/**
 * Default set of node types to check for missing @story annotations.
 * This default scope covers common function-like declarations used in typical
 * TypeScript and JavaScript codebases.
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
 * This constant centralizes the reference to the canonical documentation story
 * used by these helpers.
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
 * Safely execute a reporting operation, swallowing unexpected errors so that
 * traceability rules never break ESLint runs. When TRACEABILITY_DEBUG=1 is
 * set in the environment, a diagnostic message is logged to stderr.
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
 */
function withSafeReporting(label: string, fn: () => void): void {
  try {
    fn();
  } catch (error) {
    if (process.env.TRACEABILITY_DEBUG === "1") {
      // Debug logging only when explicitly enabled for troubleshooting helper failures.
      console.error(
        `[traceability] ${label} failed`,
        (error as Error)?.message ?? error,
      );
    }
  }
}

/**
 * Build the shared ESLint report descriptor for a missing @story annotation.
 * This keeps the core helpers focused on computing names, targets, and
 * templates while centralizing the diagnostic wiring.
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ERROR-SPECIFIC
 * @supports docs/stories/007.0-DEV-ERROR-REPORTING.story.md REQ-ERROR-RESILIENCE
 */
function createMissingStoryReportDescriptor(config: {
  nameNode: any;
  name: string;
  resolvedTarget: any;
  effectiveTemplate: string;
  allowFix: boolean;
  createFix: (_target: any, _annotationTemplate: string) => any;
}) {
  const {
    nameNode,
    name,
    resolvedTarget,
    effectiveTemplate,
    allowFix,
    createFix,
  } = config;

  const baseFix = createFix(resolvedTarget, effectiveTemplate);

  return {
    node: nameNode,
    messageId: "missingStory" as const,
    data: { name, functionName: name },
    fix: allowFix ? baseFix : undefined,
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${effectiveTemplate}`,
        fix: baseFix,
      },
    ],
  };
}

/**
 * Core helper to report a missing @story annotation for a function-like node.
 * This reporting utility delegates behavior to injected dependencies so that
 * higher-level helpers can stay small while sharing error-reporting logic.
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

  withSafeReporting("coreReportMissing", () => {
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

    context.report(
      createMissingStoryReportDescriptor({
        nameNode,
        name,
        resolvedTarget,
        effectiveTemplate,
        allowFix,
        createFix: deps.createAddStoryFix,
      }),
    );
  });
}

/**
 * Core helper to report a missing @story annotation for a method-like node.
 * This method-focused reporting utility uses injected dependencies while
 * keeping this module centered on core error-reporting behavior.
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

  withSafeReporting("coreReportMethod", () => {
    if (deps.hasStoryAnnotation(sourceCode, node)) {
      return;
    }

    const resolvedTarget =
      passedTarget ?? deps.resolveAnnotationTargetNode(sourceCode, node, null);
    const name = deps.extractName(node);
    const nameNode =
      (node.key && node.key.type === "Identifier" && node.key) || node;

    const { effectiveTemplate, allowFix } = deps.buildTemplateConfig(options);

    context.report(
      createMissingStoryReportDescriptor({
        nameNode,
        name,
        resolvedTarget,
        effectiveTemplate,
        allowFix,
        createFix: deps.createMethodFix,
      }),
    );
  });
}
