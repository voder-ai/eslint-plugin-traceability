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

The plugin exposes a small maintenance API and a companion CLI, `traceability-maint`, for bulk operations on `@story` annotations. As of v1.0.5 these tools are intentionally minimal and focused on stale **story** references only; requirement-level maintenance and more advanced filtering are planned but **not yet implemented**.

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

The current maintenance API operates on a **single workspace root** and scans all files beneath that directory. It does not yet accept include/exclude globs or explicit story/requirement lists.

#### `detectStaleAnnotations(rootDir)`

Scans the workspace for `@story` annotations that point to missing or out-of-project story files.

**Parameters:**

- `rootDir` (string, required) – Workspace root to scan. This is resolved against `process.cwd()`.

**Returns:**

- `string[]` – A de-duplicated list of stale story paths exactly as they appear in `@story` annotations.

**Behavior notes:**

- The function recursively walks all files under `rootDir`.
- Story paths that would escape the workspace (e.g., path traversal or unsafe absolute paths) are ignored rather than treated as stale.
- If `rootDir` does not exist or is not a directory, an empty array is returned.

#### `updateAnnotationReferences(rootDir, oldPath, newPath)`

Performs a targeted text replacement of `@story` values across the workspace.

**Parameters:**

- `rootDir` (string, required) – Workspace root to update in-place.
- `oldPath` (string, required) – The story path to search for after `@story`.
- `newPath` (string, required) – The replacement story path.

**Returns:**

- `number` – The count of `@story` annotations that were updated.

**Behavior notes:**

- Only `@story` annotations are modified; `@req` annotations are never changed.
- Files are only written when the content actually changes.
- If `rootDir` does not exist or is not a directory, the function returns `0` without modifying anything.

#### `batchUpdateAnnotations(rootDir, mappings)`

Runs multiple `updateAnnotationReferences` operations in sequence.

**Parameters:**

- `rootDir` (string, required)
- `mappings` (array, required) – Array of objects `{ oldPath: string; newPath: string }`.

**Returns:**

- `number` – The total number of `@story` annotations updated across all mappings.

**Behavior notes:**

- There is no special batching logic; this helper simply loops over the provided mappings.
- For each mapping, it calls `updateAnnotationReferences(rootDir, oldPath, newPath)` and sums the counts.

#### `verifyAnnotations(rootDir)`

Checks whether any stale `@story` annotations exist under the workspace.

**Parameters:**

- `rootDir` (string, required)

**Returns:**

- `boolean` – `true` if **no** stale annotations are found, `false` otherwise.

**Behavior notes:**

- Internally, this function calls `detectStaleAnnotations(rootDir)` and returns `stale.length === 0`.
- Verification is currently limited to story references; requirement IDs are not re-validated here.

#### `generateMaintenanceReport(rootDir)`

Generates a simple, text-only report of stale `@story` annotations.

**Parameters:**

- `rootDir` (string, required)

**Returns:**

- `string` – A newline-separated list of stale story paths, or an empty string if none are found.

**Behavior notes:**

- This function is intentionally simple and is used by the CLI to produce human-readable output.
- It does not write to the filesystem or perform any updates.

### `traceability-maint` CLI

The `traceability-maint` CLI wraps the maintenance API for use in scripts and CI. It is typically available via `npx traceability-maint` or as an npm script.

The CLI currently focuses on stale `@story` annotations only. It does **not** build or consume a separate index file, and it does not yet support requirement-level maintenance.

#### General usage

```bash
traceability-maint <command> [options]
```

Common options:

- `--root <dir>` – Workspace root to scan (defaults to the current working directory).
- `--json` – For commands that support it, emit machine-readable JSON instead of human-readable text.
- `--format <text|json>` – Output format for the `report` command only (default: `text`).
- `--from <oldPath>` – Old story path for the `update` command.
- `--to <newPath>` – New story path for the `update` command.
- `--dry-run` – For `update`, estimate impact without modifying any files.
- `-h`, `--help` – Show command help and exit.

