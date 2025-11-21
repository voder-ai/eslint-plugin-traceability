/****
 * Rule to enforce @req annotation on functions
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @req annotation on functions
 * @req REQ-FUNCTION-DETECTION - Detect function declarations, function expressions, and method definitions (including TypeScript declarations)
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 * @req REQ-CONFIGURABLE-SCOPE - Allow configuration of which exports are checked
 * @req REQ-EXPORT-PRIORITY - Allow configuration of export priority behavior
 */
import type { Rule } from "eslint";
import {
  DEFAULT_SCOPE,
  EXPORT_PRIORITY_VALUES,
  shouldProcessNode,
} from "./helpers/require-story-helpers";
import { checkReqAnnotation } from "../utils/annotation-checker";

type Options = [
  {
    scope?: (typeof DEFAULT_SCOPE)[number][];
    exportPriority?: (typeof EXPORT_PRIORITY_VALUES)[number];
  }?,
];

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "Require @req annotations on function-like exports (declarations, expressions, and methods, excluding arrow functions)",
      recommended: "error",
    },
    messages: {
      /**
       * @story docs/stories/007.0-DEV-ERROR-REPORTING.story.md
       * @req REQ-ERROR-CONSISTENCY - Align missing @req function error with cross-rule conventions
       * @req REQ-ERROR-SPECIFIC - Provide specific function name in error message
       * @req REQ-ERROR-SUGGESTION - Suggest adding a @req annotation with an example identifier
       * @req REQ-ERROR-CONTEXT - Include @req format guidance in the error text
       * @req REQ-ERROR-LOCATION - Report the error at the function identifier location
       * @req REQ-ERROR-SEVERITY - Use ESLint severity level "error" for missing @req annotations
       *
       * This rule uses ESLint's message data placeholders for the function name,
       * specifically the {{name}} placeholder populated via context.report.
       */
      missingReq:
        "Function '{{name}}' is missing a required @req annotation. Add a JSDoc or line comment with @req (for example, '@req REQ-EXAMPLE') referencing the appropriate requirement from the story file.",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: {
            type: "array",
            items: {
              enum: DEFAULT_SCOPE,
            },
            uniqueItems: true,
          },
          exportPriority: {
            enum: EXPORT_PRIORITY_VALUES,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-CREATE-HOOK - Provide create(context) hook for rule behavior
   * @req REQ-FUNCTION-DETECTION - Detect function declarations, function expressions, and method definitions (including TS-specific nodes)
   * @req REQ-CONFIGURABLE-SCOPE - Respect configurable scope of which exports are checked
   * @req REQ-EXPORT-PRIORITY - Respect configurable export priority when determining which nodes to check
   */
  create(context: Rule.RuleContext): Rule.RuleListener {
    const options: Options[0] = context.options?.[0] ?? {};
    const rawScope = options?.scope;
    const scope =
      Array.isArray(rawScope) && rawScope.length > 0 ? rawScope : DEFAULT_SCOPE;
    const exportPriority = options?.exportPriority ?? "all";

    const shouldCheck = (node: any): boolean =>
      shouldProcessNode(node, scope, exportPriority);

    /**
     * Helper to conditionally run the annotation check only when the node
     * should be processed according to scope/exportPriority.
     */
    const runCheck = (node: any) => {
      if (!shouldCheck(node)) return;
      checkReqAnnotation(context, node, { enableFix: false });
    };

    return {
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-FUNCTION-DETECTION - Detect function declarations
       * @req REQ-ANNOTATION-REQUIRED - Enforce @req annotation on function declarations
       */
      FunctionDeclaration(node) {
        runCheck(node);
      },
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-FUNCTION-DETECTION - Detect function expressions
       * @req REQ-ANNOTATION-REQUIRED - Enforce @req annotation on function expressions
       */
      FunctionExpression(node: any) {
        if (node.parent && node.parent.type === "MethodDefinition") {
          return;
        }
        runCheck(node);
      },
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-FUNCTION-DETECTION - Detect method definitions
       * @req REQ-ANNOTATION-REQUIRED - Enforce @req annotation on method definitions
       */
      MethodDefinition(node) {
        runCheck(node);
      },
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript declare functions
       * @req REQ-ANNOTATION-REQUIRED - Enforce @req annotation on TS declare functions
       */
      TSDeclareFunction(node: any) {
        runCheck(node);
      },
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript method signatures
       * @req REQ-ANNOTATION-REQUIRED - Enforce @req annotation on TS method signatures
       */
      TSMethodSignature(node: any) {
        runCheck(node);
      },
    };
  },
};

export default rule;
