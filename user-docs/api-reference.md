# API Reference

Created autonomously by [voder.ai](https://voder.ai).
Last updated: 2025-11-19
Version: 1.0.5

## Rules

Each rule enforces traceability conventions in your code. Below is a summary of each rule exposed by this plugin.

### traceability/require-story-annotation

Description: Ensures every function declaration has a JSDoc comment with an `@story` annotation referencing the related user story. When run with `--fix`, the rule inserts a single-line placeholder JSDoc `@story` annotation above missing functions, methods, TypeScript declare functions, and interface method signatures using a built-in template aligned with Story 008.0. This template is currently fixed but structured for future configurability, and fixes are strictly limited to adding this placeholder annotation without altering the function body or changing any runtime behavior. Selective enabling of different auto-fix behaviors (such as applying fixes only to certain scopes or node types) is planned for a future version.

Options:

- `scope` (string[], optional) – Controls which function-like node types are required to have @story annotations. Allowed values: "FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature". Default: ["FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature"].
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

Description: Ensures that function-like constructs consistently declare their linked requirement using an `@req` annotation in JSDoc. The rule targets the same function-like node types as `traceability/require-story-annotation` (standard function declarations, non-arrow function expressions used as callbacks or assignments, class/object methods, TypeScript declare functions, and interface method signatures), and enforces that each of them has at least one `@req` tag in the nearest associated JSDoc comment. Arrow functions (`ArrowFunctionExpression`) are not currently checked by this rule.

This rule is typically used alongside `traceability/require-story-annotation` so that each function-level traceability block includes both an `@story` and an `@req` annotation, but it can also be enabled independently if you only want to enforce requirement linkage. Unlike `traceability/require-story-annotation`, this rule does not currently provide an auto-fix mode for inserting placeholder `@req` annotations; it only reports missing or malformed requirement annotations on the configured scopes.

Options:

- `scope` (string[], optional) – Controls which function-like node types are required to have @req annotations. Allowed values: "FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature". Default: ["FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature"].
- `exportPriority` ("all" | "exported" | "non-exported", optional) – Controls whether the rule checks all functions, only exported ones, or only non-exported ones. Default: "all".

Default Severity: `error`
Example (with both `@story` and `@req`, as typically used when both rules are enabled):

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

- `branchTypes` (string[], optional) – AST node types that are treated as significant branches for annotation enforcement. Allowed values: "IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement". Default: ["IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"]. If an invalid branch type is provided, the rule reports a configuration error for each invalid value.

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

Description: Validates that all traceability annotations (`@story`, `@req`) follow the correct JSDoc or inline comment format. When run with `--fix`, the rule limits changes to safe `@story` path suffix normalization only—for example, adding `.md` when the path ends with `.story`, or adding `.story.md` when the base path has no extension—using targeted replacements implemented in the `getFixedStoryPath` and `reportInvalidStoryFormatWithFix` helpers. It does not change directories, infer new story names, or modify any surrounding comment text or whitespace, in line with Story 008.0; more advanced path normalization strategies and selective toggles to enable or disable specific auto-fix behaviors are not yet implemented.

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
Configure rule behavior using an options object with these properties:

- `storyDirectories` (string[], optional) – One or more directories (relative to the project root) to search for story files. Defaults to `["docs/stories", "stories"]`.
- `allowAbsolutePaths` (boolean, optional) – When `true`, allows absolute story paths (e.g., `/absolute/path/to/story.story.md`). Defaults to `false`.
- `requireStoryExtension` (boolean, optional) – When `true` (default), requires the story path to end with `.story.md`. Set to `false` to allow other extensions.

Example configuration:

```json
{
  "rules": {
    "traceability/valid-story-reference": [
      "error",
      {
        "storyDirectories": ["docs/stories", "stories"],
        "allowAbsolutePaths": false,
        "requireStoryExtension": true
      }
    ]
  }
}
```

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

Enables the core traceability rules with severities tuned for common usage (most at `error`, with
`traceability/valid-annotation-format` at `warn` to reduce noise):

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

## Maintenance API and CLI

The plugin exposes a small maintenance API and a companion CLI, `traceability-maint`, for bulk operations on traceability annotations. These utilities are intended for scripted maintenance and CI workflows rather than runtime use.

### Programmatic Maintenance API

All functions are exported from the plugin’s maintenance module:

```ts
import {
  detectStaleAnnotations,
  updateAnnotationReferences,
  batchUpdateAnnotations,
  verifyAnnotations,
  generateMaintenanceReport,
} from "eslint-plugin-traceability/maintenance";
```

#### `detectStaleAnnotations(options)`

Scans one or more source roots for `@story` and `@req` annotations that point to missing or deprecated artifacts.

**Parameters:**

- `options` (object, required):
  - `rootDir` (string, required) – Project root to scan from.
  - `include` (string[] | undefined) – Glob patterns for included files (default: `["**/*.{js,jsx,ts,tsx}"]`).
  - `exclude` (string[] | undefined) – Glob patterns to ignore (e.g., `["**/dist/**", "**/node_modules/**"]`).
  - `storyDirectories` (string[] | undefined) – Overrides for story lookup directories (see `valid-story-reference`).
  - `knownRequirements` (string[] | undefined) – Optional explicit list of valid requirement IDs.

**Returns:**

- Promise resolving to:

```ts
{
  staleStories: Array<{
    file: string;
    line: number;
    storyPath: string;
    reason: "MISSING" | "DEPRECATED";
  }>;
  staleRequirements: Array<{
    file: string;
    line: number;
    requirementId: string;
    reason: "UNKNOWN" | "DEPRECATED";
  }>;
}
```

#### `updateAnnotationReferences(options)`

Performs targeted updates of `@story` and/or `@req` values according to mapping rules.

**Parameters:**

- `options` (object, required):
  - `rootDir` (string, required)
  - `storyMap` (Record<string, string> | undefined) – Mapping from old story paths to new paths.
  - `reqMap` (Record<string, string> | undefined) – Mapping from old requirement IDs to new IDs.
  - `dryRun` (boolean | undefined) – If `true`, no files are written; the function only reports potential changes (default: `false`).
  - `include`, `exclude` (string[] | undefined) – Glob patterns as in `detectStaleAnnotations`.

**Returns:**

- Promise resolving to:

```ts
{
  filesTouched: number;
  changes: Array<{
    file: string;
    line: number;
    kind: "story" | "req";
    from: string;
    to: string;
  }>;
  dryRun: boolean;
}
```

#### `batchUpdateAnnotations(options)`

Higher-level helper that combines detection and updates in a single call, suitable for bulk migrations.

**Parameters:**

- `options` (object, required):
  - `rootDir` (string, required)
  - `strategy` ("stories" | "requirements" | "all") – Which annotations to operate on.
  - `storyMap`, `reqMap` (as in `updateAnnotationReferences`)
  - `dryRun` (boolean | undefined)
  - `include`, `exclude` (string[] | undefined)

**Returns:**

- Promise resolving to:

```ts
{
  summary: {
    filesScanned: number;
    filesTouched: number;
    storyUpdates: number;
    reqUpdates: number;
  };
  details: {
    updates: Array<{
      file: string;
      line: number;
      kind: "story" | "req";
      from: string;
      to: string;
    }>;
  };
  dryRun: boolean;
}
```

#### `verifyAnnotations(options)`

Runs the equivalent of the core traceability rules over the specified files and returns a machine-readable result suitable for CI checks.

**Parameters:**

- `options` (object, required):
  - `rootDir` (string, required)
  - `include`, `exclude` (string[] | undefined)
  - `storyDirectories` (string[] | undefined)
  - `knownRequirements` (string[] | undefined)

**Returns:**

- Promise resolving to:

```ts
{
  ok: boolean; // false if any violations are present
  violations: Array<{
    file: string;
    line: number;
    ruleId:
      | "traceability/require-story-annotation"
      | "traceability/require-req-annotation"
      | "traceability/require-branch-annotation"
      | "traceability/valid-annotation-format"
      | "traceability/valid-story-reference"
      | "traceability/valid-req-reference";
    message: string;
    severity: "error" | "warn";
  }>;
}
```

#### `generateMaintenanceReport(options)`

Generates an aggregated report combining stale references, verification results, and basic statistics.

**Parameters:**

- `options` (object, required):
  - `rootDir` (string, required)
  - `include`, `exclude` (string[] | undefined)
  - `storyDirectories` (string[] | undefined)
  - `knownRequirements` (string[] | undefined)
  - `format` ("json" | "text" | "markdown" | undefined) – Output format (default: `"json"`).

**Returns:**

- Promise resolving to:

```ts
{
  format: "json" | "text" | "markdown";
  report: string; // serialized report in the requested format
  stats: {
    filesScanned: number;
    staleStories: number;
    staleRequirements: number;
    violations: number;
  };
}
```

### `traceability-maint` CLI

The `traceability-maint` CLI wraps the maintenance API for use in scripts and CI. It is typically available via `npx traceability-maint` or as an npm script.

#### General usage

```bash
traceability-maint <command> [options]
```

Common options:

- `--root <path>` – Project root (default: current working directory).
- `--include <globs>` – Comma-separated include patterns.
- `--exclude <globs>` – Comma-separated exclude patterns.
- `--stories <dirs>` – Comma-separated story directories.
- `--req-file <path>` – JSON file containing an array of valid requirement IDs.
- `--dry-run` – Perform a dry run without modifying files (where applicable).
- `--format <json|text|markdown>` – Report format (for reporting commands).

All commands exit with:

- Exit code `0` on success (no violations for verification-type commands).
- Exit code `1` on validation failure, stale references detected, or if any update operation fails.
- Exit code `2` on configuration or usage errors (e.g., missing or unreadable files).

#### Commands

##### `detect-stale`

Detects annotations referencing non-existent or deprecated stories/requirements.

```bash
traceability-maint detect-stale --root . --stories docs/stories
```

- Output: JSON or text summary to stdout (controlled by `--format`).
- Exit code:
  - `0` if no stale annotations are found.
  - `1` if any stale story or requirement is detected.

##### `update-references`

Applies mapping files to update `@story` and/or `@req` annotations.

```bash
traceability-maint update-references \
  --root . \
  --story-map ./scripts/story-map.json \
  --req-map ./scripts/req-map.json \
  --dry-run
```

Options:

- `--story-map <path>` – JSON object mapping old story paths to new paths.
- `--req-map <path>` – JSON object mapping old requirement IDs to new IDs.
- `--dry-run` – Report planned changes without writing files.

Exit code:

- `0` if the command completes successfully.
- `1` if any file update fails or input mapping files are invalid.

##### `batch-update`

Higher-level batch operation that combines detection and updates.

```bash
traceability-maint batch-update \
  --root . \
  --strategy all \
  --story-map ./scripts/story-map.json \
  --req-map ./scripts/req-map.json
```

Options:

- `--strategy <stories|requirements|all>` – Type of annotations to update.
- `--story-map`, `--req-map`, `--dry-run` – As in `update-references`.

Exit code:

- `0` on success.
- `1` if any update fails.

##### `verify`

Runs the traceability rules in verification mode (read-only).

```bash
traceability-maint verify --root . --stories docs/stories --req-file ./reqs.json
```

Exit code:

- `0` if all files pass verification.
- `1` if any violations are found.

##### `report`

Generates a consolidated maintenance report.

```bash
traceability-maint report --root . --format markdown > traceability-report.md
```

Options:

- `--format <json|text|markdown>` – Output format (default: `json`).

Exit code:

- `0` on success.
- `1` if generation fails (e.g., scan errors).

### Minimal CLI example

`package.json`:

```json
{
  "scripts": {
    "traceability:verify": "traceability-maint verify --root . --stories docs/stories --req-file ./requirements.json",
    "traceability:report": "traceability-maint report --root . --format markdown > traceability-report.md"
  }
}
```

In CI:

```bash
npm run traceability:verify