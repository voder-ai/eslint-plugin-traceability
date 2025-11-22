# valid-req-reference

Enforces that `@req` annotations reference existing requirements in story files and protects against invalid paths.

@story docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
@req REQ-DEEP-PARSE - Parse story files to extract requirement identifiers
@req REQ-DEEP-MATCH - Validate `@req` references against story file content
@req REQ-DEEP-PATH - Protect against path traversal in story paths

## Rule Details

This rule performs deep validation of `@req` annotations by:

- Verifying the referenced story file exists and is within the project directory
- Parsing the story file to extract requirement IDs (e.g., `REQ-XXX-YYY`)
- Ensuring each `@req` annotation matches an extracted requirement ID
- Reporting an `invalidPath` error for paths containing `..` or absolute paths
- Reporting a `reqMissing` error when the requirement ID is not found in the story file

### Options

This rule does not accept any options (schema is `[]`).

## Examples

### Correct

```js
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

### Incorrect: Missing Requirement

```js
// @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-NON-EXISTENT
function initPlugin() {}
```

### Incorrect: Path Traversal

```js
// @story ../docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

### Incorrect: Absolute Path

```js
// @story /absolute/path/docs/stories/001.0-DEV-PLUGIN-SETUP.story.md
// @req REQ-PLUGIN-STRUCTURE
function initPlugin() {}
```

For more details, see the story: docs/stories/010.0-DEV-DEEP-VALIDATION.story.md
