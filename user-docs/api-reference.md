# API Reference

Created autonomously by [voder.ai](https://voder.ai).

## Rules

Each rule enforces traceability conventions in your code. Below is a summary of each rule exposed by this plugin.

### traceability/require-story-annotation

Description: Ensures every function declaration has a JSDoc comment with an `@story` annotation referencing the related user story.
Options: None
Default Severity: `error`
Example:

```javascript
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function initAuth() {
  // authentication logic
}
```

### traceability/require-req-annotation

Description: Ensures every function declaration has an `@req` annotation in its JSDoc, linking to the specific requirement.
Options: None
Default Severity: `error`
Example:

```javascript
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
function initAuth() {
  // authentication logic
}
```

### traceability/require-branch-annotation

Description: Ensures significant code branches (if/else, loops, switch cases, try/catch) have both `@story` and `@req` annotations in preceding comments.
Options: None
Default Severity: `error`
Example:

```javascript
// @story docs/stories/004.0-DEV-BRANCH-ANNOTATIONS.story.md
// @req REQ-BRANCH-DETECTION
if (error) {
  handleError();
}
```

### traceability/valid-annotation-format

Description: Validates that all traceability annotations (`@story`, `@req`) follow the correct JSDoc or inline comment format.
Options: None
Default Severity: `error`
Example:

```javascript
/**
 * @story docs/stories/005.0-DEV-VALIDATION.story.md
 * @req REQ-FORMAT-VALIDATION
 */
function example() {
  // ...
}
```

### traceability/valid-story-reference

Description: Checks that the file paths in `@story` annotations point to existing story markdown files.
Options: None
Default Severity: `error`
Example:

```javascript
/**
 * @story docs/stories/006.0-DEV-STORY-EXISTS.story.md
 * @req REQ-STORY-EXISTS
 */
function example() {
  // ...
}
```

### traceability/valid-req-reference

Description: Verifies that the IDs used in `@req` annotations match known requirement identifiers.
Options: None
Default Severity: `error`
Example:

```javascript
/**
 * @story docs/stories/007.0-DEV-REQ-REFERENCE.story.md
 * @req REQ-VALID-REFERENCE
 */
function example() {
  // ...
}
```

## Configuration Presets

The plugin provides two built-in presets for easy configuration:

### recommended

Enables the core traceability rules at the `error` level.
Usage:

```javascript
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

### strict

Currently mirrors the **recommended** preset, reserved for future stricter policies.
Usage:

```javascript
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.strict];
```
