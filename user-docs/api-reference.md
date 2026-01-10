# API Reference

Created autonomously by [voder.ai](https://voder.ai).
Applies to eslint-plugin-traceability 1.x releases. For the current published version and detailed changelog, see GitHub Releases: <https://github.com/voder-ai/eslint-plugin-traceability/releases>.

Supported runtime: Node.js >=18.18.0, ESLint ^9.0.0

Security and dependency hygiene for the published package are enforced by the same CI scripts described in the project README (including `npm audit --omit=dev --audit-level=high` and `dry-aged-deps` checks) to prevent known-vulnerable or stale runtime dependencies from being shipped; additional internal review and maintenance practices exist but are out of scope for normal usage of this plugin.

## Rules

Each rule enforces traceability conventions in your code. Below is a summary of each rule exposed by this plugin.

For function-level traceability, new configurations should treat `traceability/require-traceability` as the **canonical** rule: it composes both story and requirement checks and understands both the newer `@supports` style and the legacy `@story` / `@req` pairing. The older keys `traceability/require-story-annotation` and `traceability/require-req-annotation` remain available as **backward-compatible aliases** so existing configs keep working, but they are no longer the primary entry points and are mainly useful when you need to tune severities independently. For new and multi-story scenarios, prefer `@supports` annotations; `@story` and `@req` remain valid and are still appropriate for simple single-story code paths where a consolidated `@supports` tag is not yet required.

In addition to the core `@story` and `@req` annotations, the plugin also understands `@supports` for code that fulfills requirements from multiple stories—for example, a consuming project might use a path like
`@supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND`
to indicate that a given function supports a particular requirement from a payments story document within that project’s own `docs/stories` tree. For a detailed explanation of `@supports` behavior and validation, see [Migration Guide](migration-guide.md) (section **3.1 Multi-story @supports annotations**). Additional background on multi-story semantics is available in the project’s internal rule documentation, which is intended for maintainers rather than end users.

The `prefer-supports-annotation` rule is an **opt-in migration helper** that is disabled by default and **not** part of any built-in preset. It can be enabled and given a severity like `"warn"` or `"error"` using normal ESLint rule configuration when you want to gradually encourage multi-story `@supports` usage. The legacy rule key `traceability/prefer-implements-annotation` remains available as a **deprecated alias** for backward compatibility, but new configurations should prefer `traceability/prefer-supports-annotation`. Detailed behavior and migration guidance are documented in the project’s internal rule documentation, which is targeted for maintainers; typical end users can rely on the high-level guidance in this API reference and the [Migration Guide](migration-guide.md).

### Function-level rules overview

For function-level traceability, the plugin exposes a unified rule and two legacy keys:

- `traceability/require-traceability` is the **canonical function-level rule** for new configurations. It ensures functions and methods have both story coverage and requirement coverage, and it accepts either `@supports` (preferred) or legacy `@story` / `@req` annotations.
- `traceability/require-story-annotation` and `traceability/require-req-annotation` are **backward-compatible aliases** that focus on the story and requirement aspects separately. They are retained for existing configurations and share the same underlying implementation model as the unified rule, but new ESLint configs should normally rely on `traceability/require-traceability` rather than enabling these legacy keys directly.

All three rule keys can still be configured individually if you need fine-grained control (for example, to tune severities separately), but the recommended and strict presets enable `traceability/require-traceability` by default and keep the legacy keys primarily for projects that adopted them before the unified rule existed. Current releases support `annotationPlacement` on both the branch-level rule and the function-level rules, so you can standardize on inside-brace placement for if/else/try/catch/switch/function/loop blocks. When you leave `annotationPlacement` unspecified, all rules default to the historical before-function/before-branch behavior for backward compatibility.

### traceability/require-traceability

Description: Unified function-level traceability rule that composes the behavior of `traceability/require-story-annotation` and `traceability/require-req-annotation`. When enabled, it enforces that in‑scope functions and methods carry both a story reference (`@story` or an equivalent `@supports` tag) and at least one requirement reference (`@req` or, when configured, `@supports`). The recommended flat‑config presets in this plugin enable `traceability/require-traceability` by default alongside the legacy rule keys for backward compatibility, so that existing configurations referring to `traceability/require-story-annotation` or `traceability/require-req-annotation` continue to work without change.

### traceability/require-story-annotation

Description: **Legacy function-level key:** This rule key is retained for backward compatibility and conceptually composes the same checks as `traceability/require-traceability`. New configurations should normally enable `traceability/require-traceability` instead and rely on this key only when you need to tune it independently. Ensures every function declaration has a traceability annotation, preferring `@supports` for story coverage while still accepting legacy `@story` annotations referencing the related user story. When you adopt multi-story `@supports` annotations, this rule also accepts `@supports` as an alternative way to prove story coverage, so either `@story` or at least one `@supports` tag will satisfy the presence check. When run with `--fix`, the rule inserts a single-line placeholder JSDoc `@story` annotation above missing functions, methods, TypeScript declare functions, and interface method signatures using a built-in template aligned with Story 008.0. This template is now configurable on a per-rule basis, and the rule exposes an explicit auto-fix toggle so you can choose between diagnostic-only behavior and automatic placeholder insertion. The default template remains aligned with Story 008.0, but you can now customize it per rule configuration and optionally disable auto-fix entirely when you only want diagnostics without edits.

Options:

- `scope` (string[], optional) – Controls which function-like node types are required to have @story annotations. Allowed values: "FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature". Default: ["FunctionDeclaration", "FunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature"].
- `exportPriority` ("all" | "exported" | "non-exported", optional) – Controls whether the rule checks all functions, only exported ones, or only non-exported ones. Default: "all".
- `annotationTemplate` (string, optional) – Overrides the default placeholder JSDoc used when inserting missing `@story` annotations for functions and non-method constructs. When omitted or blank, the built-in template from Story 008.0 is used.
- `methodAnnotationTemplate` (string, optional) – Overrides the default placeholder JSDoc used when inserting missing `@story` annotations for class methods and TypeScript method signatures. When omitted or blank, falls back to `annotationTemplate` if provided, otherwise the built-in template.
- `autoFix` (boolean, optional) – When set to `false`, disables all automatic fix behavior for this rule while retaining its suggestions and diagnostics. When omitted or `true`, the rule behaves as before, inserting placeholder annotations in `--fix` mode.
- `excludeTestCallbacks` (boolean, optional) – When `true` (default), excludes anonymous arrow functions that are direct callbacks to common test framework functions (for example, Jest/Mocha/Vitest `describe`/`it`/`test`/`beforeEach`/`afterEach`/`beforeAll`/`afterAll`, plus focused/skipped/concurrent variants such as `fdescribe`, `xdescribe`, `fit`, `xit`, `test.concurrent`, `describe.concurrent`) from function-level annotation requirements. This assumes those test files are already covered by file-level `@supports` annotations and `traceability/require-test-traceability`. When set to `false`, these callbacks are treated like any other arrow function and must be annotated when in-scope.
- `annotationPlacement` ("before" | "inside", optional)  Controls whether the rule treats before-function comments as the source of annotations (`"before"`, the default and backward-compatible behavior) or instead requires annotations as the first comment-only lines inside function and method bodies (`"inside"`). In `"inside"` mode, JSDoc and before-function comments are ignored for block-bodied functions and methods, and only inside-body comments are considered; declaration-only nodes (e.g., TS signatures) continue to use before-node annotations.

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

Among the supported scopes, anonymous callbacks passed directly to common test framework functions are excluded from annotation requirements by default via `excludeTestCallbacks`; projects that prefer stricter enforcement for these callbacks can disable this exclusion by setting `excludeTestCallbacks: false` in their rule configuration.

### traceability/require-req-annotation

Description: **Legacy function-level key:** This rule key is retained for backward compatibility and conceptually composes the same checks as `traceability/require-traceability`. New configurations should normally enable `traceability/require-traceability` instead and rely on this key only when you need to tune it independently. Ensures that function-like constructs consistently declare their linked requirements via traceability annotations, preferring `@supports` when possible while still accepting `@req`. The rule targets the same function-like node types as `traceability/require-story-annotation` (standard function declarations, function expressions, arrow functions, class/object methods, TypeScript declare functions, and interface method signatures), and enforces that each of them has at least one `@req` tag in the nearest associated JSDoc comment. When you adopt multi-story `@supports` annotations, this rule also treats `@supports story-path REQ-ID...` tags as satisfying the requirement coverage check, although deep verification of requirement IDs continues to be handled by `traceability/valid-req-reference`.

This rule is typically used alongside `traceability/require-story-annotation` so that each function-level traceability block includes both an `@story` and an `@req` annotation, but it can also be enabled independently if you only want to enforce requirement linkage. Unlike `traceability/require-story-annotation`, this rule does not currently provide an auto-fix mode for inserting placeholder `@req` annotations; it only reports missing or malformed requirement annotations on the configured scopes.

Options:

- `scope` (string[], optional) – Controls which function-like node types are required to have @req annotations. Allowed values: "FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature". Default: ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "MethodDefinition", "TSDeclareFunction", "TSMethodSignature"].
- `exportPriority` ("all" | "exported" | "non-exported", optional) – Controls whether the rule checks all functions, only exported ones, or only non-exported ones. Default: "all".
- `annotationPlacement` ("before" | "inside", optional)  Controls whether the rule treats before-function comments as the source of annotations (`"before"`, the default and backward-compatible behavior) or instead requires annotations as the first comment-only lines inside function and method bodies (`"inside"`). In `"inside"` mode, JSDoc and before-function comments are ignored for block-bodied functions and methods, and only inside-body comments are considered; declaration-only nodes (e.g., TS signatures) continue to use before-node annotations.

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

