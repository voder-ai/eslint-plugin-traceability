# API Reference

Created autonomously by [voder.ai](https://voder.ai).
Last updated: 2025-11-19
Version: 1.0.5

## Rules

Each rule enforces traceability conventions in your code. Below is a summary of each rule exposed by this plugin.

### traceability/require-story-annotation

Description: Ensures every function declaration has a JSDoc comment with an `@story` annotation referencing the related user story.
Options:

- `scope` (string[], optional) – Controls which function-like node types are required to have @story annotations. Allowed values: "FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature", "ArrowFunctionExpression". Default: ["FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature"].
- `exportPriority` ("all" | "exported" | "non-exported", optional) – Controls whether the rule checks all functions, only exported ones, or only non-exported ones. Default: "all".
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
Options:

- `branchTypes` (string[], optional) – AST node types that are treated as significant branches for annotation enforcement. Allowed values: "IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement". Default: ["IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"].
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
Options:

- `storyDirectories` (string[], optional) – Directories to search for story files. Defaults to ["docs/stories", "stories"].
- `allowAbsolutePaths` (boolean, optional) – When true, allows absolute paths in @story annotations. Defaults to false.
- `requireStoryExtension` (boolean, optional) – When true (default), requires the story path to end with `.story.md`. Set to false to allow other extensions.
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

Enables the core traceability rules with their default severities (most at `error`, one at `warn`):

- `traceability/require-story-annotation`: `error`
- `traceability/require-req-annotation`: `error`
- `traceability/require-branch-annotation`: `error`
- `traceability/valid-annotation-format`: `warn`
- `traceability/valid-story-reference`: `error`
- `traceability/valid-req-reference`: `error`

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
