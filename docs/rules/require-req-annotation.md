# require-req-annotation

Enforces the presence of `@req` annotations on function declarations to ensure each function maps to a specific requirement ID.

@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
@req REQ-ANNOTATION-REQUIRED - Require `@req` annotation on functions

## Rule Details

This rule validates that every function declaration (including TypeScript-specific function syntax such as TSDeclareFunction and TSMethodSignature) has a JSDoc comment containing an `@req` annotation.

### Options Schema

This rule does not accept any options (schema is `[]`).

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
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 */
function initAuth() {
  // authentication logic
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
