/**
 * Rule to enforce @story annotation on functions, function expressions, arrow functions, and methods
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Require @story annotation on functions
 * @req REQ-OPTIONS-SCOPE - Support configuring which function types to enforce via options
 * @req REQ-EXPORT-PRIORITY - Add exportPriority option to target exported or non-exported
 * @req REQ-UNIFIED-CHECK - Implement unified checkNode for all supported node types
 * @req REQ-FUNCTION-DETECTION - Detect function declarations, expressions, arrow functions, and methods
 * @req REQ-TYPESCRIPT-SUPPORT - Support TypeScript-specific function syntax
 */

/**
 * Determine if a node is exported via export declaration.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-EXPORT-PRIORITY - Determine if function node has export declaration ancestor
 */
function isExportedNode(node: any): boolean {
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

/**
 * Find nearest ancestor node of specified types.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-OPTIONS-SCOPE - Support configuring which function types to enforce via options
 */
function findAncestorNode(node: any, types: string[]): any {
  let current = node.parent;
  while (current) {
    if (types.includes(current.type)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

/**
 * Determine if node should be checked based on scope and exportPriority.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-OPTIONS-SCOPE
 * @req REQ-EXPORT-PRIORITY
 * @req REQ-UNIFIED-CHECK
 */
function shouldCheckNode(
  node: any,
  scope: string[],
  exportPriority: string,
): boolean {
  if (
    node.type === "FunctionExpression" &&
    node.parent?.type === "MethodDefinition"
  ) {
    return false;
  }
  if (!scope.includes(node.type)) {
    return false;
  }
  const exported = isExportedNode(node);
  if (
    (exportPriority === "exported" && !exported) ||
    (exportPriority === "non-exported" && exported)
  ) {
    return false;
  }
  return true;
}

/**
 * Resolve the AST node to annotate or check.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-UNIFIED-CHECK
 */
function resolveTargetNode(sourceCode: any, node: any): any {
  let target: any = node;
  if (node.type === "FunctionDeclaration") {
    const exp = findAncestorNode(node, [
      "ExportNamedDeclaration",
      "ExportDefaultDeclaration",
    ]);
    if (exp) {
      target = exp;
    }
  } else if (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    const exp = findAncestorNode(node, [
      "ExportNamedDeclaration",
      "ExportDefaultDeclaration",
    ]);
    if (exp) {
      target = exp;
    } else {
      const anc = findAncestorNode(node, [
        "VariableDeclaration",
        "ExpressionStatement",
      ]);
      if (anc) {
        target = anc;
      }
    }
  } else if (node.type === "TSMethodSignature") {
    const exp = findAncestorNode(node, ["TSInterfaceDeclaration"]);
    if (exp) {
      target = exp;
    }
  } else if (node.type === "MethodDefinition") {
    target = node;
  }
  return target;
}

/**
 * Check if the target node has @story annotation.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function hasStoryAnnotation(sourceCode: any, target: any): boolean {
  const jsdoc = sourceCode.getJSDocComment(target);
  if (jsdoc?.value.includes("@story")) {
    return true;
  }
  const comments = sourceCode.getCommentsBefore(target) || [];
  return comments.some((c: any) => c.value.includes("@story"));
}

/**
 * Check for @story annotation on function-like nodes.
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-UNIFIED-CHECK
 * @req REQ-ANNOTATION-REQUIRED
 */
function checkStoryAnnotation(
  sourceCode: any,
  context: any,
  node: any,
  scope: string[],
  exportPriority: string,
) {
  if (!shouldCheckNode(node, scope, exportPriority)) {
    return;
  }
  // Special handling for TSMethodSignature: allow annotation on the method itself
  if (node.type === "TSMethodSignature") {
    // If annotated on the method signature, skip
    if (hasStoryAnnotation(sourceCode, node)) {
      return;
    }
    // Otherwise, check on interface declaration
    const intf = resolveTargetNode(sourceCode, node);
    if (hasStoryAnnotation(sourceCode, intf)) {
      return;
    }
    // Missing annotation: report on the interface declaration
    context.report({
      node: intf,
      messageId: "missingStory",
      fix(fixer: any) {
        const indentLevel = intf.loc.start.column;
        const indent = " ".repeat(indentLevel);
        const insertPos = intf.range[0] - indentLevel;
        return fixer.insertTextBeforeRange(
          [insertPos, insertPos],
          `${indent}/** @story <story-file>.story.md */\n`,
        );
      },
    });
    return;
  }
  const target = resolveTargetNode(sourceCode, node);
  if (hasStoryAnnotation(sourceCode, target)) {
    return;
  }
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
                "TSDeclareFunction",
                "TSMethodSignature",
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
      "TSDeclareFunction",
      "TSMethodSignature",
    ];
    const exportPriority = options.exportPriority || "all";

    return {
      FunctionDeclaration(node: any) {
        checkStoryAnnotation(sourceCode, context, node, scope, exportPriority);
      },
      FunctionExpression(node: any) {
        checkStoryAnnotation(sourceCode, context, node, scope, exportPriority);
      },
      ArrowFunctionExpression(node: any) {
        checkStoryAnnotation(sourceCode, context, node, scope, exportPriority);
      },
      MethodDefinition(node: any) {
        checkStoryAnnotation(sourceCode, context, node, scope, exportPriority);
      },

      // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
      // @req REQ-FUNCTION-DETECTION - Detect TS-specific function syntax
      TSDeclareFunction(node: any) {
        checkStoryAnnotation(sourceCode, context, node, scope, exportPriority);
      },
      // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
      // @req REQ-FUNCTION-DETECTION - Detect TS-specific function syntax
      TSMethodSignature(node: any) {
        checkStoryAnnotation(sourceCode, context, node, scope, exportPriority);
      },
    };
  },
} as any;