Description: Ensures significant code branches (if/else chains, loops, switch cases, try/catch) have traceability coverage, typically via a single `@supports` line, while still accepting legacy `@story` and `@req` annotations in nearby comments. When you adopt multi-story `@supports` annotations, a single `@supports <storyPath> <REQ-ID>...` line placed in any of the valid branch comment locations is treated as satisfying both the story and requirement presence checks for that branch, while detailed format validation of the `@supports` value (including story paths and requirement IDs) continues to be handled by `traceability/valid-annotation-format`, `traceability/valid-story-reference`, and `traceability/valid-req-reference`. The rule supports a configurable placement mode for branch annotations via `annotationPlacement: "before" | "inside"`, defaulting to `"before"` for backward compatibility.

For most branches, the rule looks for annotations in comments immediately preceding the branch keyword (for example, the line above an `if` or `for` statement). For `catch` clauses and `else if` branches, the rule is formatter-aware and accepts annotations in additional positions that common formatters like Prettier use when they reflow code.

Options:

- `branchTypes` (string[], optional) – AST node types that are treated as significant branches for annotation enforcement. Allowed values: "IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement". Default: ["IfStatement", "SwitchCase", "TryStatement", "CatchClause", "ForStatement", "ForOfStatement", "ForInStatement", "WhileStatement", "DoWhileStatement"]. If an invalid branch type is provided, the rule reports a configuration error for each invalid value.
- `annotationPlacement` ("before" | "inside", optional) – Controls whether the rule looks for annotations immediately before branches (`"before"`, the default and backward-compatible behavior) or requires annotations as the first comment lines inside branch bodies where supported (`"inside"`). When set to `"inside"`, the rule prefers comments at the top of the block bodies for simple `if`/`else if` branches, loops, `catch` clauses, and `try` blocks, while continuing to treat any existing before-branch comments as diagnostics in that mode.

