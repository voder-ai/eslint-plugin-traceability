# valid-req-reference

Enforces that `@req` and `@implements` annotations reference existing requirements in story files and protects against invalid paths.

@story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
@req REQ-DEEP-PARSE - Parse story files to extract requirement identifiers
@req REQ-DEEP-MATCH - Validate `@req` references against story file content
@req REQ-DEEP-PATH - Protect against path traversal in story paths
@story docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md
@req REQ-MULTI-IMPLEMENTS - Support `@implements` annotations that point to multiple story files
@req REQ-MULTI-PATHS - Allow each `@implements` to specify its own story path and requirement list
@req REQ-MULTI-UNIQUENESS - Only require requirement IDs to be unique within a single story file

## Rule Details

This rule performs deep validation of `@req` and `@implements` annotations by:

- Verifying each referenced story file exists and is within the project directory
- Parsing every referenced story file to extract requirement IDs (e.g., `REQ-XXX-YYY`)
- Ensuring each `@req` and `@implements` requirement ID matches an extracted requirement ID in the corresponding story file
- Reporting an `invalidPath` error for paths containing `..` or absolute paths
- Reporting a `reqMissing` error when the requirement ID is not found in the story file
- Treating requirement IDs as scoped to a story file: the same requirement ID may appear in multiple story files without error

### Interaction of `@story`/`@req` and `@implements`

- `@story` sets a default story file path for all subsequent `@req` lines in the same file (until another `@story` is encountered).
- Each `@req` line uses the most recent `@story` path; the rule validates that the requirement exists in that story file.
- Each `@implements` line is self-contained:
  - It specifies its own story path (independent of any preceding `@story`).
  - It may list one or more requirement IDs that are expected to exist in that specific story file.
- The rule validates each requirement ID from `@implements` against the requirements found in the referenced story file.
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

### Correct: Multiple Stories with `@implements`

```js
// @implements docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE REQ-PLUGIN-INIT
// @implements docs/stories/002.0-DEV-PLUGIN-RUNTIME.story.md REQ-PLUGIN-RUNTIME-START REQ-PLUGIN-RUNTIME-STOP
function initPlugin() {}

// Same requirement ID reused in another story file is allowed:
// @implements docs/stories/003.0-DEV-ALT-SETUP.story.md REQ-PLUGIN-STRUCTURE
function altInitPlugin() {}
```

### Incorrect: Missing Requirement with `@req`

```js
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-NON-EXISTENT
function initPlugin() {}
```

### Incorrect: Missing Requirement with `@implements`

```js
// @implements docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-NON-EXISTENT
function initPlugin() {}
```

### Incorrect: Path Traversal

```js
// @story ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

```js
// @implements ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

### Incorrect: Absolute Path

```js
// @story /absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

```js
// @implements /absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

For more details, see the stories:

- docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
- docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md