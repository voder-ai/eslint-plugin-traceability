/**
 * Tests for: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED - Verify getNodeName resolves names for diverse AST node shapes
 * @supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */

import { getNodeName } from "../../src/rules/helpers/require-story-utils";

describe("Require Story Utils - getNodeName (Story 003.0)", () => {
  it("[REQ-ANNOTATION-REQUIRED] returns identifier name for Identifier and JSXIdentifier", () => {
    const idNode: any = { type: "Identifier", name: "foo" };
    const jsxIdNode: any = { type: "JSXIdentifier", name: "Bar" };
    expect(getNodeName(idNode)).toBe("foo");
    expect(getNodeName(jsxIdNode)).toBe("Bar");
  });

  it("[REQ-ANNOTATION-REQUIRED] returns null for identifier-like nodes without string name", () => {
    const badId: any = { type: "Identifier", name: 123 };
    const badJsxId: any = { type: "JSXIdentifier", name: null };
    expect(getNodeName(badId)).toBeNull();
    expect(getNodeName(badJsxId)).toBeNull();
  });

  it("[REQ-ANNOTATION-REQUIRED] converts simple Literal values into string names", () => {
    const stringLit: any = { type: "Literal", value: "name" };
    const numberLit: any = { type: "Literal", value: 42 };
    const boolLit: any = { type: "Literal", value: true };
    const nullLit: any = { type: "Literal", value: null };
    const objLit: any = { type: "Literal", value: { a: 1 } };

    expect(getNodeName(stringLit)).toBe("name");
    expect(getNodeName(numberLit)).toBe("42");
    expect(getNodeName(boolLit)).toBe("true");
    expect(getNodeName(nullLit)).toBeNull();
    expect(getNodeName(objLit)).toBeNull();
  });

  it("[REQ-ANNOTATION-REQUIRED] resolves simple, expression-free TemplateLiteral names", () => {
    const tplNode: any = {
      type: "TemplateLiteral",
      expressions: [],
      quasis: [
        { value: { cooked: "hello", raw: "hello" } },
        { value: { cooked: "-world", raw: "-world" } },
      ],
    };

    const withExpressions: any = {
      type: "TemplateLiteral",
      expressions: [{}],
      quasis: [{ value: { cooked: "ignored", raw: "ignored" } }],
    };

    expect(getNodeName(tplNode)).toBe("hello-world");
    expect(getNodeName(withExpressions)).toBeNull();
  });

  it("[REQ-ANNOTATION-REQUIRED] resolves non-computed member/qualified names and rejects computed", () => {
    const memberExpr: any = {
      type: "MemberExpression",
      object: { type: "Identifier", name: "obj" },
      property: { type: "Identifier", name: "prop" },
      computed: false,
    };

    const computedMember: any = {
      type: "MemberExpression",
      object: { type: "Identifier", name: "obj" },
      property: { type: "Literal", value: "dynamic" },
      computed: true,
    };

    const tsQualified: any = {
      type: "TSQualifiedName",
      left: { type: "Identifier", name: "Ns" },
      right: { type: "Identifier", name: "Type" },
    };

    const jsxMember: any = {
      type: "JSXMemberExpression",
      object: { type: "JSXIdentifier", name: "Ns" },
      property: { type: "JSXIdentifier", name: "Component" },
    };

    expect(getNodeName(memberExpr)).toBe("prop");
    expect(getNodeName(computedMember)).toBeNull();
    expect(getNodeName(tsQualified)).toBe("Type");
    expect(getNodeName(jsxMember)).toBe("Component");
  });

  it("[REQ-ANNOTATION-REQUIRED] extracts names from Property/ObjectProperty keys", () => {
    const prop: any = {
      type: "Property",
      key: { type: "Identifier", name: "propName" },
    };

    const objProp: any = {
      type: "ObjectProperty",
      key: { type: "Literal", value: "literalKey" },
    };

    const notProp: any = { type: "MethodDefinition", key: { name: "method" } };

    expect(getNodeName(prop)).toBe("propName");
    expect(getNodeName(objProp)).toBe("literalKey");
    expect(getNodeName(notProp)).toBe("method");
  });

  it("[REQ-ANNOTATION-REQUIRED] prefers direct id/key names before deeper inspection", () => {
    const funcNode: any = {
      type: "FunctionDeclaration",
      id: { type: "Identifier", name: "directName" },
      key: { type: "Identifier", name: "ignored" },
    };

    const keyNode: any = {
      type: "MethodDefinition",
      key: { type: "Identifier", name: "keyName" },
    };

    expect(getNodeName(funcNode)).toBe("directName");
    expect(getNodeName(keyNode)).toBe("keyName");
  });

  it("[REQ-ANNOTATION-REQUIRED] unwraps TSLiteralType and JSXNamespacedName wrappers", () => {
    const tsLiteral: any = {
      type: "TSLiteralType",
      literal: { type: "Literal", value: "wrapped" },
    };

    const jsxNamespaced: any = {
      type: "JSXNamespacedName",
      name: { type: "JSXIdentifier", name: "NsComponent" },
    };

    expect(getNodeName(tsLiteral)).toBe("wrapped");
    expect(getNodeName(jsxNamespaced)).toBe("NsComponent");
  });

  it("[REQ-ANNOTATION-REQUIRED] follows generic .key fallback for other shapes", () => {
    const genericWithKey: any = {
      type: "SomeNode",
      key: { type: "Identifier", name: "viaKey" },
    };

    const genericWithoutKey: any = {
      type: "SomeNode",
    };

    expect(getNodeName(genericWithKey)).toBe("viaKey");
    expect(getNodeName(genericWithoutKey)).toBeNull();
  });
});
