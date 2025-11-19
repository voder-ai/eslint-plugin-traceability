import type { Rule } from "eslint";

// Default node types to check for function annotations
const DEFAULT_SCOPE = [
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
  "MethodDefinition",
  "TSDeclareFunction",
  "TSMethodSignature",
];
const EXPORT_PRIORITY_VALUES = ["all", "exported", "non-exported"];

/**
 * Determine if a node is in an export declaration
 */
function isExportedNode(node: any): boolean {
  let p = node.parent;
  while (p) {
    if (
      p.type === "ExportNamedDeclaration" ||
      p.type === "ExportDefaultDeclaration"
    ) {
      return true;
    }
    p = p.parent;
  }
  return false;
}

// Path to the story file for annotations
const STORY_PATH = "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md";
const ANNOTATION = `/** @story ${STORY_PATH} */`;

/**
 * Check if @story annotation already present in JSDoc or preceding comments
 */
function hasStoryAnnotation(sourceCode: any, node: any): boolean {
  const jsdoc = sourceCode.getJSDocComment(node);
  if (jsdoc?.value.includes("@story")) {
    return true;
  }
  const comments = sourceCode.getCommentsBefore(node) || [];
  return comments.some((c: any) => c.value.includes("@story"));
}

/**
 * Get the name of the function-like node
 */
function getNodeName(node: any): string {
  let current: any = node;
  while (current) {
    if (
      current.type === "VariableDeclarator" &&
      current.id &&
      typeof current.id.name === "string"
    ) {
      return current.id.name;
    }
    if (
      (current.type === "FunctionDeclaration" ||
        current.type === "TSDeclareFunction") &&
      current.id &&
      typeof current.id.name === "string"
    ) {
      return current.id.name;
    }
    if (
      (current.type === "MethodDefinition" ||
        current.type === "TSMethodSignature") &&
      current.key &&
      typeof current.key.name === "string"
    ) {
      return current.key.name;
    }
    current = current.parent;
  }
  return "<unknown>";
}

/**
 * Determine AST node where annotation should be inserted
 */
function resolveTargetNode(sourceCode: any, node: any): any {
  if (node.type === "TSMethodSignature") {
    // Interface method signature -> insert on interface
    return node.parent.parent;
  }
  if (
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    const parent = node.parent;
    if (parent.type === "VariableDeclarator") {
      const varDecl = parent.parent;
      if (varDecl.parent && varDecl.parent.type === "ExportNamedDeclaration") {
        return varDecl.parent;
      }
      return varDecl;
    }
    if (parent.type === "ExportNamedDeclaration") {
      return parent;
    }
    if (parent.type === "ExpressionStatement") {
      return parent;
    }
  }
  return node;
}

/**
 * Report missing @story annotation on function or method
 */
function reportMissing(
  context: Rule.RuleContext,
  sourceCode: any,
  node: any,
  target: any,
) {
  if (
    hasStoryAnnotation(sourceCode, node) ||
    hasStoryAnnotation(sourceCode, target)
  ) {
    return;
  }
  let name = getNodeName(node);
  if (node.type === "TSDeclareFunction" && node.id && node.id.name) {
    name = node.id.name;
  }
  context.report({
    node,
    messageId: "missingStory",
    data: { name },
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${name}', e.g., ${ANNOTATION}`,
        fix: (fixer: any) => fixer.insertTextBefore(target, `${ANNOTATION}\n`),
      },
    ],
  });
}

/**
 * Report missing @story annotation on class methods
 */
function reportMethod(context: Rule.RuleContext, sourceCode: any, node: any) {
  if (hasStoryAnnotation(sourceCode, node)) {
    return;
  }
  context.report({
    node,
    messageId: "missingStory",
    data: { name: getNodeName(node) },
    suggest: [
      {
        desc: `Add JSDoc @story annotation for function '${getNodeName(node)}', e.g., ${ANNOTATION}`,
        fix: (fixer: any) => fixer.insertTextBefore(node, `${ANNOTATION}\n  `),
      },
    ],
  });
}

/**
 * Check if this node is within scope and matches exportPriority
 */
function shouldProcessNode(
  node: any,
  scope: string[],
  exportPriority: string,
): boolean {
  if (!scope.includes(node.type)) {
    return false;
  }
  const exported = isExportedNode(node);
  if (exportPriority === "exported" && !exported) {
    return false;
  }
  if (exportPriority === "non-exported" && exported) {
    return false;
  }
  return true;
}

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Require @story annotations on functions",
      recommended: "error",
    },
    hasSuggestions: true,
    messages: {
      missingStory: "Missing @story annotation (REQ-ANNOTATION-REQUIRED)",
    },
    schema: [
      {
        type: "object",
        properties: {
          scope: {
            type: "array",
            items: { type: "string", enum: DEFAULT_SCOPE },
            uniqueItems: true,
          },
          exportPriority: { type: "string", enum: EXPORT_PRIORITY_VALUES },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    const opts =
      context.options[0] ||
      ({} as { scope?: string[]; exportPriority?: string });
    const scope = opts.scope || DEFAULT_SCOPE;
    const exportPriority = opts.exportPriority || "all";

    return {
      FunctionDeclaration(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        let target = node;
        if (
          node.parent &&
          (node.parent.type === "ExportNamedDeclaration" ||
            node.parent.type === "ExportDefaultDeclaration")
        ) {
          target = node.parent;
        }
        reportMissing(context, sourceCode, node, target);
      },

      FunctionExpression(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        if (node.parent && node.parent.type === "MethodDefinition") return;
        const target = resolveTargetNode(sourceCode, node);
        reportMissing(context, sourceCode, node, target);
      },

      ArrowFunctionExpression(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        const target = resolveTargetNode(sourceCode, node);
        reportMissing(context, sourceCode, node, target);
      },

      TSDeclareFunction(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        reportMissing(context, sourceCode, node, node);
      },

      TSMethodSignature(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        const target = resolveTargetNode(sourceCode, node);
        reportMissing(context, sourceCode, node, target);
      },

      MethodDefinition(node: any) {
        if (!shouldProcessNode(node, scope, exportPriority)) return;
        reportMethod(context, sourceCode, node);
      },
    };
  },
};

export default rule;