Behavior notes:

- **Catch clauses**:
  - Valid locations for `@story` / `@req` annotations are either immediately before the `catch` keyword or on the first comment-only lines inside the catch block (before any executable statements). A single `@supports` annotation in either of these locations is also accepted as covering both story and requirement presence for the catch branch.
  - If annotations exist in both locations, the comments immediately before `catch` take precedence for validation and reporting.
  - When auto-fixing missing annotations on a catch clause, the rule inserts placeholder comments inside the catch block body so that formatters like Prettier keep them attached to the branch.

- **Else-if branches**:
  - Valid locations for `@story` / `@req` annotations include:
    - Line or block comments immediately before the `else if` line.
    - Comment-only lines between the `else if (condition)` and the opening `{` of the consequent block (for styles where the condition and block are on separate lines).
    - The first comment-only lines inside the consequent block body, which is where formatters like Prettier often move comments when they wrap long `else if` conditions. For a concrete before/after example of this formatter-aware behavior, see [Examples](examples.md) (section **6. Branch annotations with if/else/else-if and Prettier**).
  - When annotations appear in more than one of these locations, the rule prefers the comments immediately before the `else if` line, then comments between the condition and the block, and finally comments inside the block body. This precedence is designed to closely mirror real-world formatter behavior and matches the formatter-aware scenarios described in stories 025.0 and 026.0.
  - When auto-fixing missing annotations on an `else if` branch, the rule inserts placeholder comments as the first comment-only line inside the consequent block body (just after the opening `{`), which is a stable location under Prettier and similar formatters. As with catch clauses, a single `@supports` annotation placed in any of these accepted locations is treated as equivalent to having both `@story` and `@req` comments for that branch, with deep format and existence checks delegated to the other validation rules.

