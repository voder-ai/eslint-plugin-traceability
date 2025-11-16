# require-req-annotation

Enforces the presence of `@req` annotations on function declarations to ensure each function maps to a specific requirement ID.

@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
@req REQ-ANNOTATION-REQUIRED - Require `@req` annotation on functions

## Rule Details

This rule validates that every function declaration has a JSDoc comment containing an `@req` annotation.

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
