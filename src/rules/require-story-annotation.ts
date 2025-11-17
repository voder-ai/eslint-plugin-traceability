/**
 * Rule to enforce @story annotation on functions, function expressions, arrow functions, and methods
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @story annotation on functions
 * @req REQ-OPTIONS-SCOPE - Support configuring which function types to enforce via options
 * @req REQ-EXPORT-PRIORITY - Add exportPriority option to target exported or non-exported
 * @req REQ-UNIFIED-CHECK - Implement unified checkNode for all supported node types
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require @story annotations on selected functions",
      recommended: "error",
    },
    fixable: "code",
    messages: {
      missingStory: "Missing @story annotation (REQ-ANNOTATION-REQUIRED)",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: {
            type: "array",
            items: {
              enum: [
                "FunctionDeclaration",
                "FunctionExpression",
                "ArrowFunctionExpression",
                "MethodDefinition",
              ],
            },
            uniqueItems: true,
          },
          exportPriority: {
            enum: ["all", "exported", "non-exported"],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context: any) {
    const sourceCode = context.getSourceCode();
    const options = context.options[0] || {};
    const scope = options.scope || [
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowFunctionExpression",
      "MethodDefinition",
    ];
    const exportPriority = options.exportPriority || "all";

    function isExported(node: any): boolean {
      let current: any = node;
      while (current) {
        if (
          current.type === "ExportNamedDeclaration" ||
          current.type === "ExportDefaultDeclaration"
        ) {
          return true;
        }
        current = current.parent;
      }
      return false;
    }

    function findAncestor(node: any, types: string[]): any {
      let current = node.parent;
      while (current) {
        if (types.includes(current.type)) {
          return current;
        }
        current = current.parent;
      }
      return null;
    }

    function checkNode(node: any) {
      // Skip nested function expressions inside methods
      if (
        node.type === "FunctionExpression" &&
        node.parent &&
        node.parent.type === "MethodDefinition"
      ) {
        return;
      }
      if (!scope.includes(node.type)) {
        return;
      }
      const exported = isExported(node);
      if (
        (exportPriority === "exported" && !exported) ||
        (exportPriority === "non-exported" && exported)
      ) {
        return;
      }
      let target: any = node;
      if (node.type === "FunctionDeclaration") {
        const parentExport = findAncestor(node, [
          "ExportNamedDeclaration",
          "ExportDefaultDeclaration",
        ]);
        if (parentExport) {
          target = parentExport;
        }
      } else if (
        node.type === "FunctionExpression" ||
        node.type === "ArrowFunctionExpression"
      ) {
        const exportAnc = findAncestor(node, [
          "ExportNamedDeclaration",
          "ExportDefaultDeclaration",
        ]);
        if (exportAnc) {
          target = exportAnc;
        } else {
          const variableAnc = findAncestor(node, [
            "VariableDeclaration",
            "ExpressionStatement",
          ]);
          if (variableAnc) {
            target = variableAnc;
          }
        }
      } else if (node.type === "MethodDefinition") {
        target = node;
      }
      const jsdoc = sourceCode.getJSDocComment(target);
      let hasStory = false;
      if (jsdoc && jsdoc.value.includes("@story")) {
        hasStory = true;
      } else {
        const commentsBefore = sourceCode.getCommentsBefore(target) || [];
        hasStory = commentsBefore.some((comment: any) =>
          comment.value.includes("@story"),
        );
      }
      if (!hasStory) {
        context.report({
          node,
          messageId: "missingStory",
          fix(fixer: any) {
            const indentLevel = target.loc.start.column;
            const indent = " ".repeat(indentLevel);
            const insertPos = target.range[0] - indentLevel;
            return fixer.insertTextBeforeRange(
              [insertPos, insertPos],
              `${indent}/** @story <story-file>.story.md */\n`,
            );
          },
        });
      }
    }

    return {
      FunctionDeclaration: checkNode,
      FunctionExpression: checkNode,
      ArrowFunctionExpression: checkNode,
      MethodDefinition: checkNode,
    };
  },
} as any;
