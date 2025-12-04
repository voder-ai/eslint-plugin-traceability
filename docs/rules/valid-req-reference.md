# valid-req-reference

Enforces that `@req` and `@supports` annotations reference existing requirements in story files and protects against invalid paths.

@story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
@req REQ-DEEP-PARSE - Parse story files to extract requirement identifiers
@req REQ-DEEP-MATCH - Validate `@req` references against story file content
@req REQ-DEEP-PATH - Protect against path traversal in story paths
@story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
@req REQ-MULTI-IMPLEMENTS - Support `@supports` annotations that point to multiple story files
@req REQ-MULTI-PATHS - Allow each `@supports` to specify its own story path and requirement list
@req REQ-MULTI-UNIQUENESS - Only require requirement IDs to be unique within a single story file

## Rule Details

This rule performs deep validation of `@req` and `@supports` annotations by:

- Verifying each referenced story file exists and is within the project directory
- Parsing every referenced story file to extract requirement IDs (e.g., `REQ-XXX-YYY`)
- Ensuring each `@req` and each requirement ID listed after `@supports` matches an extracted requirement ID in the corresponding story file
- Reporting an `invalidPath` error for paths containing `..` or absolute paths
- Reporting a `reqMissing` error when the requirement ID is not found in the story file
- Treating requirement IDs as scoped to a story file: the same requirement ID may appear in multiple story files without error

### Interaction of `@story`/`@req` and `@supports`

- `@story` sets a default story file path for all subsequent `@req` lines in the same file (until another `@story` is encountered).
- Each `@req` line uses the most recent `@story` path; the rule validates that the requirement exists in that story file.
- Each `@supports` line is self-contained:
  - It specifies its own story path (independent of any preceding `@story`).
  - It may list one or more requirement IDs that are expected to exist in that specific story file.
- The rule validates each requirement ID from `@supports` against the requirements found in the referenced story file.
- Requirement IDs only need to be unique within a single story file; duplicates across different story files are allowed and validated independently.

### Options

This rule does not accept any options (schema is `[]`).

## Examples

### Correct: Single Story with `@story` and `@req`

```js
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

### Correct: Multiple Stories with `@supports`

```js
// @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-PLUGIN-INIT
// @supports docs/stories/002.0-DEV-PLUGIN-RUNTIME.story.md REQ-PLUGIN-RUNTIME-START REQ-PLUGIN-RUNTIME-STOP
function initPlugin() {}

// Same requirement ID reused in another story file is allowed:
// @supports docs/stories/003.0-DEV-ALT-SETUP.story.md REQ-PLUGIN-STRUCTURE
function altInitPlugin() {}
```

### Incorrect: Missing Requirement with `@req`

```js
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-NON-EXISTENT
function initPlugin() {}
```

### Incorrect: Missing Requirement with `@supports`

```js
// @supports docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-NON-EXISTENT
function initPlugin() {}
```

### Incorrect: Path Traversal

```js
// @story ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

```js
// @supports ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

### Incorrect: Absolute Path

```js
// @story /absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

```js
// @supports /absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

### Migration and multi-story usage

The `valid-req-reference` rule is fully backward compatible with projects that only use `@story` and `@req`. You can keep your existing deep-validation configuration and gradually adopt `@supports` where it adds clarity.

#### Before: deep validation with a single story

In many codebases, deep requirement validation starts with a single story per function:

```js
// @story docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md
// @req REQ-AGE-THRESHOLD
// @req REQ-OUTPUT
export async function applyFilters(rows, options) {
  // combined behavior
}
```

`valid-req-reference` resolves the story file, parses its requirement IDs, and verifies that both `REQ-AGE-THRESHOLD` and `REQ-OUTPUT` exist in that file.

#### After: multi-story deep validation with `@supports`

When the same function genuinely implements requirements from multiple stories, prefer `@supports` to make that relationship explicit:

```js
/**
 * Apply age and security filters to rows.
 * @story docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md
 * @req REQ-AGE-THRESHOLD
 * @req REQ-OUTPUT
 *
 * @supports docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md REQ-AGE-THRESHOLD REQ-OUTPUT
 * @supports docs/stories/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md REQ-AUDIT-CHECK REQ-SAFE-ONLY
 */
export async function applyFilters(rows, options) {
  // combined behavior
}
```

In this form:

- Each `@supports` line is self-contained: it specifies the story file and the list of requirements implemented from that story.
- `valid-req-reference` validates every requirement ID listed after `@supports` against the corresponding story file, using the same parsing and caching logic as for `@req`.
- Requirement IDs only need to be unique within a single story file; you can safely reuse IDs like `REQ-SHARED-ID` in multiple stories and reference each one via its own `@supports` line.

You can mix `@story`/`@req` and `@supports` in the same file during migration. Start from working `@story`/`@req` annotations, add `@supports` lines for multi-story integration functions, and run ESLint with both `traceability/valid-annotation-format` and `traceability/valid-req-reference` enabled to confirm there are no new violations.

For more background and examples, see Story `docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md`.

For more details, see the stories:

- docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
- docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
