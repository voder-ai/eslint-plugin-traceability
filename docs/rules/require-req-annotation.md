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

This rule accepts an options object with the same shape and semantics as `require-story-annotation`, but applied to `@req` detection:

```json
{
  "scope": "all" | "module" | "exports" | "named-exports" | "default-export",
  "exportPriority": "jsdoc" | "syntax"
}
```

If no options are provided, the rule uses the same default `scope` and `exportPriority` as `require-story-annotation`.

### `scope`

Controls which functions/methods must have an `@req` annotation:

- `"all"`  
  Check all detected functions and methods.

- `"module"`  
  Check top-level functions and methods defined in the module (including class methods), regardless of export status.

- `"exports"`  
  Check only functions and methods that are exported from the module (either via syntax exports or via JSDoc, depending on `exportPriority`).

- `"named-exports"`  
  Check only functions and methods that are named exports.

- `"default-export"`  
  Check only the default-exported function or method.

### `exportPriority`

Controls how export status is determined when `scope` is export-based (`"module"` may also use this in implementations that infer exports):

- `"syntax"` (recommended)  
  Use ES module / CommonJS syntax (e.g., `export`, `module.exports`, `exports.foo`) as the source of truth.

- `"jsdoc"`  
  Prefer JSDoc export tags (e.g., `@public`, `@export`) over syntax when deciding if something is exported.

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