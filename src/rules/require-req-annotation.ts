/****
 * Rule to enforce @req annotation on functions
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @req annotation on functions
 * @req REQ-FUNCTION-DETECTION - Detect function declarations, expressions, arrow functions, and methods
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 */
import { checkReqAnnotation } from "../utils/annotation-checker";
export default {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "Require @req annotations on functions",
      recommended: "error",
    },
    messages: {
      missingReq: "Missing @req annotation",
    },
    schema: [],
  },
  create(context: any) {
    const sourceCode = context.getSourceCode();
    return {
      FunctionDeclaration(node: any) {
        const jsdoc = sourceCode.getJSDocComment(node);
        if (!jsdoc || !jsdoc.value.includes("@req")) {
          context.report({
            node,
            messageId: "missingReq",
            fix(fixer: any) {
              return fixer.insertTextBefore(node, "/** @req <REQ-ID> */\n");
            },
          });
        }
      },
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
       */
      TSDeclareFunction: (node: any) => checkReqAnnotation(context, node),
      /**
       * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
       * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
       */
      TSMethodSignature: (node: any) => checkReqAnnotation(context, node),
    };
  },
} as any;
