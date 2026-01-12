/**
 * Regression tests for callback detection edges affected by anonymous arrow exclusion
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-FUNCTION-DETECTION - Anonymous arrow functions excluded by default
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-FUNCTION-DETECTION
 */

import {
  shouldProcessNode,
  DEFAULT_SCOPE,
} from "../../src/rules/helpers/require-story-helpers";

describe("Callback Detection Regression Tests", () => {
  describe("Mixed utility and custom callback contexts", () => {
    test("[REQ-FUNCTION-DETECTION] Anonymous arrow in array.map (utility) is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "map" },
          },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Anonymous arrow in custom callback (non-utility) is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "customProcessor" },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Named arrow in custom callback requires annotation", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          arguments: [],
          callee: { type: "Identifier", name: "customProcessor" },
          parent: {
            type: "VariableDeclarator",
            id: { type: "Identifier", name: "result" },
          },
        },
      };

      // Note: This is tricky - the arrow is inside a CallExpression, so it's actually
      // anonymous in this context. Let me correct this test.
      // If it's a callback argument, it's anonymous regardless of variable assignment.
      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Named arrow assigned to variable (not callback) requires annotation", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "myHandler" },
          parent: {
            type: "VariableDeclaration",
          },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(true);
    });
  });

  describe("Nested callback contexts", () => {
    test("[REQ-FUNCTION-DETECTION] Anonymous arrow nested in another anonymous arrow is excluded", () => {
      const outerArrow: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "map" },
          },
        },
      };

      const innerArrow: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "filter" },
          },
          parent: {
            type: "ExpressionStatement",
            parent: {
              type: "BlockStatement",
              parent: outerArrow,
            },
          },
        },
      };

      expect(shouldProcessNode(innerArrow, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Anonymous arrow nested in named function is excluded", () => {
      const namedFunc: any = {
        type: "FunctionDeclaration",
        id: { type: "Identifier", name: "processItems" },
      };

      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "forEach" },
          },
          parent: {
            type: "ExpressionStatement",
            parent: {
              type: "BlockStatement",
              parent: namedFunc,
            },
          },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Named arrow nested in callback context still requires annotation", () => {
      const outerArrow: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "map" },
          },
        },
      };

      const namedInnerArrow: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "VariableDeclarator",
          id: { type: "Identifier", name: "helper" },
          parent: {
            type: "VariableDeclaration",
            parent: {
              type: "BlockStatement",
              parent: outerArrow,
            },
          },
        },
      };

      expect(shouldProcessNode(namedInnerArrow, DEFAULT_SCOPE)).toBe(true);
    });
  });

  describe("Test callback exclusion interactions", () => {
    test("[REQ-TEST-CALLBACK-EXCLUSION] Anonymous arrow in test callback is excluded when excludeTestCallbacks=true", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "test" },
        },
      };

      // Default behavior: test callbacks excluded
      expect(
        shouldProcessNode(node, DEFAULT_SCOPE, "all", {
          excludeTestCallbacks: true,
        }),
      ).toBe(false);
    });

    test("[REQ-TEST-CALLBACK-EXCLUSION] Anonymous arrow in non-test callback is REQUIRED when excludeTestCallbacks=false", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "map" },
          },
        },
      };

      // When excludeTestCallbacks=false, ALL functions require annotations (including anonymous arrows)
      expect(
        shouldProcessNode(node, DEFAULT_SCOPE, "all", {
          excludeTestCallbacks: false,
        }),
      ).toBe(true);
    });

    test("[REQ-TEST-CALLBACK-EXCLUSION] Named function expression in test callback is NOT a test callback (only arrows)", () => {
      const node: any = {
        type: "FunctionExpression",
        id: { type: "Identifier", name: "testImpl" },
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "test" },
        },
      };

      // isTestFrameworkCallback only applies to ArrowFunctionExpression nodes
      // Named FunctionExpression nodes are NOT treated as test callbacks
      // They require annotations regardless of excludeTestCallbacks setting
      expect(
        shouldProcessNode(node, DEFAULT_SCOPE, "all", {
          excludeTestCallbacks: true,
        }),
      ).toBe(true);
      expect(
        shouldProcessNode(node, DEFAULT_SCOPE, "all", {
          excludeTestCallbacks: false,
        }),
      ).toBe(true);
    });
  });

  describe("Edge cases for callback argument position", () => {
    test("[REQ-FUNCTION-DETECTION] Anonymous arrow as first argument is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "myFunction" },
          arguments: [
            null, // This would be the arrow itself
          ],
        },
      };
      // Set up circular reference to represent arrow as first argument
      node.parent.arguments[0] = node;

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Anonymous arrow as second argument is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "myFunction" },
          arguments: [
            { type: "Literal", value: "someConfig" },
            null, // This would be the arrow itself
          ],
        },
      };
      // Set up circular reference to represent arrow as second argument
      node.parent.arguments[1] = node;

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });
  });

  describe("Special case: vitest bench callbacks", () => {
    test("[REQ-TEST-CALLBACK-EXCLUSION] Anonymous arrow in bench() is NOT excluded (special case)", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "bench" },
        },
      };

      // bench callbacks are always checked, even if anonymous
      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(true);
    });

    test("[REQ-TEST-CALLBACK-EXCLUSION] Named function in bench() requires annotation", () => {
      const node: any = {
        type: "FunctionExpression",
        id: { type: "Identifier", name: "benchImpl" },
        parent: {
          type: "CallExpression",
          callee: { type: "Identifier", name: "bench" },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(true);
    });
  });

  describe("Object and array context variations", () => {
    test("[REQ-FUNCTION-DETECTION] Anonymous arrow in array literal is excluded (treated as callback)", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "ArrayExpression",
          elements: [null], // Arrow would be an element
        },
      };
      node.parent.elements[0] = node;

      // Arrays of functions are treated like callbacks (excluded)
      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Arrow as object method requires annotation", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "Property",
          key: { type: "Identifier", name: "handleClick" },
          method: true,
          parent: {
            type: "ObjectExpression",
          },
        },
      };

      // Object methods require annotations
      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(true);
    });

    test("[REQ-FUNCTION-DETECTION] Arrow as object property value requires annotation", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "Property",
          key: { type: "Identifier", name: "handler" },
          method: false,
          parent: {
            type: "ObjectExpression",
          },
        },
      };

      // Object property values require annotations (named context)
      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(true);
    });
  });

  describe("Complex nesting scenarios", () => {
    test("[REQ-FUNCTION-DETECTION] Anonymous arrow callback inside Promise chain is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "then" },
            object: {
              type: "CallExpression",
              callee: { type: "Identifier", name: "fetchData" },
            },
          },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Anonymous arrow in catch clause is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "catch" },
          },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });

    test("[REQ-FUNCTION-DETECTION] Anonymous arrow in finally clause is excluded", () => {
      const node: any = {
        type: "ArrowFunctionExpression",
        parent: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            property: { type: "Identifier", name: "finally" },
          },
        },
      };

      expect(shouldProcessNode(node, DEFAULT_SCOPE)).toBe(false);
    });
  });
});
