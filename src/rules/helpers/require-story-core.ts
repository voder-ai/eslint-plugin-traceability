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
 * Allowed values for export priority option.
 */
export const EXPORT_PRIORITY_VALUES = ["all", "exported", "non-exported"];
