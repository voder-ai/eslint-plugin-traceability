import type { Rule } from "eslint";
import { ANNOTATION } from "./require-story-helpers";

/**
 * Create a fixer function that inserts a @story annotation before the target node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix function for missing @story annotations
 */
export function createAddStoryFix(target: any) {
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
    return fixer.insertTextBeforeRange([start, start], `${ANNOTATION}\n`);
  }
  return addStoryFixer;
}

/**
 * Create a fixer function for class method annotations.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
 */
export function createMethodFix(node: any) {
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
    return fixer.insertTextBeforeRange([start, start], `${ANNOTATION}\n  `);
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
  "ArrowFunctionExpression",
  "MethodDefinition",
  "TSMethodSignature",
  "TSDeclareFunction",
  "VariableDeclarator",
];

/**
 * Allowed values for export priority option.
 */
export const EXPORT_PRIORITY_VALUES = ["all", "exported", "non-exported"];

/**
 * Report a missing @story annotation for a general function-like node.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Report missing annotation and provide autofix using createAddStoryFix
 */
export function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
  target?: any,
) {
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-AUTOFIX - Prefer provided sourceCode, fallback to context.getSourceCode()
  const sc = sourceCode || context.getSourceCode();

  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-AUTOFIX - Only attempt to read JSDoc comment if source supports it
   */
  if (typeof sc?.getJSDocComment === "function") {
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - Skip reporting when JSDoc already contains @story
    const js = sc.getJSDocComment(node);
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - If @story present in JSDoc, do not report
    if (js && typeof js.value === "string" && js.value.includes("@story"))
      return;
  }

  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Resolve function name for reporting, default to <unknown>
  const name = node && node.id && node.id.name ? node.id.name : "<unknown>";
  const resolvedTarget = target ?? node;
  context.report({
    node,
    messageId: "missingStory",
    data: { name },
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${ANNOTATION}`,
        fix: createAddStoryFix(resolvedTarget),
      },
    ],
  });
}

/**
 * Report missing @story annotation for methods
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-AUTOFIX - Provide automatic fix for class method annotations
 */
export function reportMethod(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
  target?: any,
) {
  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-ANNOTATION-REQUIRED - Resolve method name for reporting, default to <unknown>
  const name = node && node.key && node.key.name ? node.key.name : "<unknown>";
  context.report({
    node,
    messageId: "missingStory",
    data: { name },
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${ANNOTATION}`,
        fix: createMethodFix(target ?? node),
      },
    ],
  });
}
