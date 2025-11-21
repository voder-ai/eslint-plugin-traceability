# require-story-annotation

Enforces the presence of `@story` annotations on function declarations to ensure traceability from code to user stories.

@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md  
@req REQ-ANNOTATION-REQUIRED - Require `@story` annotation on functions

## Rule Details

This rule checks function-like nodes to ensure each has a JSDoc comment containing an `@story` annotation pointing to the relevant story file. Supported node types include TSDeclareFunction and TSMethodSignature in addition to standard function nodes.

### Supported Node Types

- FunctionDeclaration
- FunctionExpression
- MethodDefinition
- TSDeclareFunction
- TSMethodSignature

### Options Schema

This rule accepts a single options object with the following optional properties:

- **scope** (array of strings)
  - Items enum: [
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSDeclareFunction",
    "TSMethodSignature",
    "ArrowFunctionExpression"
    ]
  - Default: [
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSDeclareFunction",
    "TSMethodSignature"
    ]

- **exportPriority** (string)
  - Enum: ["all", "exported", "non-exported"]
  - Default: "all"

Note: `ArrowFunctionExpression` is supported by this rule but is not included in the default scope. To enforce story annotations on arrow functions, add `"ArrowFunctionExpression"` to the `scope` option.

Default:

```js
{
  scope: [
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSDeclareFunction",
    "TSMethodSignature",
  ],
  exportPriority: "all",
}
```

JSON schema:

```json
{
  "type": "object",
  "properties": {
    "scope": {
      "type": "array",
      "items": {
        "enum": [
          "FunctionDeclaration",
          "FunctionExpression",
          "MethodDefinition",
          "TSDeclareFunction",
          "TSMethodSignature",
          "ArrowFunctionExpression"
        ]
      },
      "uniqueItems": true
    },
    "exportPriority": {
      "type": "string",
      "enum": ["all", "exported", "non-exported"]
    }
  },
  "additionalProperties": false
}
```

#### Example Configuration (.eslintrc.js)

```js
module.exports = {
  rules: {
    "traceability/require-story-annotation": [
      "error",
      {
        scope: ["FunctionDeclaration", "ArrowFunctionExpression"],
        exportPriority: "exported",
      },
    ],
  },
};
```

### Examples

#### Correct

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function initAuth() {
  // authentication logic
}
```

#### Incorrect

```js
function initAuth() {
  // authentication logic
}
```

#### TypeScript Specific Examples

##### Correct

```ts
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
declare function initAuth(): void;
```

```ts
interface IAuth {
  /**
   * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
   * @req REQ-ANNOTATION-REQUIRED
   */
  login(user: Credentials): boolean;
}
```

##### Incorrect

```ts
declare function initAuth(): void;
```

```ts
interface IAuth {
  logout(): void;
}
```
