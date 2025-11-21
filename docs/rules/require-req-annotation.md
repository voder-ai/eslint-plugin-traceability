# require-req-annotation

Enforces the presence of `@req` annotations on functions and methods to ensure each implementation maps to a specific requirement ID.

@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
@req REQ-ANNOTATION-REQUIRED - Require `@req` annotation on functions

## Rule Details

This rule validates that the following nodes have a leading JSDoc comment containing an `@req` annotation:

- Function declarations
- Function expressions (including arrow functions)
- Method definitions (class and object methods)
- TypeScript declare functions (`TSDeclareFunction`)
- TypeScript method signatures (`TSMethodSignature`)

By default, this rule uses the same detection scope as `require-story-annotation`, meaning it only checks functions and methods that are considered "in scope" by the same rules (e.g., exported functions when using export‑based scopes).

If a function or method is in scope and does not have a JSDoc with an `@req` tag, it is reported as a violation.

## Options

This rule accepts an options object with the same overall semantics and defaults as `require-story-annotation`, but applied to `@req` detection:

```json
{
  "scope": [
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSDeclareFunction",
    "TSMethodSignature"
  ],
  "exportPriority": "all" | "exported" | "non-exported"
}
```

Both properties are optional.

### `scope`

`scope` is an optional array of node type strings that controls which kinds of function-like nodes are required to have an `@req` annotation.

Allowed values in the array are:

- `"FunctionDeclaration"`
- `"FunctionExpression"`
- `"MethodDefinition"`
- `"TSDeclareFunction"`
- `"TSMethodSignature"`

If `scope` is omitted, the rule defaults to the full set:

```json
{
  "scope": [
    "FunctionDeclaration",
    "FunctionExpression",
    "MethodDefinition",
    "TSDeclareFunction",
    "TSMethodSignature"
  ]
}
```

These semantics and defaults mirror `require-story-annotation`.

### `exportPriority`

`exportPriority` is an optional string that controls which functions/methods are considered in scope based on their export status. It uses the same semantics and defaults as `require-story-annotation`:

- `"all"` (default)  
  Check all nodes of the types listed in `scope`, regardless of export status.

- `"exported"`  
  Check only nodes of the types listed in `scope` that are considered exported.

- `"non-exported"`  
  Check only nodes of the types listed in `scope` that are not considered exported.

If `exportPriority` is omitted, it defaults to `"all"`.

## Examples

### Correct

Function declaration with `@req`:

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function initAuth() {
  // authentication logic
}
```

Function expression with `@req`:

```js
/**
 * @req REQ-ANNOTATION-REQUIRED
 */
const initAuth = function () {
  // authentication logic
};
```

Class method with `@req`:

```js
class AuthService {
  /**
   * @req REQ-ANNOTATION-REQUIRED
   */
  initAuth() {
    // authentication logic
  }
}
```

### Incorrect

Missing `@req` on a function declaration:

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function initAuth() {
  // authentication logic
}
```

Missing `@req` on a function expression:

```js
/**
 * This initializes authentication.
 */
const initAuth = () => {
  // authentication logic
};
```

Missing `@req` on a class method:

```js
class AuthService {
  /**
   * Initializes authentication.
   */
  initAuth() {
    // authentication logic
  }
}
```

### TypeScript Specific Syntax

#### TSDeclareFunction

Incorrect:

```ts
// Missing @req annotation
declare function initAuth(): void;
```

Correct:

```ts
/**
 * @req REQ-ANNOTATION-REQUIRED
 */
declare function initAuth(): void;
```

#### TSMethodSignature

Incorrect:

```ts
// Missing @req annotation on interface method
interface I {
  method(): void;
}
```

Correct:

```ts
/**
 * @req REQ-ANNOTATION-REQUIRED
 */
interface I {
  method(): void;
}
```