Placement modes:

- `"before"` mode preserves the existing semantics described above, including the dual-position behavior for `catch` and `else if` branches where comments immediately before the branch and the first comment-only lines inside the block are both acceptable and validated according to their existing precedence rules.
- `"inside"` mode standardizes on the first comment-only lines inside supported branch blocks (`if`/`else if`, loops, `catch`, and `try`) for validation and auto-fix insertion. This placement is designed to work well with Prettier and other formatters, while the current implementation still treats many before-branch annotations as needing migration and may, in corner cases where it cannot confidently rewrite placement, insert new placeholder comments above the branch rather than moving existing ones. Story `028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION` standardizes inside-brace placement for supported branch constructs; function-level rules continue to use before-function annotations until a future story extends the same standard to functions.

For a concrete illustration of how these rules interact with Prettier, see the formatter-aware if/else/else-if example in [examples.md](examples.md) (section **6. Branch annotations with if/else/else-if and Prettier**), which shows both the hand-written and formatted code that the rule considers valid.

These behaviors are intentionally limited to `catch` clauses and `else if` branches; other branch types (plain `if`, `else`, loops, and `switch` cases) continue to use the simpler "comments immediately before the branch" association model for both validation and auto-fix placement.

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

Description: Validates that all traceability annotations (`@supports` as the preferred form for new code, plus legacy `@story` and `@req`) follow the correct JSDoc or inline comment format. When run with `--fix`, the rule limits changes to safe `@story` path suffix normalization only—for example, adding `.md` when the path ends with `.story`, or adding `.story.md` when the base path has no extension—using targeted replacements implemented in the `getFixedStoryPath` and `reportInvalidStoryFormatWithFix` helpers. It does not change directories, infer new story names, or modify any surrounding comment text or whitespace, in line with Story 008.0. Selective disabling of this suffix-normalization auto-fix behavior is available via the `autoFix` option, which defaults to `true` for backward compatibility.

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

#### Migration and mixed usage

The `valid-annotation-format` rule is intentionally **backward compatible** with existing code that only uses `@story` and `@req`. You can:

- Continue using `@story` + `@req` for single-story functions and modules.
- Introduce `@supports` incrementally for integration code that implements requirements from multiple stories.
- Mix both styles in the same comment block when needed; the rule validates the format of each annotation independently.

Deep requirement checking for both `@req` and `@supports` is handled by the `valid-req-reference` rule in the plugin's internal docs. Advanced edge cases and internal semantics are mainly of interest to maintainers; typical end users can rely on the options and examples in this API reference when configuring the rule for their projects.

Default Severity: `error`

Primary example (recommended `@supports` style):

```javascript
/**
 * @supports docs/stories/005.0-DEV-VALIDATION.story.md#REQ-FORMAT-VALIDATION
 */
function example() {
  // ...
}
```

Legacy example (`@story` + `@req`, still valid but not preferred for new code):

```javascript
/**
 * @story docs/stories/005.0-DEV-VALIDATION.story.md
 * @req REQ-FORMAT-VALIDATION
 */
function legacyExample() {
  // ...
}
```

### traceability/valid-story-reference

Description: Checks that the story file paths used by traceability annotations point to existing story markdown files in an `@supports`‑first world. Modern code typically encodes story paths in `@supports` tags (for example, `@supports docs/stories/010.0-PAYMENTS.story.md#REQ-ID`), but this rule continues to operate on the underlying `@story` values for file‑existence checks, keeping legacy annotations and mixed blocks fully supported.

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

Primary example (recommended `@supports` style, with a companion `@story` used for existence checks):

