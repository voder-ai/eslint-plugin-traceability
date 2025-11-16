# valid-annotation-format

Validates that `@story` and `@req` annotations follow the correct format and syntax rules to ensure traceability annotations are parseable and standardized.

@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
@req REQ-FORMAT-SPECIFICATION - Define clear format rules for @story and @req annotations
@req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
@req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
@req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns

## Rule Details

This rule scans all comments in the source code and checks each line that begins with `@story` or `@req`. It applies regular expressions to verify:

- `@story` paths match the pattern `docs/stories/NN.N-DEV-<NAME>.story.md`
- `@req` identifiers match the pattern `REQ-<UPPERCASE|NUMERIC|DASH>`

Violations report specific messages for invalid story formats or invalid requirement ID formats.

## Examples

#### Correct

```js
/**
 * @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
 * @req REQ-FORMAT-SPECIFICATION
 */
function example() {}

// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
// @req REQ-SYNTAX-VALIDATION
if (condition) { /* ... */ }
```

#### Incorrect

```js
// @story invalid-path
// @req REQ-1234

// @story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story
// @req invalid-req-id

/**
 * @story
 * @req REQ-EXAMPLE
 */
function badExample() {}
```