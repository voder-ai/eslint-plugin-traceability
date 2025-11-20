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
    return fixer.insertTextBefore(target, `${ANNOTATION}\n`);
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
    return fixer.insertTextBefore(node, `${ANNOTATION}\n  `);
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

  // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
  // @req REQ-AUTOFIX - Only attempt to read JSDoc comment if source supports it
  if (typeof sc?.getJSDocComment === "function") {
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED - If JSDoc already contains @story, do not report
    const js = sc.getJSDocComment(node);
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