Exit codes:

- `0` – Success (no stale annotations for detection/verification commands, or command completed successfully).
- `1` – Stale or invalid annotations detected.
- `2` – Usage or configuration error (e.g., unknown command, missing required flags).

#### Commands

##### `detect`

Detects `@story` annotations that reference missing story files under the chosen workspace root.

```bash
traceability-maint detect --root .
```

- Output (text):
  - When no stale annotations are found: prints `No stale @story annotations found.`
  - When stale annotations are found: prints each stale story path on its own line, followed by a short summary.
- Output (JSON with `--json`):

  ```json
  {
    "root": "/absolute/path/to/workspace",
    "stale": ["missing.story.md", "old/renamed.story.md"]
  }
  ```

- Exit code:
  - `0` if no stale annotations are found.
  - `1` if any stale annotations are detected.

##### `verify`

Runs a simple verification check using the same logic as `detect` and reports whether any stale `@story` annotations exist.

```bash
traceability-maint verify --root .
```

- Output (text):
  - `All traceability annotations under <root> are valid.` when no stale annotations are found.
  - A short message indicating that stale or invalid annotations were detected, with guidance to run `detect` or `report` for details.
- Exit code:
  - `0` if all annotations pass verification.
  - `1` if any stale annotations are found.

> Note: The `verify` command does **not** currently support `--json` output.

##### `report`

Generates a plain-text or JSON report of stale story references.

```bash
# Human-readable text report (default)
traceability-maint report --root .

# JSON report suitable for CI
traceability-maint report --root . --format json
```

- Output (text, default):
  - When there are no stale annotations: `No stale @story annotations found. Nothing to report.`
  - When stale annotations exist, a small Markdown-style report, including a header and a list of stale story paths.
- Output (JSON with `--format json`):

  ```json
  {
    "root": "/absolute/path/to/workspace",
    "report": "missing.story.md\nold/renamed.story.md"
  }
  ```

- Exit code:
  - Always `0` (report generation is considered successful even when stale annotations are present).

##### `update`

Updates `@story` annotations that reference a specific path.

```bash
# Perform an in-place update
traceability-maint update --root . --from old.path.story.md --to new.path.story.md

# Estimate impact without modifying files
traceability-maint update --root . --from old.path.story.md --to new.path.story.md --dry-run
```

Required options:

- `--from <oldPath>` – The existing story path to replace.
- `--to <newPath>` – The new story path.

Optional options:

- `--root <dir>` – Workspace root (defaults to current directory).
- `--dry-run` – Show an estimated impact without modifying files.
- `--json` – JSON output for both normal and dry-run modes.

Behavior:

- When `--dry-run` is **not** provided, the command:
  - Replaces `@story <oldPath>` with `@story <newPath>` across the workspace.
  - Prints a short summary (or a JSON object with `root`, `from`, `to`, and `updated` fields when `--json` is used).
  - Exits with code `0`.
- When `--dry-run` **is** provided, the command:
  - Does **not** modify any files.
  - Uses `generateMaintenanceReport` to estimate the number of stale annotations before changes.
  - Prints a human-readable summary, or a JSON object of the form:

    ```json
    {
      "mode": "dry-run",
      "root": "/absolute/path/to/workspace",
      "from": "old.path.story.md",
      "to": "new.path.story.md",
      "estimatedStaleCount": 3
    }
    ```

  - Exits with code `0`.

If `--from` or `--to` is missing, the CLI prints an error, shows the help text, and exits with code `2`.

### Minimal CLI integration example

`package.json`:

```json
{
  "scripts": {
    "traceability:detect": "traceability-maint detect --root .",
    "traceability:verify": "traceability-maint verify --root .",
    "traceability:report": "traceability-maint report --root . --format json > traceability-report.json"
  }
}
```

In CI:

```bash
npm run traceability:verify