```javascript
/**
 * @supports docs/stories/006.0-DEV-STORY-EXISTS.story.md#REQ-STORY-EXISTS
 * @story docs/stories/006.0-DEV-STORY-EXISTS.story.md // used for file-existence validation; kept for backward compatibility
 */
function example() {
  // ...
}
```

Legacy-only example (`@story` + `@req`, still supported as an input to this rule):

```javascript
/**
 * @story docs/stories/006.0-DEV-STORY-EXISTS.story.md
 * @req REQ-STORY-EXISTS
 */
function legacyExample() {
  // ...
}
```

### traceability/valid-req-reference

Description: Verifies that the requirement IDs used in traceability annotations match known requirement identifiers, whether they appear in modern `@supports` tags or in legacy `@req` annotations.

Options: None
Default Severity: `error`

Primary example (recommended `@supports` style with requirement IDs):

```javascript
/**
 * @supports docs/stories/007.0-DEV-REQ-REFERENCE.story.md#REQ-VALID-REFERENCE REQ-VALID-REFERENCE-EDGE
 */
function example() {
  // ...
}
```

Legacy example (`@story` + `@req`, still valid for backward compatibility):

```javascript
/**
 * @story docs/stories/007.0-DEV-REQ-REFERENCE.story.md
 * @req REQ-VALID-REFERENCE
 */
function legacyExample() {
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
- `describePattern` (string, optional) – A JavaScript regular expression **source** (without leading and trailing `/`) that the `describe` description text must match when `requireDescribeStory` is enabled. This lets you enforce a project-specific format such as requiring a canonical story path or a `STORY-` style identifier in the `describe` string. If omitted, the default is equivalent to `"Story [0-9]+\\.[0-9]+-"`, which expects the description to include a story label such as `"Story 021.0-DEV-TEST-TRACEABILITY"`. You can override this to instead require full story paths or whatever story-labeling convention your project prefers.
- `autoFixTestTemplate` (boolean, optional) – When `true` (default), allows the rule’s `--fix` mode to insert a file-level `@supports` placeholder template at the top of test files that are missing it. The template is intentionally non-semantic and includes TODO-style guidance so humans can later replace it with a real story and requirement IDs; disabling this option prevents the rule from inserting the template automatically.
- `autoFixTestPrefixFormat` (boolean, optional) – When `true` (default), enables safe normalization of malformed `[REQ-XXX]` prefixes in `it`/`test` names during `--fix`. The rule only rewrites prefixes that already contain a recognizable requirement identifier and limits changes to formatting concerns (spacing, square brackets vs. parentheses, underscore and dash usage, and letter casing) without fabricating new IDs or guessing requirement names.
- `testSupportsTemplate` (string, optional) – Overrides the default file-level `@supports` placeholder template used when `autoFixTestTemplate` is enabled. This string should be a complete JSDoc-style block (for example, including `/**`, `*`, and `*/`) that encodes your project’s preferred TODO guidance or placeholder story path; it is inserted verbatim at the top of matching test files that lack a `@supports` annotation, and is never interpreted or expanded by the rule.

You can tune these options to fit your own testing and naming conventions: adjust `testFilePatterns` to match your project’s test layout (including monorepos or non-standard folders), override `describePattern` if you prefer full `docs/stories/...` paths or a different story-labeling scheme in `describe` strings, and change `requireTestReqPrefix` and `autoFixTestPrefixFormat` if you want to relax, enforce, or customize the `[REQ-...]` prefix requirements for test names.

Behavior notes:

- The rule only analyzes files whose normalized paths contain at least one of the `testFilePatterns` substrings.
- File-level `@supports` annotations are typically placed in a JSDoc block at the top of the file; the rule checks that at least one `@supports` tag is present and that it includes a story/requirement reference (for example, `@supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND`).
- Top-level `describe` calls (such as `describe("Story 010.0-DEV-PAYMENTS", ...)`) are inspected when `requireDescribeStory` is `true`. Their first argument must be a string literal that satisfies `describePattern`.
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

### traceability/no-redundant-annotation

Description: Detects and optionally removes **redundant** traceability annotations on code that is already covered by an enclosing annotated scope. It focuses on simple, statement-level constructs—such as `return` statements, basic variable declarations, and other leaf statements—where repeating the same `@story` / `@req` / `@supports` information adds noise without improving coverage. When run with `--fix`, the rule offers safe auto-fixes that remove only the redundant comments while preserving all annotations that are required to maintain correct traceability.

Catch blocks are treated as separate execution paths for traceability purposes, and annotations inside a `catch` block that intentionally repeat the requirements of the corresponding `try` path are not considered redundant and are never auto-removed. This behavior was introduced as part of story `027.0-DEV-REDUNDANT-ANNOTATION-DETECTION (Detect and Remove Redundant Annotations)` to avoid false positives on error-handling paths that implement the same requirement as the success path.

The rule is designed to complement the core presence and validation rules: it never treats removing a redundant annotation as valid if doing so would leave the underlying requirement or story **uncovered** according to the plugin’s normal rules. It only targets comments whose traceability content is already implied by a surrounding function, method, or branch annotation.

Options:

The rule accepts an optional configuration object:

- `strictness` (`"strict" | "moderate" | "permissive"`, optional)  Controls how broadly statements are considered eligible for redundancy.
  - `"strict"`  Treats any non-branch statement as a candidate for redundancy once it is covered by a containing annotated scope. This is the most aggressive mode and is useful in codebases that want to push almost all traceability down to function/branch level only.
  - `"moderate"` (default)  Focuses on obviously leaf-like statements: anything in `alwaysCovered` **plus** bare `ExpressionStatement` nodes (for example, simple calls or assignments) that are not themselves branches. This mode balances redundancy cleanup with readability.
  - `"permissive"`  Only treats AST node types listed in `alwaysCovered` as candidates. Other statements are ignored even when they are technically covered by an enclosing scope, which is useful when you prefer more explicit, local annotations.
- `allowEmphasisDuplication` (boolean, optional)  When `true`, allows a statement-level annotation that repeats a **single** fully-covered story/requirement pair from its parent scope purely for emphasis (for example, a guard clause with its own comment) and **does not** report it as redundant. When omitted or `false` (the default), even emphasis-only duplicates are treated as redundant when they add no new coverage.
- `maxScopeDepth` (number, optional)  Limits how far up the ancestor chain the rule searches for covering scopes when deciding whether a statements annotations are redundant. A value of `1` restricts checks to the immediate parent scope; larger values allow the rule to consider annotations on enclosing branches and functions further up the tree. The default is `3`, which is suitable for most common function and branch nesting patterns, but you can increase it (for example, to `4` or higher) in projects that use additional nested blocks inside annotated functions.
- `alwaysCovered` (string[], optional)  List of AST statement `node.type` strings that your project treats as "always covered" by their containing scope when that scope is annotated. By default, the rule treats `ReturnStatement` and `VariableDeclaration` as always-covered leaf statements. You can extend or override this list to tune which statement types are considered trivial enough to inherit coverage from their parent scopes.

Behavior notes:

- The rule only inspects comments that contain recognized traceability annotations (`@story`, `@req`, `@supports`) and are attached to simple statements (returns, expression statements, variable declarations, and similar leaf nodes). It intentionally does **not** attempt to de-duplicate annotations on functions, classes, or major branches, which remain the responsibility of the core rules. When a statement has multiple redundant traceability comments (for example, a small comment block that repeats both @story and @req lines), the rule reports a **single** diagnostic for that statement and, in fix mode, removes all of the redundant annotation comments associated with it in a single grouped fix.
- **Catch blocks and error-handling paths**
  - The rule never treats annotations inside a `catch` block as redundant, even when they repeat exactly the same `(story, requirement)` pairs that already cover the surrounding `try` statement or other enclosing branches.
  - This preserves explicit traceability for error-handling logic, in line with the requirements captured in story `027.0-DEV-REDUNDANT-ANNOTATION-DETECTION`, and avoids collapsing success-path and failure-path coverage into a single, less precise annotation.
- Auto-fix removes only the redundant traceability lines (and any now-empty comment delimiters when safe) while preserving surrounding non-traceability text in the same comment where possible.
- When no enclosing scope with compatible coverage is found within `maxScopeDepth`, the annotation is not considered redundant and is left unchanged.

Default Severity: `warn`

This rule is enabled at severity `warn` in both the `recommended` and `strict` presets. You can override its behavior in your own configuration — for example, by raising it to `error` for stricter enforcement, or by explicitly disabling it if you prefer to keep statement-level duplication.

Configuration example (override preset severity from `warn` to `error`):

```jsonc
{
  "rules": {
    "traceability/no-redundant-annotation": "error",
  },
}
```

### traceability/prefer-supports-annotation

Description: An optional, opt-in migration helper that encourages converting legacy single‑story `@story` + `@req` JSDoc blocks into the newer multi‑story `@supports` format. The rule is **disabled by default** and is **not included in any built-in preset**; you enable it explicitly and control its behavior entirely via ESLint severity (`"off" | "warn" | "error"`). It does not change what the core rules consider valid—it only adds migration recommendations and safe auto‑fixes on top of existing validation. The legacy rule key `traceability/prefer-implements-annotation` is still recognized as a **deprecated alias** for `traceability/prefer-supports-annotation` so that existing configurations continue to work unchanged.

Options: None – this rule does not accept a configuration object. All tuning is done via the ESLint rule level (`"off"`, `"warn"`, `"error"`).

This rule focuses on **single‑story** legacy blocks where automatic migration is unambiguous. It inspects JSDoc comments attached to function‑like constructs and looks for the following patterns:

- A single `@story` annotation with one story path.
- One or more simple `@req` lines in the same block (each with a single requirement ID).
- No `@supports` annotations yet present in that block.

When these conditions are met, the rule recommends replacing the legacy block with a single `@supports` line that encodes the same relationship between the story and its requirements.

Main behaviors:

1. **Single‑story legacy blocks → `preferImplements` (auto‑fixable)**  
   When a JSDoc block contains exactly one `@story` path and one or more simple `@req` identifiers, and no `@supports` tags, the rule reports a `preferImplements` diagnostic. In `--fix` mode, and when it is safe to do so, it rewrites the block to a consolidated `@supports` annotation of the form:

   ```js
   /**
    * @supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND REQ-PAYMENTS-REFUND-EDGE
    */
   ```

   Conceptually, the auto‑fix:
   - Extracts the single `@story` value.
   - Collects the requirement IDs from each `@req` line in that block.
   - Emits a single `@supports story-path#REQ-1 REQ-2 ...` line (or your project’s equivalent anchor scheme).

   All legacy `@story` and `@req` tags in that block are removed as part of the fix, since their meaning is now captured by the `@supports` line. The fix is only applied when the story path and requirement IDs are straightforward to parse; complex or ambiguous shapes are left for manual migration.

