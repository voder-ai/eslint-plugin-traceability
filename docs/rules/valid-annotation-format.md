# valid-annotation-format

Validates that `@story`, `@req`, and `@implements` annotations follow the correct format and syntax rules to ensure traceability annotations are parseable and standardized.

@story docs/stories/005.0-DEV-ANNOTATION-VALIDATION.story.md
@story docs/stories/010.1-DEV-CONFIGURABLE-PATTERNS.story.md
@story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
@req REQ-FORMAT-SPECIFICATION - Define clear format rules for @story and @req annotations
@req REQ-SYNTAX-VALIDATION - Validate annotation syntax matches specification
@req REQ-PATH-FORMAT - Validate @story paths follow expected patterns
@req REQ-REQ-FORMAT - Validate @req identifiers follow expected patterns

## Rule Details

This rule scans all comments in the source code and validates any lines that contain `@story`, `@req`, or `@implements` annotations. It is designed to be flexible in how it discovers annotations while still enforcing a strict, machine-parseable format.

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

- **`@implements` format support**
  - The rule validates `@implements` annotations that associate code with one or more stories and requirements, such as:
    ```js
    /**
     * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-FOO REQ-BAR
     */
    ```
  - The story path that appears first in an `@implements` annotation is validated using the same story pattern as `@story`.
  - All requirement IDs that follow in the same `@implements` annotation are validated using the same requirement pattern as `@req`.
  - This ensures that multi-story / multi-requirement traceability annotations share the same standardized, machine-parseable formats as standalone `@story` and `@req` annotations.

- **Validated patterns (configurable)**
  - The rule validates:
    - **Story identifiers**: the value that follows `@story` (and the story path segment of `@implements`)
    - **Requirement identifiers**: the value that follows `@req` (and each requirement ID segment of `@implements`)
  - Both patterns are configurable via rule options so that teams can align validation with their own conventions while still keeping annotations machine-parseable.

## Options

The rule supports an optional configuration object. The **primary** configuration shape uses nested `story` and `req` objects, which allow you to configure both the validation pattern and the example used in error messages:

```jsonc
"valid-annotation-format": [
  "error",
  {
    "story": {
      "pattern": "^docs/stories/[0-9]+\\.[0-9]+-DEV-[\\w-]+\\.story\\.md$",
      "example": "docs/stories/005.0-DEV-EXAMPLE.story.md"
    },
    "req": {
      "pattern": "^REQ-[A-Z0-9-]+$",
      "example": "REQ-EXAMPLE"
    }
  }
]
```

All configuration fields are optional; when omitted, the rule falls back to the built-in defaults described below.

The canonical, nested configuration fields are:

- `story.pattern` / `story.example`
- `req.pattern` / `req.example`

For convenience, a **flat shorthand** form is also supported using:

- `storyPathPattern`
- `storyPathExample`
- `requirementIdPattern`
- `requirementIdExample`

These flat fields map directly onto the canonical nested fields. When both nested (`story` / `req`) and flat shorthand fields are provided for the same value, the **nested configuration takes precedence**.

### Nested configuration

Nested configuration is the recommended form and mirrors how the rule internally organizes its helpers.

#### `story`

```jsonc
{
  "story": {
    "pattern": "^docs/stories/[0-9]+\\.[0-9]+-DEV-[\\w-]+\\.story\\.md$",
    "example": "docs/stories/005.0-DEV-EXAMPLE.story.md",
  },
}
```

- `story.pattern`
  - **Type:** `string` (a JavaScript regular expression source, without surrounding slashes)
  - **Purpose:** Defines the allowed format for `@story` values.
  - **Default:** (from `getDefaultStoryPattern()`)
    ```txt
    ^docs/stories/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$
    ```
  - **Default expectation:**
    - Path starts with `docs/stories/`
    - Followed by `<major>.<minor>` numeric version segments (e.g. `005.0`)
    - Followed by `-DEV-`
    - Followed by an uppercase, word-character-and-dash name segment
    - Ends with `.story.md`
  - You can change this to match your own story path / traceability file layout, for example:
    ```jsonc
    {
      "story": {
        "pattern": "^trace/stories/STORY-[0-9]+\\.md$",
        "example": "trace/stories/STORY-123.md",
      },
    }
    ```

