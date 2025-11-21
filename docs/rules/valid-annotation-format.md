# valid-annotation-format

Validates that `@story` and `@req` annotations follow the correct format and syntax rules to ensure traceability annotations are parseable and standardized.

@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
@req REQ-FORMAT-SPECIFICATION - Define clear format rules for @story and @req annotations
@req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
@req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
@req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns

## Rule Details

This rule scans all comments in the source code and validates any lines that contain `@story` or `@req` annotations. It is designed to be flexible in how it discovers annotations while still enforcing a strict, machine-parseable format.

Key behaviors:

- **Flexible parsing**
  - Works in line (`// ...`), block (`/* ... */`), and JSDoc (`/** ... */`) comments.
  - Annotations can appear anywhere in the comment text, not only at the beginning of the line.
  - Multiple annotations can appear in the same comment block or on the same line.

- **Multiline annotation support**
  - Annotation values may be split across multiple lines within the same block or JSDoc comment.
  - The rule concatenates all lines that belong to the same annotation, removing all internal whitespace characters (spaces, tabs, and newlines) before validating the final value.
  - This allows patterns such as:
    ```js
    /**
     * @story docs/stories/005.0-
     *   DEV-ANNOTATION-VALIDATION.story.md
     */
    ```
    which will be normalized and validated as
    `@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md`.

- **Validated patterns**
  - `@story` paths must match the regex:
    - `^docs/stories/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$`
    - Example of a valid value: `docs/stories/005.0-DEV-EXAMPLE.story.md`
  - `@req` identifiers must match the regex:
    - `^REQ-[A-Z0-9-]+$`
    - Example of a valid value: `REQ-EXAMPLE`

- **Error messages**
  - The rule reports targeted, specific messages depending on what failed:
    - **Missing value**
      - `@story` with no path: e.g. `* @story`
      - `@req` with no identifier: e.g. `// @req`
    - **Invalid story path format**
      - Path present but not matching the required pattern (wrong directory, missing `.story.md`, bad numeric segments, or invalid characters in the name).
      - Example message (from `buildStoryErrorMessage`):
        - `Invalid @story path "foo/bar.story.md". Expected something like "docs/stories/005.0-DEV-EXAMPLE.story.md".`
    - **Invalid requirement ID format**
      - Identifier present but not matching `^REQ-[A-Z0-9-]+$` (e.g. lowercase letters, spaces, or missing `REQ-` prefix).
      - Example message (from `buildReqErrorMessage`):
        - `Invalid @req identifier "Req-foo". Expected something like "REQ-EXAMPLE".`
    - **Extra unexpected tokens**
      - If the annotation token is present but contains malformed structure around it (e.g. multiple `@story` tokens on one line), the rule narrows the reported span to the problematic token and points out the unexpected content.

Violations always include:

- The exact line (and, where possible, column) of the offending annotation.
- Whether the problem is with a `@story` path or a `@req` identifier.
- A short description of what part of the expected format was not met, to make fixes straightforward.

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
if (condition) {
  /* ... */
}
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