2. **Mixed usage with existing `@supports` → `cannotAutoFix` (manual migration)**  
   If a JSDoc block already contains at least one `@supports` annotation **and** still has legacy `@story`/`@req` tags, the rule treats this as a mixed‑style block. In this case, it reports a `cannotAutoFix` diagnostic that includes a human‑readable `reason` explaining that the block already uses `@supports` and must be cleaned up manually.

   The rule **does not** attempt to merge or rewrite mixed blocks automatically, to avoid guessing your intended story/requirement grouping. All annotations in such blocks are left unchanged; you are expected to convert them to your preferred `@supports` shape by hand.

3. **Multiple distinct `@story` paths → `multiStoryDetected` (manual migration)**  
   When the same JSDoc block contains **multiple different `@story` paths**, the rule reports a `multiStoryDetected` diagnostic and leaves the block unchanged. This scenario usually indicates integration code that implements requirements from several stories, and the correct multi-story `@supports` representation depends on how your project organizes those relationships.

   Because there is no universally safe way to automatically group requirements across multiple stories, the rule does **not** attempt any auto‑fix in this case. Instead, it highlights the block so humans can migrate it to one or more explicit `@supports` annotations following your multi‑story conventions.

Deliberate non‑targets and ignored comments:

- JSDoc blocks that contain **only** `@story`, **only** `@req`, or **only** `@supports` are **not** modified by this rule. They remain valid and continue to be governed solely by the core rules such as `require-story-annotation`, `require-req-annotation`, and `valid-annotation-format`.
- Inline or line comments like `// @story ...`, `// @req ...`, or `// @supports ...` are also supported in a limited, migration‑oriented way: when the rule detects a simple, consecutive pair or small run of `// @story ...` and `// @req ...` lines that are directly attached to a function or branch, it can, in `--fix` mode, consolidate them into a single `// @supports ...` line while preserving indentation and the comment’s relative position next to the code. More complex inline patterns (such as mixed traceability and non-traceability content, multiple distinct stories, or interleaved unrelated comments) are still reported without auto‑fix for safety. As with JSDoc migration, this behavior is opt‑in: the rule remains disabled by default and must be explicitly enabled with your desired severity when you are ready to start migrating inline annotations.
- Any block that does not match the “single story + simple requirements, no supports” shape is treated conservatively: the rule may report a diagnostic to flag the legacy/mixed pattern, but it will not rewrite comments unless it is clearly safe.