- `story.example`
  - **Type:** `string`
  - **Purpose:** Provides a human-readable example that appears in error messages when a `@story` value does not match `story.pattern`.
  - **Default:** (from `getDefaultStoryExample()`)  
    `docs/stories/005.0-DEV-EXAMPLE.story.md`
  - **Behavior:**
    - Not used for validation; only for constructing clearer diagnostics.
    - Should be a single example that matches `story.pattern`.

#### `req`

```jsonc
{
  "req": {
    "pattern": "^REQ-[A-Z0-9-]+$",
    "example": "REQ-EXAMPLE",
  },
}
```

- `req.pattern`
  - **Type:** `string` (a JavaScript regular expression source, without surrounding slashes)
  - **Purpose:** Defines the allowed format for `@req` values.
  - **Default:** (from `getDefaultReqPattern()`)
    ```txt
    ^REQ-[A-Z0-9-]+$
    ```
  - **Default expectation:**
    - Identifier starts with `REQ-`
    - Contains only uppercase letters, digits, and dashes.
  - You can adapt this to your requirement ID scheme, e.g.:
    ```jsonc
    {
      "req": {
        "pattern": "^SYS-[0-9]{4}$",
        "example": "SYS-0001",
      },
    }
    ```

- `req.example`
  - **Type:** `string`
  - **Purpose:** Provides a human-readable example that appears in error messages when a `@req` value does not match `req.pattern`.
  - **Default:** (from `getDefaultReqExample()`)  
    `REQ-EXAMPLE`
  - **Behavior:**
    - Not used for validation; only for diagnostics.
    - Should be a single example that matches `req.pattern`.

### Flat shorthand configuration

Instead of nested `story` / `req` objects, you can configure the same options directly on the rule options object:

```jsonc
"valid-annotation-format": [
  "error",
  {
    "storyPathPattern": "^trace/stories/STORY-[0-9]+\\.md$",
    "storyPathExample": "trace/stories/STORY-123.md",
    "requirementIdPattern": "^SYS-[0-9]{4}$",
    "requirementIdExample": "SYS-0001"
  }
]
```

Flat fields map directly to the canonical nested ones:

- `storyPathPattern` → `story.pattern`
- `storyPathExample` → `story.example`
- `requirementIdPattern` → `req.pattern`
- `requirementIdExample` → `req.example`

If you specify both nested and flat values for the same option, the **nested `story` / `req` values take precedence** over the flat shorthand.

### Invalid configuration

If any of the pattern fields contain an invalid regular expression source—whether provided via nested `story.pattern` / `req.pattern` or via flat shorthand `storyPathPattern` / `requirementIdPattern`—the rule:

- Reports an ESLint configuration diagnostic with `messageId: "invalidRuleConfiguration"`.
- Falls back to the **built-in default** story and/or requirement patterns (`getDefaultStoryPattern()` / `getDefaultReqPattern()`) for actual annotation validation, so that rule execution still proceeds with known-good patterns.

This behavior ensures configuration errors are visible without breaking validation of annotations in your codebase.

## Error messages

The rule reports targeted, specific messages depending on what failed, using the configured patterns and examples where appropriate. Messages are produced via `meta.messages.invalidStoryFormat` / `invalidReqFormat` and the helpers `buildStoryErrorMessage` / `buildReqErrorMessage`.

Examples of the actual runtime messages:

- **Missing story value**
  - When `@story` is present but no path value is provided:
    - `Invalid annotation format: Missing story path for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".`

- **Invalid story identifier format**
  - When a `@story` value is present but does not match `story.pattern`:
    - `Invalid annotation format: Invalid story path "foo/bar.story.md" for @story annotation. Expected a path like "docs/stories/005.0-DEV-EXAMPLE.story.md".`
  - If you configure `story.pattern` / `story.example` (or the corresponding flat shorthand fields), the example in the message will change accordingly.

- **Missing requirement value**
  - When `@req` is present but no identifier value is provided:
    - `Invalid annotation format: Missing requirement ID for @req annotation. Expected an identifier like "REQ-EXAMPLE".`

