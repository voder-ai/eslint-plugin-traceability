/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify helper functions in require-story helpers produce correct fixes and reporting behavior
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
import {
  createAddStoryFix,
  createMethodFix,
} from "../../src/rules/helpers/require-story-core";
import {
  getAnnotationTemplate,
  resolveTargetNode,
  shouldProcessNode,
  linesBeforeHasStory,
  fallbackTextBeforeHasStory,
  parentChainHasStory,
  DEFAULT_SCOPE,
  reportMissing,
} from "../../src/rules/helpers/require-story-helpers";
import { getNodeName } from "../../src/rules/helpers/require-story-utils";

describe("Require Story Helpers (Story 003.0)", () => {
  test("createAddStoryFix uses parent range start when available", () => {
    const target: any = {
      type: "FunctionDeclaration",
      range: [20, 40],
      parent: { type: "ExportNamedDeclaration", range: [10, 50] },
    };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const defaultTemplate = getAnnotationTemplate();
    const fixFn = createAddStoryFix(target, defaultTemplate);
    const result = fixFn(fixer);
    expect(fixer.insertTextBeforeRange).toHaveBeenCalledTimes(1);
    const calledArgs = (fixer.insertTextBeforeRange as jest.Mock).mock.calls[0];
    expect(calledArgs[0]).toEqual([10, 10]);
    expect(typeof calledArgs[1]).toBe("string");
    expect(calledArgs[1].length).toBeGreaterThan(0);
    expect(result).toEqual({ r: [10, 10], t: calledArgs[1] });
  });

  test("createMethodFix falls back to node.range when parent not export", () => {
    const node: any = {
      type: "MethodDefinition",
      range: [30, 60],
      parent: { type: "ClassBody" },
    };
    const fixer = {
      insertTextBeforeRange: jest.fn((r, t) => ({ r, t })),
    } as any;
    const defaultTemplate = getAnnotationTemplate();
    const fixFn = createMethodFix(node, defaultTemplate);
    const res = fixFn(fixer);
    expect((fixer.insertTextBeforeRange as jest.Mock).mock.calls[0][0]).toEqual(
      [30, 30],
    );
    const insertedText = (fixer.insertTextBeforeRange as jest.Mock).mock
      .calls[0][1];
    expect(typeof insertedText).toBe("string");
    expect(insertedText.length).toBeGreaterThan(0);
    expect(res).toEqual({ r: [30, 30], t: insertedText });
  });

  test("reportMissing does not call context.report if JSDoc contains @story", () => {
    const node: any = {
      type: "FunctionDeclaration",
      id: { type: "Identifier", name: "fn" },
      range: [0, 10],
    };
    const fakeSource = {
      getJSDocComment: () => ({
        value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
      }),
      getText: () => "",
    } as any;
    const context: any = {
      getSourceCode: () => fakeSource,
      report: jest.fn(),
    };

    reportMissing(context, fakeSource, { node, target: node });
    expect(context.report).not.toHaveBeenCalled();
  });

  test("reportMissing calls context.report when no JSDoc story present", () => {
    const node: any = {
      type: "FunctionDeclaration",
      id: { type: "Identifier", name: "fn2" },
      range: [0, 10],
    };
    const fakeSource = {
      getJSDocComment: () => null,
      getText: () => "",
    } as any;
    const context: any = {
      getSourceCode: () => fakeSource,
      report: jest.fn(),
    };

    reportMissing(context, fakeSource, { node, target: node });
    expect(context.report).toHaveBeenCalledTimes(1);
    const call = (context.report as jest.Mock).mock.calls[0][0];
    expect(call.node).toBe(node.id);
    expect(call.messageId).toBe("missingStory");
  });

  /**
   * Additional helper tests for story annotations and IO helpers
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED - Verify resolveTargetNode/getNodeName/shouldProcessNode and IO helpers
   */
  test("resolveTargetNode prefers parent when parent is ExportNamedDeclaration", () => {
    const fakeSource: any = { getText: () => "" };
    const node: any = {
      type: "FunctionExpression",
      range: [5, 10],
      parent: { type: "ExportNamedDeclaration", range: [1, 20] },
    };
    const resolved = resolveTargetNode(fakeSource, node);
    expect(resolved).toBe(node.parent);
  });

  test("resolveTargetNode falls back to node when parent is not an export", () => {
    const fakeSource: any = { getText: () => "" };
    const node: any = {
      type: "FunctionDeclaration",
      range: [5, 10],
      parent: { type: "ClassBody", range: [1, 20] },
    };
    const resolved = resolveTargetNode(fakeSource, node);
    expect(resolved).toBe(node);
  });

  test("getNodeName extracts names from common node shapes", () => {
    const funcNode: any = {
      type: "FunctionDeclaration",
      id: { name: "myFunc" },
    };
    const propNode: any = { type: "MethodDefinition", key: { name: "myProp" } };
    expect(getNodeName(funcNode)).toBe("myFunc");
    expect(getNodeName(propNode)).toBe("myProp");
  });

  test("shouldProcessNode returns booleans for typical node types", () => {
    const funcDecl: any = { type: "FunctionDeclaration" };
    const varDecl: any = { type: "VariableDeclaration" };
    expect(shouldProcessNode(funcDecl, DEFAULT_SCOPE)).toBeTruthy();
    expect(shouldProcessNode(varDecl, DEFAULT_SCOPE)).toBeFalsy();
  });

  test("linesBeforeHasStory detects preceding JSDoc story text", () => {
    const jsdoc =
      "/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n";
    const rest = "function fn() {}\n";
    const full = jsdoc + rest;
    const fakeSource: any = {
      getText: () => full,
      getJSDocComment: () => ({
        value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
      }),
      lines: full.split(/\r?\n/),
    };
    const nodeLine =
      fakeSource.lines.findIndex((l: string) =>
        l.includes("function fn() {}"),
      ) + 1;
    const node: any = {
      type: "FunctionDeclaration",
      range: [full.indexOf("function"), full.length],
      loc: { start: { line: nodeLine } },
    };
    const has = linesBeforeHasStory(fakeSource, node);
    expect(has).toBeTruthy();
  });

  test("fallbackTextBeforeHasStory returns boolean when called with source text and range", () => {
    const jsdoc =
      "/**\n * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md\n */\n";
    const rest = "function fnB() {}\n";
    const full = jsdoc + rest;
    const fakeSource: any = {
      getText: () => full,
    };
    const node: any = {
      type: "FunctionDeclaration",
      range: [full.indexOf("function"), full.length],
    };
    const res = fallbackTextBeforeHasStory(fakeSource, node);
    expect(typeof res).toBe("boolean");
    expect(res).toBeTruthy();
  });

  test("parentChainHasStory returns true when ancestors have JSDoc story", () => {
    const fakeSource: any = {
      getCommentsBefore: () => [
        {
          type: "Block",
          value: "@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md",
        },
      ],
    };
    const node: any = {
      type: "Identifier",
      parent: { parent: { type: "ExportNamedDeclaration" } },
    };
    const res = parentChainHasStory(fakeSource, node);
    expect(res).toBeTruthy();
  });

  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-TEST-CALLBACK-EXCLUSION - Verify arrow function test callbacks can be excluded by default
   */
  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as test callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "it" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as beforeEach callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "beforeEach" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as afterEach callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "afterEach" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as beforeAll callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "beforeAll" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as afterAll callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "afterAll" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as suite callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "suite" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as context callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "context" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as specify callback is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "specify" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function used as bench callback is checked by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "bench" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeTruthy();
  });

  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-TEST-CALLBACK-EXCLUSION - Verify arrow function test callbacks are checked when exclusion is disabled
   */
  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow function test callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "it" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] beforeEach arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "beforeEach" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] afterEach arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "afterEach" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] beforeAll arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "beforeAll" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] afterAll arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "afterAll" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] suite arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "suite" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] context arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "context" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] specify arrow function callback is checked when excludeTestCallbacks is false", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "specify" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] bench arrow function callback is always checked (also when excludeTestCallbacks is false)", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "bench" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      excludeTestCallbacks: false,
    });
    expect(result).toBeTruthy();
  });

  /**
   * Additional coverage for nested and helper-wrapped test callbacks.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-TEST-CALLBACK-EXCLUSION - Document how nested and wrapper-based callbacks interact with exclusion logic
   */
  test("[REQ-TEST-CALLBACK-EXCLUSION] Nested anonymous arrow inside it() callback is excluded via nested-function inheritance", () => {
    const outerCallback: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "it" },
      },
    };

    const innerCallback: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "BlockStatement",
        parent: outerCallback,
      },
    };

    // Outer callback is treated as a test framework callback and excluded.
    const outerResult = shouldProcessNode(outerCallback, DEFAULT_SCOPE);
    // Inner anonymous arrow inherits from its nested parent and is also excluded.
    const innerResult = shouldProcessNode(innerCallback, DEFAULT_SCOPE);

    expect(outerResult).toBeFalsy();
    expect(innerResult).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow callback passed to local wrapper around describe() is not treated as a test callback", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "withDescribe" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeTruthy();
  });

  /**
   * Additional coverage for configurable test helper names.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-TEST-CALLBACK-EXCLUSION - Verify additionalTestHelperNames interacts correctly with exclusion logic
   */
  test("[REQ-TEST-CALLBACK-EXCLUSION] Arrow callback passed to configured additionalTestHelperNames helper is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "withTest" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      additionalTestHelperNames: ["withTest"],
    });
    expect(result).toBeFalsy();
  });

  test("[REQ-TEST-CALLBACK-EXCLUSION] bench callback is never excluded even when included in additionalTestHelperNames", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "bench" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE, "all", {
      additionalTestHelperNames: ["bench"],
    });
    expect(result).toBeTruthy();
  });

  /**
   * Comprehensive tests for anonymous vs named arrow function detection.
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-FUNCTION-DETECTION - Anonymous arrows excluded by default, named arrows require annotations
   */
  test("[REQ-FUNCTION-DETECTION] Top-level anonymous arrow callback in array.map is excluded by default", () => {
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

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-FUNCTION-DETECTION] Top-level anonymous arrow callback in array.filter is excluded by default", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          property: { type: "Identifier", name: "filter" },
        },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-FUNCTION-DETECTION] Named arrow function assigned to variable requires annotation", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "handler" },
        parent: {
          type: "VariableDeclaration",
        },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeTruthy();
  });

  test("[REQ-FUNCTION-DETECTION] Named arrow function assigned to const requires annotation", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "processData" },
        parent: {
          type: "VariableDeclaration",
        },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeTruthy();
  });

  test("[REQ-FUNCTION-DETECTION] Nested named arrow function requires annotation", () => {
    const outerFunc: any = {
      type: "FunctionDeclaration",
      id: { type: "Identifier", name: "outer" },
    };

    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: "inner" },
        parent: {
          type: "VariableDeclaration",
          parent: {
            type: "BlockStatement",
            parent: outerFunc,
          },
        },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeTruthy();
  });

  test("[REQ-FUNCTION-DETECTION] Nested anonymous arrow callback is excluded (inherits from parent)", () => {
    const outerFunc: any = {
      type: "FunctionDeclaration",
      id: { type: "Identifier", name: "outer" },
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
          type: "BlockStatement",
          parent: outerFunc,
        },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });

  test("[REQ-FUNCTION-DETECTION] Named arrow as object property value requires annotation", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "Property",
        key: { type: "Identifier", name: "handler" },
        parent: {
          type: "ObjectExpression",
        },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeTruthy();
  });

  test("[REQ-FUNCTION-DETECTION] Anonymous arrow as immediate callback is excluded", () => {
    const node: any = {
      type: "ArrowFunctionExpression",
      parent: {
        type: "CallExpression",
        callee: { type: "Identifier", name: "setTimeout" },
      },
    };

    const result = shouldProcessNode(node, DEFAULT_SCOPE);
    expect(result).toBeFalsy();
  });
});
