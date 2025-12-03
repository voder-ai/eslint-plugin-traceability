# prefer-implements-annotation

Optional migration rule that recommends converting legacy `@story` + `@req` annotations to the newer `@implements` format.

@story docs/stories/010.3-DEV-MIGRATE-TO-IMPLEMENTS.story.md  
@req REQ-OPTIONAL-WARNING - Emit configurable recommendation diagnostics for legacy @story/@req usage
@req REQ-MULTI-STORY-DETECT - Detect multi-story patterns and mixed usage that cannot be auto-fixed yet
@req REQ-AUTO-FIX - Provide safe auto-fix support for simple single-story @story + @req blocks
@req REQ-SINGLE-STORY-FIX - Automatically convert single-story @story/@req blocks to @implements
@req REQ-PRESERVE-FORMAT - Preserve surrounding comment structure and non-traceability tags during auto-fix
@req REQ-VALID-OUTPUT - Ensure auto-fixed output always passes existing validation rules
@req REQ-BACKWARDS-COMPAT-VALIDATION - Ensure legacy @story/@req annotations remain valid when the rule is disabled

> Note: Auto-fix is intentionally conservative and only applies to simple, clearly single-story legacy blocks. More complex patterns (multi-story, mixed `@implements`, or unusual formatting) are detected but **not** auto-fixed and will still require manual migration.

## Rule Details

This rule is designed as an **opt-in migration aid** for teams that want to gradually standardize on the `@implements` annotation while keeping existing `@story` + `@req` annotations fully supported.

When enabled, it scans block/JSDoc comments and:

- Detects legacy blocks that contain both `@story` and `@req` but **no** `@implements` lines
- Emits a `preferImplements` recommendation diagnostic for those blocks (and auto-fixes eligible ones to `@implements` when run with `--fix`)
- Detects mixed usage where a single comment combines `@story`/`@req` and `@implements`
- Detects multiple distinct `@story` paths in the same block (likely multi-story integration)

It **does not** change how any of the validation rules behave:

- `valid-annotation-format` continues to validate `@story`, `@req`, and `@implements` formats
- `valid-req-reference` continues to perform deep validation of requirements against story files
- `require-story-annotation` and `require-req-annotation` continue to enforce presence of annotations as before

This separation ensures that turning the rule on/off only affects **recommendations**, not validation correctness.

## Options

The rule currently does not accept any options. You control its behavior with normal ESLint severity configuration:

```js
// eslint.config.js (flat config)
import traceability from "eslint-plugin-traceability";

export default [
  traceability.configs.recommended,
  {
    rules: {
      // Default: off (no recommendations)
      "traceability/prefer-implements-annotation": "off",

      // Or enable as warnings
      // "traceability/prefer-implements-annotation": "warn",

      // Or enforce as errors
      // "traceability/prefer-implements-annotation": "error",
    },
  },
];
```

- `"off"` (default) – rule is disabled; no additional diagnostics
- `"warn"` – surfaces recommendations without failing builds
- `"error"` – treats recommendations as errors for strict migration phases

## Behavior

### Legacy `@story` + `@req` blocks

When the rule encounters a block/JSDoc comment that contains **both** `@story` and `@req` lines and **no** `@implements` lines, it reports:

- **Message ID:** `preferImplements`
- **Text:**
  > Consider using @implements instead of @story + @req for clearer traceability. Run ESLint with --fix to auto-convert.

For simple single-story blocks, running ESLint with `--fix` will automatically rewrite the comment to use `@implements` while preserving the rest of the comment content.

Example (will trigger `preferImplements` and is auto-fixable):

```js
/**
 * Calculate age in days since publish date.
 * @story docs/stories/002.0-DEV-FETCH-AVAILABLE-VERSIONS.story.md
 * @req REQ-AGE-CALC
 */
export function calculateAgeInDays(publishDate) {}
```

Auto-fix output:

```js
/**
 * Calculate age in days since publish date.
 * @implements docs/stories/002.0-DEV-FETCH-AVAILABLE-VERSIONS.story.md REQ-AGE-CALC
 */
export function calculateAgeInDays(publishDate) {}
```

### Auto-fix limitations

Auto-fix is deliberately limited to straightforward cases. It will **not** rewrite:

- Comments with multiple distinct `@story` annotations (multi-story integration blocks)
- Comments that already contain any `@implements` annotations (mixed legacy/modern usage)
- Comments where `@story` or `@req` lines are unusually formatted or split across lines in ways that make the intent ambiguous

In these cases the rule still reports diagnostics, but leaves the comment unchanged so you can migrate it manually.

### Mixed `@story` / `@req` / `@implements` usage

If the rule sees a comment that already contains `@implements` alongside legacy `@story` / `@req`, it cannot know the intended final layout. In this case it reports:

- **Message ID:** `cannotAutoFix`
- **Data:** `{ reason: "comment mixes @story/@req with existing @implements annotations" }`

Example:

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function mixed() {}
```

The rule warns that this block requires **manual** restructuring into clear `@implements` lines.

### Multiple `@story` annotations in a single block

When a single comment block contains more than one distinct `@story` path, the rule treats it as a likely multi-story integration block and reports:

- **Message ID:** `multiStoryDetected`
- **Text:**
  > Multiple @story annotations detected in the same comment block. Manually convert to separate @implements lines.

Example:

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION
 */
function multiStory() {}
```

This is a strong indicator that the code should use separate `@implements` lines for each story.

### What the rule intentionally ignores

To preserve backward compatibility and avoid noisy diagnostics, the rule intentionally **does not** report on:

- Comments that contain only `@story` or only `@req` (no migration opportunity)
- Comments that contain only `@implements` (already in the target format)
- Line comments with annotations (`// @story ...`) – the first iteration focuses on JSDoc/block comments, which are the primary migration targets

Validation for all of these cases remains the responsibility of the existing rules (`valid-annotation-format`, `require-story-annotation`, `require-req-annotation`, `valid-req-reference`).

## Examples

### Correct (rule disabled or satisfied)

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function legacyButValid() {}

/**
 * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function alreadyMigrated() {}
```

### Reported: single-story legacy block

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function legacy() {}
// -> preferImplements (eligible blocks will be auto-fixed to @implements when running with --fix)
```

### Reported: mixed legacy and `@implements`

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @implements docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED
 */
function mixed() {}
// -> cannotAutoFix (manual intervention required)
```

### Reported: multiple distinct `@story` paths

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 * @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
 * @req REQ-BRANCH-DETECTION
 */
function multiStory() {}
// -> multiStoryDetected (multi-story integration needs manual @implements mapping)
```

## Relationship to other rules

- Use `prefer-implements-annotation` to **guide migration** from legacy annotations to `@implements`.
- Use `valid-annotation-format` to enforce syntax and format for `@story`, `@req`, and `@implements`.
- Use `valid-req-reference` to validate that each `@req` and `@implements` requirement ID exists in the referenced story file.
- Keep `require-story-annotation` and `require-req-annotation` enabled to ensure functions remain fully annotated during and after migration.

Together, these rules support a smooth, incremental transition from purely `@story` + `@req` annotations to richer, multi-story `@implements` annotations without breaking existing projects.
