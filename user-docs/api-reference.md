# API Reference

Created autonomously by [voder.ai](https://voder.ai).
Applies to eslint-plugin-traceability 1.x releases. For the current published version and detailed changelog, see GitHub Releases: <https://github.com/voder-ai/eslint-plugin-traceability/releases>.

Supported runtime: Node.js >=18.18.0, ESLint ^9.0.0

Security and dependency hygiene for the published package are enforced by the same CI scripts described in the project README (including `npm audit --omit=dev --audit-level=high` and `dry-aged-deps` checks) to prevent known-vulnerable or stale runtime dependencies from being shipped; additional internal review and maintenance practices exist but are out of scope for normal usage of this plugin.

## Rules

Each rule enforces traceability conventions in your code. Below is a summary of each rule exposed by this plugin.

In addition to the core `@story` and `@req` annotations, the plugin also understands `@supports` for code that fulfills requirements from multiple stories—for example, a consuming project might use a path like
`@supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND`
to indicate that a given function supports a particular requirement from a payments story document within that project’s own `docs/stories` tree. For a detailed explanation of `@supports` behavior and validation, see [Migration Guide](migration-guide.md) (section **3.1 Multi-story @supports annotations**). Additional background on multi-story semantics is available in the project’s internal rule documentation, which is intended for maintainers rather than end users.

The `prefer-implements-annotation` rule is an **opt-in migration helper** that is disabled by default and **not** part of any built-in preset. It can be enabled and given a severity like `"warn"` or `"error"` using normal ESLint rule configuration when you want to gradually encourage multi-story `@supports` usage. Detailed behavior and migration guidance are documented in the project’s internal rule documentation, which is targeted at maintainers; typical end users can rely on the high-level guidance in this API reference and the [Migration Guide](migration-guide.md).

### traceability/require-story-annotation

Description: Ensures every function declaration has a JSDoc comment with an `@story` annotation referencing the related user story. When you adopt multi-story `@supports` annotations, this rule also accepts `@supports` as an alternative way to prove story coverage, so either `@story` or at least one `@supports` tag will satisfy the presence check. When run with `--fix`, the rule inserts a single-line placeholder JSDoc `@story` annotation above missing functions, methods, TypeScript declare functions, and interface method signatures using a built-in template aligned with Story 008.0. This template is now configurable on a per-rule basis, and the rule exposes an explicit auto-fix toggle so you can choose between diagnostic-only behavior and automatic placeholder insertion. The default template remains aligned with Story 008.0, but you can now customize it per rule configuration and optionally disable auto-fix entirely when you only want diagnostics without edits.

Options:

- `scope` (string[], optional) – Controls which function-like node types are required to have @story annotations. Allowed values: "FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature". Default: ["FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature"].
- `exportPriority` ("all" | "exported" | "non-exported", optional) – Controls whether the rule checks all functions, only exported ones, or only non-exported ones. Default: "all".
- `annotationTemplate` (string, optional) – Overrides the default placeholder JSDoc used when inserting missing `@story` annotations for functions and non-method constructs. When omitted or blank, the built-in template from Story 008.0 is used.
- `methodAnnotationTemplate` (string, optional) – Overrides the default placeholder JSDoc used when inserting missing `@story` annotations for class methods and TypeScript method signatures. When omitted or blank, falls back to `annotationTemplate` if provided, otherwise the built-in template.
- `autoFix` (boolean, optional) – When set to `false`, disables all automatic fix behavior for this rule while retaining its suggestions and diagnostics. When omitted or `true`, the rule behaves as before, inserting placeholder annotations in `--fix` mode.

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

Description: Ensures that function-like constructs consistently declare their linked requirement using an `@req` annotation in JSDoc. The rule targets the same function-like node types as `traceability/require-story-annotation` (standard function declarations, non-arrow function expressions used as callbacks or assignments, class/object methods, TypeScript declare functions, and interface method signatures), and enforces that each of them has at least one `@req` tag in the nearest associated JSDoc comment. When you adopt multi-story `@supports` annotations, this rule also treats `@supports story-path REQ-ID...` tags as satisfying the requirement coverage check, although deep verification of requirement IDs continues to be handled by `traceability/valid-req-reference`. Arrow functions (`ArrowFunctionExpression`) are not currently checked by this rule.

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

Description: Validates that all traceability annotations (`@story`, `@req`) follow the correct JSDoc or inline comment format. When run with `--fix`, the rule limits changes to safe `@story` path suffix normalization only—for example, adding `.md` when the path ends with `.story`, or adding `.story.md` when the base path has no extension—using targeted replacements implemented in the `getFixedStoryPath` and `reportInvalidStoryFormatWithFix` helpers. It does not change directories, infer new story names, or modify any surrounding comment text or whitespace, in line with Story 008.0; more advanced path normalization strategies and selective toggles to enable or disable specific auto-fix behaviors are not yet implemented. You can also disable this suffix-normalization behavior explicitly via the `autoFix` option when you prefer purely diagnostic checks.

Options:

This rule accepts an optional configuration object. The primary configuration shape is **nested**:

- `story` (object, optional) – Configuration for `@story` values.
  - `pattern` (string, optional) – A JavaScript regular expression **source** (without leading and trailing `/`) that all `@story` values must match. If provided, the rule validates each `@story` against this pattern in addition to its built‑in structural checks. By default, the plugin uses a pattern equivalent to `^docs/stories/[0-9]+\.[0-9]+-DEV-[\w-]+\.story\.md$`, which matches typical project conventions such as `docs/stories/005.0-DEV-EXAMPLE.story.md`; you can override this to match however your own project organizes story files.
  - `example` (string, optional) – A short example `@story` path shown in error messages when `story.pattern` is configured. The built-in default example is `"docs/stories/005.0-DEV-EXAMPLE.story.md"`, intended as a generic illustration of a project story file, and does not refer to this plugin’s internal documentation.
- `req` (object, optional) – Configuration for `@req` values.
  - `pattern` (string, optional) – A JavaScript regular expression **source** (without leading and trailing `/`) that all `@req` values must match. If provided, the rule validates each `@req` identifier against this pattern. Defaults to the value returned by `getDefaultReqPattern()`, which is equivalent to `^REQ-[A-Z0-9-]+$`, matching IDs such as `REQ-USER-AUTH` or `REQ-1234`.
  - `example` (string, optional) – A short example requirement ID shown in error messages when `req.pattern` is configured. Defaults to the value returned by `getDefaultReqExample()`, `"REQ-EXAMPLE"`. This value is used **only** for guidance and does not affect validation.
- `autoFix` (boolean, optional) – When set to `false`, disables all automatic suffix-normalization fixes while keeping validation and error messages intact. When omitted or `true`, the rule continues to apply safe `@story` suffix-only auto-fixes in `--fix` mode.

For backward compatibility, the rule also supports **flat shorthand** fields that map directly to the nested properties:

- `storyPathPattern` (string, optional) – Shorthand for `story.pattern`. If `story.pattern` is provided, it takes precedence over `storyPathPattern`.
- `storyPathExample` (string, optional) – Shorthand for `story.example`. If `story.example` is provided, it takes precedence over `storyPathExample`.
- `requirementIdPattern` (string, optional) – Shorthand for `req.pattern`. If `req.pattern` is provided, it takes precedence over `requirementIdPattern`.
- `requirementIdExample` (string, optional) – Shorthand for `req.example`. If `req.example` is provided, it takes precedence over `requirementIdExample`.

Behavior notes:

- Patterns are compiled with the `u` flag; invalid patterns cause a rule configuration error.
- When options are omitted, the rule behaves exactly as in earlier versions, relying on its built‑in defaults and path‑suffix normalization logic only.
- The pattern checks are additional validation; they do not change the existing auto‑fix behavior, which remains limited to safe `@story` suffix normalization described above.

You can customize these validations to match your own naming conventions by overriding `story.pattern`/`storyPathPattern` and `req.pattern`/`requirementIdPattern`. This is useful when you store stories outside `docs/stories`, avoid `DEV` in filenames, or use a different requirement ID scheme instead of the default `REQ-...` format. Any custom values must still be valid JavaScript regular expression **sources** (without surrounding `/` characters).

#### Migration and mixed usage

The `valid-annotation-format` rule is intentionally **backward compatible** with existing code that only uses `@story` and `@req`. You can:

- Continue using `@story` + `@req` for single-story functions and modules.
- Introduce `@supports` incrementally for integration code that implements requirements from multiple stories.
- Mix both styles in the same comment block when needed; the rule validates the format of each annotation independently.

Deep requirement checking for both `@req` and `@supports` is handled by the `valid-req-reference` rule in the plugin's internal docs. Advanced edge cases and internal semantics are mainly of interest to maintainers; typical end users can rely on the options and examples in this API reference when configuring the rule for their projects.

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

### traceability/require-test-traceability

Description: Enforces traceability conventions in test files by requiring:

- A file-level `@supports` annotation indicating which story and requirement(s) the test file exercises.
- Story references in top-level `describe` blocks.
- Requirement identifiers in `it`/`test` names using a `[REQ-XXX]` prefix.

The rule is designed to complement the function-level rules (such as `require-story-annotation` and `require-req-annotation`) by ensuring that tests explicitly declare which requirements and stories they validate. It is enabled in both the `recommended` and `strict` presets alongside the other core rules. For Story 021.0, this rule also provides targeted auto-fix capabilities: when run with `--fix`, it can (1) insert a safe, non-semantic file-level `@supports` placeholder template at the top of matching test files when the annotation is missing, including clear TODO guidance for humans to replace the template with a real story and requirement reference, and (2) normalize malformed `[REQ-XXX]` prefixes that already contain an identifiable requirement ID, correcting spacing, bracket/parenthesis usage, underscores, and casing while preserving the original ID text and never inventing new requirement identifiers.

Options:

The rule accepts an optional configuration object:

- `testFilePatterns` (string[], optional) – **Path-substring patterns** used to identify test files. For each file, the rule normalizes the file path to use forward slashes and then checks whether it contains at least one of the configured pattern strings. This is intentionally simpler than full glob matching and avoids adding extra runtime dependencies. Defaults to `["/tests/", "/test/", "/__tests__", ".test.", ".spec."]`. For most projects, these defaults behave like "any file under a `tests` or `test` directory, or any file whose name includes `.test.` or `.spec.`". If you prefer a different layout, supply custom substrings that uniquely identify your test files.
- `requireDescribeStory` (boolean, optional) – When `true` (default), requires that each top-level `describe` block include a story reference somewhere in its description text (for example, a path such as `docs/stories/010.0-PAYMENTS.story.md` or a shorter project-specific alias that your team uses consistently).
- `requireTestReqPrefix` (boolean, optional) – When `true` (default), requires each `it`/`test` block name to begin with a requirement identifier in square brackets, such as `[REQ-PAYMENTS-REFUND]`. The exact `REQ-` pattern is shared with the `valid-annotation-format` rule’s requirement ID checks.
- `describePattern` (string, optional) – A JavaScript regular expression **source** (without leading and trailing `/`) that the `describe` description text must match when `requireDescribeStory` is enabled. This lets you enforce a project-specific format such as requiring a canonical story path or a `STORY-` style identifier in the `describe` string. If omitted, the default is equivalent to `"Story [0-9]+\\.[0-9]+"`, which expects the description to include a story label such as `"Story 021.0-DEV-TEST-TRACEABILITY"`. You can override this to instead require full story paths or whatever story-labeling convention your project prefers.
- `autoFixTestTemplate` (boolean, optional) – When `true` (default), allows the rule’s `--fix` mode to insert a file-level `@supports` placeholder template at the top of test files that are missing it. The template is intentionally non-semantic and includes TODO-style guidance so humans can later replace it with a real story path and requirement IDs; disabling this option prevents the rule from inserting the template automatically.
- `autoFixTestPrefixFormat` (boolean, optional) – When `true` (default), enables safe normalization of malformed `[REQ-XXX]` prefixes in `it`/`test` names during `--fix`. The rule only rewrites prefixes that already contain a recognizable requirement identifier and limits changes to formatting concerns (spacing, square brackets vs. parentheses, underscore and dash usage, and letter casing) without fabricating new IDs or guessing requirement names.
- `testSupportsTemplate` (string, optional) – Overrides the default file-level `@supports` placeholder template used when `autoFixTestTemplate` is enabled. This string should be a complete JSDoc-style block (for example, including `/**`, `*`, and `*/`) that encodes your project’s preferred TODO guidance or placeholder story path; it is inserted verbatim at the top of matching test files that lack a `@supports` annotation, and is never interpreted or expanded by the rule.

You can tune these options to fit your own testing and naming conventions: adjust `testFilePatterns` to match your project’s test layout (including monorepos or non-standard folders), override `describePattern` if you prefer full `docs/stories/...` paths or a different story-labeling scheme in `describe` strings, and change `requireTestReqPrefix` and `autoFixTestPrefixFormat` if you want to relax, enforce, or customize the `[REQ-...]` prefix requirements for test names.

Behavior notes:

- The rule only analyzes files whose normalized paths contain at least one of the `testFilePatterns` substrings.
- File-level `@supports` annotations are typically placed in a JSDoc block at the top of the file; the rule checks that at least one `@supports` tag is present and that it includes a story/requirement reference (for example, `@supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND`).
- Top-level `describe` calls (such as `describe("payments refunds docs/stories/010.0-PAYMENTS.story.md", ...)`) are inspected when `requireDescribeStory` is `true`. Their first argument must be a string literal that satisfies `describePattern`.
- Test cases declared via `it(...)` or `test(...)` must use a string literal name beginning with a requirement prefix like `[REQ-PAYMENTS-REFUND]` when `requireTestReqPrefix` is `true`.

Default Severity: `error`

Example:

```javascript
/**
 * @supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND
 */

describe("Refunds flow docs/stories/010.0-PAYMENTS.story.md", () => {
  it("[REQ-PAYMENTS-REFUND] issues refund on successful request", () => {
    // ...
  });

  test("[REQ-PAYMENTS-REFUND-EDGE] handles partial refunds", () => {
    // ...
  });
});
```

## Configuration Presets

The plugin provides two built-in presets for easy configuration:

### recommended

Enables the **six core traceability rules** with severities tuned for common usage (most at `error`, with
`traceability/valid-annotation-format` at `warn` to reduce noise). This `warn` level for `traceability/valid-annotation-format` is intentional to keep early adoption noise low, but you can safely raise it to `error` in projects that want strict enforcement of annotation formatting.

The `prefer-implements-annotation` migration rule is **not included** in this (or any) preset and remains disabled by default. If you want to encourage or enforce multi-story `@supports` annotations, you must enable `traceability/prefer-implements-annotation` explicitly in your ESLint configuration and choose an appropriate severity (for example, `"warn"` during migration or `"error"` once fully adopted).

Core rules enabled by the `recommended` preset:

- `traceability/require-story-annotation`: `error`
- `traceability/require-req-annotation`: `error`
- `traceability/require-branch-annotation`: `error`
- `traceability/valid-annotation-format`: `warn`
- `traceability/valid-story-reference`: `error`
- `traceability/valid-req-reference`: `error`
- `traceability/require-test-traceability`: `error`

Usage:

```javascript
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

### strict

Currently mirrors the **recommended** preset, reserved for future stricter policies. As with the `recommended` preset, the `traceability/prefer-implements-annotation` rule is **not** enabled here by default and must be configured manually if desired.

Usage:

```javascript
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.strict];
```

## Maintenance API and CLI

The plugin exposes a small maintenance API and a companion CLI, `traceability-maint`, for bulk operations on `@story` annotations. These tools are intentionally minimal and focused on stale **story** references only; requirement-level maintenance and more advanced filtering are planned but **not yet implemented**. All maintenance functions operate only on the local filesystem under the provided root directory; they do not make any network calls or interact with external services.

### Programmatic Maintenance API

The maintenance functions are available via the plugin’s `maintenance` export. You can either import the named `maintenance` export directly and destructure the functions you need, or import the default plugin export and access the same functions from `traceability.maintenance`:

```ts
// Option 1: Named `maintenance` export
import { maintenance } from "eslint-plugin-traceability";

const {
  detectStaleAnnotations,
  updateAnnotationReferences,
  batchUpdateAnnotations,
  verifyAnnotations,
  generateMaintenanceReport,
} = maintenance;

// Option 2: Default plugin export
import traceability from "eslint-plugin-traceability";

const {
  detectStaleAnnotations: detectStaleAnnotations2,
  updateAnnotationReferences: updateAnnotationReferences2,
  batchUpdateAnnotations: batchUpdateAnnotations2,
  verifyAnnotations: verifyAnnotations2,
  generateMaintenanceReport: generateMaintenanceReport2,
} = traceability.maintenance;
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

These tools are intentionally minimal and focused on stale **story** references only; requirement-level maintenance and more advanced filtering are planned but **not yet implemented**. The CLI currently focuses on stale `@story` annotations only. It does **not** build or consume a separate index file, and it does not yet support requirement-level maintenance.

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

The CLI follows the same security posture as the rest of the plugin: it does not perform network requests, does not invoke the shell with dynamically constructed input, and limits its effects to the local filesystem under the configured root. Its runtime dependencies are covered by the same `npm audit --omit=dev --audit-level=high` and `dry-aged-deps` checks described in the project README.

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