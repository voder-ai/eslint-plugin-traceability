# require-branch-annotation

Ensures that significant code branches (if/else, switch cases, loops, try/catch) have `@story` and `@req` annotations for traceability.

@story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
@req REQ-BRANCH-DETECTION - Detect significant code branches for traceability annotations

## Rule Details

This rule checks for JSDoc or inline comments immediately preceding significant code branches and ensures both `@story` and `@req` annotations are present.

### Options Schema

This rule does not accept any options (schema is `[]`).

### Examples

#### Correct

```js
// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (error) {
  handleError();
}
```

#### Incorrect

```js
if (error) {
  handleError();
}
```
