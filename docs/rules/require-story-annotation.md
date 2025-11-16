# require-story-annotation

Enforces the presence of `@story` annotations on function declarations to ensure traceability from code to user stories.

@story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
@req REQ-ANNOTATION-REQUIRED - Require `@story` annotation on functions

## Rule Details

This rule validates that every function declaration has a JSDoc comment containing an `@story` annotation pointing to the relevant story file.

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
function initAuth() {
  // authentication logic
}
```