- **Invalid requirement identifier format**
  - When a `@req` value is present but does not match `req.pattern`:
    - `Invalid annotation format: Invalid requirement ID "Req-foo" for @req annotation. Expected an identifier like "REQ-EXAMPLE" (uppercase letters, numbers, and dashes only).`
  - If you configure `req.pattern` / `req.example` (or the corresponding flat shorthand fields), the example in the message will change accordingly.

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

#### Correct (custom configuration, nested)

```js
/* eslint valid-annotation-format: [
  "error",
  {
    story: {
      pattern: "^trace/stories/STORY-[0-9]+\\.md$",
      example: "trace/stories/STORY-123.md"
    },
    req: {
      pattern: "^SYS-[0-9]{4}$",
      example: "SYS-0001"
    }
  }
] */

/**
 * @story trace/stories/STORY-123.md
 * @req SYS-0001
 */
function configured() {}
```

#### Correct (custom configuration, flat shorthand)

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
function flatConfigured() {}
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

## Migration to `@implements`

The `@implements` annotation is designed to make multi-story integration functions easier to annotate and validate without breaking existing projects. You do **not** need to migrate existing single-story code that already uses `@story` and `@req` correctly, but you can opt in to `@implements` where it adds clarity.

### When you can stay with `@story` + `@req`

Keep using only `@story` + `@req` when:

- A function or class is tied to a **single** story file.
- All of its requirements live in that same story file.
- You are happy to treat that story as the single source of truth for that code path.

Example (no migration required):

```js
/**
 * Calculate age in days since publish date.
 * @story docs/stories/002.0-DEV-FETCH-AVAILABLE-VERSIONS.story.md
 * @req REQ-AGE-CALC
 */
export function calculateAgeInDays(publishDate) {
  // ...
}
```

### When to adopt `@implements`

Use `@implements` when:

- A function or class **implements requirements from multiple stories**.
- Requirements with the **same ID** are reused in more than one story.
- You want each requirement to be explicitly associated with the story file it comes from.

With only `@story` + `@req`, multi-story integration code either:

- Cannot be expressed cleanly at all, or
- Leads to confusing or incorrect deep-validation results when checked by `valid-req-reference`.

`@implements` solves this by letting you list, on a single line, the story file followed by all requirement IDs from that story that the code implements.

### Before: single-story annotations only

A typical "before" example for integration code might try to overload a single story, or avoid deep validation entirely:

```js
/**
 * Apply age and security filters to rows.
 * @story docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md
 * @req REQ-AGE-THRESHOLD
 * @req REQ-OUTPUT
 *
 * // Implicitly also implements security checks from another story,
 * // but there is no clear or validated link here.
 */
export async function applyFilters(rows, options) {
  // combined behavior
}
```

This passes format validation but does **not** clearly show that some behavior comes from a second story, and deep requirement validation cannot reliably tell which story each requirement belongs to.

### After: multi-story `@implements`

With `@implements`, you keep `@story` + `@req` for the primary story (if you want), and add explicit, multi-story mappings:

```js
/**
 * Apply age and security filters to rows.
 * @story docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md
 * @req REQ-AGE-THRESHOLD
 * @req REQ-OUTPUT
 *
 * @implements docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md REQ-AGE-THRESHOLD REQ-OUTPUT
 * @implements docs/stories/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md REQ-AUDIT-CHECK REQ-SAFE-ONLY
 */
export async function applyFilters(rows, options) {
  // combined behavior
}
```

In this form:

- `valid-annotation-format` checks that each `@implements` line uses a valid story path and requirement ID format.
- `valid-req-reference` (see its rule documentation) performs deep validation that every requirement ID listed after `@implements` actually exists in the referenced story file.

### Mixed usage during migration

You can introduce `@implements` **incrementally**:

1. Start from working code that already uses `@story` + `@req`.
2. Add `@implements` lines that group requirements by story file, without removing the original annotations.
3. Run ESLint with `traceability/valid-annotation-format` and `traceability/valid-req-reference` enabled to confirm there are no new violations.
4. Optionally, once your team is comfortable, standardize on always using `@implements` for multi-story integration functions.

Both annotation styles are fully supported:

- Single-story code can continue to use only `@story` + `@req`.
- Multi-story integration code should prefer `@implements` to get precise, per-story validation.

For more details on how `@implements` participates in deep requirement checking, including multi-story scenarios and requirement ID scoping, see the `valid-req-reference` rule documentation and Story `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`.