Interaction with other rules:

- Enabling this rule does **not** change what is required or permitted by:
  - `traceability/valid-annotation-format`
  - `traceability/valid-req-reference`
  - `traceability/require-story-annotation`
  - `traceability/require-req-annotation`
- All existing `@story` + `@req` blocks that pass those rules are still valid when this rule is off. Turning it on simply adds a migration layer that nudges you toward the consolidated `@supports` style and, where unambiguous, performs structural rewrites on your behalf.

Example: single‑story auto‑fix

Given this legacy JSDoc block:

```js
/**
 * @story docs/stories/010.0-PAYMENTS.story.md
 * @req REQ-PAYMENTS-REFUND
 * @req REQ-PAYMENTS-REFUND-EDGE
 */
function issueRefund() {
  // ...
}
```

With `traceability/prefer-supports-annotation` enabled (or its deprecated alias `traceability/prefer-implements-annotation`) and ESLint run with `--fix`, the rule rewrites it to:

```js
/**
 * @supports docs/stories/010.0-PAYMENTS.story.md#REQ-PAYMENTS-REFUND REQ-PAYMENTS-REFUND-EDGE
 */
function issueRefund() {
  // ...
}
```

All other function‑level rules (such as `require-story-annotation`, `require-req-annotation`, and `valid-annotation-format`) continue to validate the resulting `@supports` annotation according to your existing configuration.

