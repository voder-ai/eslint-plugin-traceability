# valid-annotation-format

Validates that `@story` and `@req` annotations follow the correct format and syntax rules to ensure traceability annotations are parseable and standardized.

@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
@story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
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

- **Validated patterns (configurable)**
  - The rule validates:
    - **Story identifiers**: the value that follows `@story`
    - **Requirement identifiers**: the value that follows `@req`
  - Both patterns are configurable via rule options so that teams can align validation with their own conventions while still keeping annotations machine-parseable.

## Options

The rule supports an optional configuration object:

```jsonc
"valid-annotation-format": [
  "error",
  {
    "storyPathPattern": "^docs/stories/[0-9]+\\.[0-9]+-DEV-[\\w-]+\\.story\\.md$",
    "storyPathExample": "docs/stories/005.0-DEV-EXAMPLE.story.md",
    "requirementIdPattern": "^REQ-[A-Z0-9-]+$",
    "requirementIdExample": "REQ-EXAMPLE"
  }
]
```

All options are optional; when omitted, the rule falls back to the defaults listed below.

### `storyPathPattern`

- **Type:** `string` (a JavaScript regular expression source, without surrounding slashes)
- **Purpose:** Defines the allowed format for `@story` values.
- **Default:**
  ```txt
  ^docs/stories/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$
  ```
- **Default expectation:**
  - Path starts with `docs/stories/`
  - Followed by `<major>.<minor>` numeric version segments (e.g. `005.0`)
  - Followed by `-DEV-`
  - Followed by an uppercase, word-character-and-dash name segment
  - Ends with `.story.md`
- **Default example:** `docs/stories/005.0-DEV-EXAMPLE.story.md`

You can change this to match your own story path / traceability file layout, for example:

```jsonc
{
  "storyPathPattern": "^trace/stories/STORY-[0-9]+\\.md$",
  "storyPathExample": "trace/stories/STORY-123.md"
}
```

### `storyPathExample`

- **Type:** `string`
- **Purpose:** Provides a human-readable example that appears in error messages when a `@story` value does not match `storyPathPattern`.
- **Default:** `docs/stories/005.0-DEV-EXAMPLE.story.md`
- **Behavior:**
  - Not used for validation; only for constructing clearer diagnostics.
  - Should be a single example that matches `storyPathPattern`.

### `requirementIdPattern`

- **Type:** `string` (a JavaScript regular expression source, without surrounding slashes)
- **Purpose:** Defines the allowed format for `@req` values.
- **Default:**
  ```txt
  ^REQ-[A-Z0-9-]+$
  ```
- **Default expectation:**
  - Identifier starts with `REQ-`
  - Contains only uppercase letters, digits, and dashes.
- **Default example:** `REQ-EXAMPLE`

You can adapt this to your requirement ID scheme, e.g.:

```jsonc
{
  "requirementIdPattern": "^SYS-[0-9]{4}$",
  "requirementIdExample": "SYS-0001"
}
```

### `requirementIdExample`

- **Type:** `string`
- **Purpose:** Provides a human-readable example that appears in error messages when a `@req` value does not match `requirementIdPattern`.
- **Default:** `REQ-EXAMPLE`
- **Behavior:**
  - Not used for validation; only for diagnostics.
  - Should be a single example that matches `requirementIdPattern`.

## Error messages

The rule reports targeted, specific messages depending on what failed, using the configured patterns and examples where appropriate.

- **Missing value**
  - `@story` with no value: e.g. `* @story`
  - `@req` with no value: e.g. `// @req`

- **Invalid story identifier format**
  - A `@story` value is present but does not match `storyPathPattern`.
  - Example message (using the default configuration and `buildStoryErrorMessage`):
    - `Invalid @story path "foo/bar.story.md". Expected something like "docs/stories/005.0-DEV-EXAMPLE.story.md".`
  - If you configure `storyPathPattern` / `storyPathExample`, the example in the message will change accordingly.

- **Invalid requirement identifier format**
  - A `@req` value is present but does not match `requirementIdPattern`.
  - Example message (using the default configuration and `buildReqErrorMessage`):
    - `Invalid @req identifier "Req-foo". Expected something like "REQ-EXAMPLE".`
  - If you configure `requirementIdPattern` / `requirementIdExample`, the example in the message will change accordingly.

- **Extra unexpected tokens**
  - If the annotation token is present but contains malformed structure around it (e.g. multiple `@story` tokens on one line or stray tokens attached to the identifier), the rule narrows the reported span to the problematic token and points out the unexpected content.

Violations always include:

- The exact line (and, where possible, column) of the offending annotation.
- Whether the problem is with a `@story` value or a `@req` value.
- A short description of what part of the expected format was not met, to make fixes straightforward.

## Examples

#### Correct (default configuration)

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

#### Correct (custom configuration)

```js
/* eslint valid-annotation-format: [
  "error",
  {
    storyPathPattern: "^trace/stories/STORY-[0-9]+\\.md$",
    storyPathExample: "trace/stories/STORY-123.md",
    requirementIdPattern: "^SYS-[0-9]{4}$",
    requirementIdExample: "SYS-0001"
  }
] */

/**
 * @story trace/stories/STORY-123.md
 * @req SYS-0001
 */
function configured() {}
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