Configuration example (opt‑in at `"warn"`):

```js
// eslint.config.js (flat config)
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [
  js.configs.recommended,
  traceability.configs.recommended,
  {
    rules: {
      "traceability/prefer-supports-annotation": "warn",
      // The deprecated alias is still honored if you prefer:
      // "traceability/prefer-implements-annotation": "warn",
    },
  },
];
```

## Configuration Presets

The plugin provides two built-in presets for easy configuration:

### recommended

Enables the **six core traceability rules** with severities tuned for common usage (most at `error`, with
`traceability/valid-annotation-format` at `warn` to reduce noise). This `warn` level for `traceability/valid-annotation-format` is intentional to keep early adoption noise low, but you can safely raise it to `error` in projects that want strict enforcement of annotation formatting.

The `prefer-supports-annotation` migration rule (and its deprecated alias key `traceability/prefer-implements-annotation`) is **not included** in this (or any) preset and remains disabled by default. If you want to encourage or enforce multi-story `@supports` annotations, you must enable `traceability/prefer-supports-annotation` explicitly in your ESLint configuration and choose an appropriate severity (for example, `"warn"` during migration or `"error"` once fully adopted).

Core rules enabled by the `recommended` preset:

- `traceability/require-traceability`: `error` (unified function-level rule; composes story + req checks)
- `traceability/require-story-annotation`: `error` (legacy key; kept for backward compatibility)
- `traceability/require-req-annotation`: `error` (legacy key; kept for backward compatibility)
- `traceability/require-branch-annotation`: `error`
- `traceability/valid-annotation-format`: `warn`
- `traceability/valid-story-reference`: `error`
- `traceability/valid-req-reference`: `error`
- `traceability/require-test-traceability`: `error`
- `traceability/no-redundant-annotation`: `warn`

Usage:

```javascript
import js from "@eslint/js";
import traceability from "eslint-plugin-traceability";

export default [js.configs.recommended, traceability.configs.recommended];
```

### strict

Currently mirrors the **recommended** preset, reserved for future stricter policies. As with the `recommended` preset, the `traceability/prefer-supports-annotation` rule is **not** enabled here by default, and the deprecated alias key `traceability/prefer-implements-annotation` continues to be honored only when you opt into it manually in your own configuration.

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
```
