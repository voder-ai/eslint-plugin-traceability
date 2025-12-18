# Migration Guide from v0.x to v1.x

Created autonomously by [voder.ai](https://voder.ai)  
This guide covers migration from 0.x to the 1.x series of eslint-plugin-traceability. For the current 1.x release and detailed changelog, see GitHub Releases: <https://github.com/voder-ai/eslint-plugin-traceability/releases>.

This guide helps you migrate from versions 0.x of `eslint-plugin-traceability` to 1.x.

## 1. Update Dependency

Update your development dependency to the latest 1.x release:

```bash
npm install --save-dev eslint-plugin-traceability@^1.0.0
```

Or with Yarn:

```bash
yarn add --dev eslint-plugin-traceability@^1.0.0
```

## 2. ESLint Configuration Changes

- Version 1.x uses ESLint v9 flat config by default. If you currently use `.eslintrc.js`, you can continue using it, but consider migrating to the new flat config format for future upgrades.
- Update your ESLint config to load the plugin’s recommended settings:

```js
// eslint.config.js (ESLint v9 flat config)
import traceability from "eslint-plugin-traceability";

export default [traceability.configs.recommended];
```

## 3. New and Updated Rules

- `valid-story-reference` now enforces `.story.md` extensions strictly.
- `valid-req-reference` rejects path traversal (`../`) and absolute paths (`/etc/passwd`).
- `valid-annotation-format` enforces correct JSDoc traceability annotation syntax (`@story` and `@req` tags).

The following diff shows a typical migration in **your own project**, where `docs/stories/001.0-DEV-PLUGIN-SETUP.story.md` is an example of a story file path from your documentation tree:

```diff
- /** @story docs/stories/001.0-DEV-PLUGIN-SETUP.md */
+ /** @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md */
```

### 3.1 Multi-story `@supports` annotations

Starting in v1.x, `eslint-plugin-traceability` introduces and prefers the `@supports` annotation for integration code that implements requirements from multiple stories in a consuming project. The following snippet shows one example of how you might structure such an annotation in **your** codebase:

```js
/**
 * @supports docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-IMPLEMENTS-VALIDATE
 */
function integrate() {}
```

You **do not** need to change existing, single-story annotations that already use `@story` and `@req`. Migration to `@supports` is only recommended when a function or module genuinely implements requirements from more than one story file.

#### Optional `prefer-supports-annotation` migration rule

For teams that want to gradually migrate from `@story` + `@req` to `@supports`, the plugin provides an optional rule: `traceability/prefer-supports-annotation`.

- This is the canonical rule name starting in v1.x.
- The legacy key `traceability/prefer-implements-annotation` remains supported as a **deprecated alias** for backward compatibility, but should not be used in new configurations.

- This rule is **disabled by default** and is **not** included in any built-in presets (the deprecated alias is also not enabled by any presets).
- You can enable it with any standard ESLint severity (`"off"`, `"warn"`, or `"error"`) in your config, for example:

  ```js
  // excerpt from eslint.config.js
  {
    rules: {
      "traceability/prefer-supports-annotation": "warn",
      // "traceability/prefer-implements-annotation": "warn", // deprecated alias
    },
  }
  ```

This rule is an **optional migration aid**, not a deprecation notice. `@story` and `@req` remain fully supported, and there is no hard requirement or deadline to migrate existing annotations. Use the rule only where `@supports` gives you clearer, multi-story traceability.

When enabled, it offers **conservative auto-fixes** that rewrite eligible `@story` + `@req` combinations into equivalent `@supports` lines, without attempting risky or ambiguous transformations. It intentionally refuses to modify comments that are even slightly unclear, and will instead surface diagnostics that explain what needs manual attention.

Aligned with the internal rule behavior, the key cases are:

- **Simple, single-story JSDoc blocks**  
  For comments that contain exactly one `@story` path and one or more simple `@req` lines, the rule:
  - Reports a recommendation to consolidate them, and
  - In `--fix` mode, converts them into a single `@supports` line that keeps the same story path and requirement IDs.

- **Mixed `@story` / `@req` plus existing `@supports`**  
  For comments that already contain one or more `@supports` lines alongside `@story` and/or `@req`, the rule:
  - Reports a diagnostic explaining that mixed usage cannot be auto-fixed safely, and
  - Leaves the comment unchanged so you can decide how to migrate it manually.

- **Multiple distinct `@story` paths**  
  For comments that refer to more than one different `@story` path, the rule:
  - Reports that multiple stories were detected, and
  - Requires you to manually convert them into separate `@supports` lines (one per story path, each followed by the appropriate requirement IDs).

- **Intentionally ignored comments**  
  The following are **ignored** by this rule and remain valid:
  - Comments that contain only `@story` lines,
  - Comments that contain only `@req` lines,
  - Comments that contain only `@supports` lines.

  Line comments are treated more selectively:
  - Simple, consecutive line comments such as:

    ```js
    // @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
    // @req REQ-ANNOTATION-REQUIRED
    function initAuth() {}
    ```

    that are directly attached to a function, method, or branch and describe exactly one story path plus one or more requirement IDs can now be migrated automatically. When the rule is enabled and you run ESLint with `--fix`, these are consolidated into a single `// @supports ...` line that preserves the same story path and requirement IDs.

  - More complex inline patterns — for example, mixed traceability and non-traceability content, multiple distinct `@story` paths, or interleaved unrelated comments between `@story` and `@req` lines — are still reported but are **not** auto-fixed. In these cases, the rule continues to treat unsupported inline shapes conservatively, emitting diagnostics and leaving the comments unchanged so you can adjust them manually.

A typical migration path is:

- Start with the rule set to `"off"` while you introduce `@supports` in new or refactored code.
- Enable it as `"warn"` to get non-breaking guidance and auto-fixes for straightforward cases.
- Optionally move to `"error"` once you want to strictly enforce `@supports` usage for all JSDoc blocks that are eligible for safe conversion.

#### When to keep `@story` + `req`

Keep your current annotations if:

- Each function is tied to a single story file.
- All relevant requirements live in that story file.
- You do not need to distinguish which story a particular requirement ID comes from.

Example (no migration required). Here, `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` is an illustrative path representing a typical story file location in **your** documentation structure:

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
export function initAuth() {
  // ...
}
```

These `@story` and `@req` forms are treated as a legacy single-story style that remains valid for simple cases, while new multi-story integrations should prefer `@supports` as the primary format.

#### When to introduce `@supports`

Adopt `@supports` for **multi-story integration** code, especially when:

- The function combines behavior governed by **multiple** stories.
- Requirement IDs are reused across stories (for example, `REQ-SHARED-ID` appears in more than one story file).
- You want deep validation (via `valid-req-reference`) to know **which story file** each requirement came from.

Before (single-story annotations trying to describe multi-story behavior). The story path shown here is an example of how you might name and organize a story file in your own project:

```js
/**
 * Apply age and security filters to rows.
 * @story docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md
 * @req REQ-AGE-THRESHOLD
 * @req REQ-OUTPUT
 */
export async function applyFilters(rows, options) {
  // combined behavior
}
```

After (multi-story `@supports`), using illustrative story paths that represent typical files in your project’s documentation tree (they are examples, not files provided by this plugin):

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

In the "after" example:

- `valid-annotation-format` ensures the `@supports` lines use a valid story path and requirement ID format.
- `valid-req-reference` validates that each requirement listed after `@supports` exists in the corresponding story file.

#### Mixed usage during migration

You can introduce `@supports` gradually without breaking existing code:

1. Leave existing `@story` and `@req` annotations in place.
2. Add `@supports` lines that group requirements by story file.
   Over time, teams are encouraged to converge on `@supports` as the canonical format for multi-story integrations, keeping `@story`/`@req` primarily for simple, single-story cases.
3. Run ESLint with `traceability/valid-annotation-format` and `traceability/valid-req-reference` enabled to confirm everything passes.
4. Optionally, once you are comfortable, standardize on using `@supports` for multi-story integration functions while keeping `@story` + `@req` for simple, single-story code.

Detailed semantics and edge cases (path validation, scoped requirement IDs, and multi-story fixtures) are ultimately governed by your own stories and requirements. For typical migrations, this guide together with the plugin’s API reference is sufficient.

### 3.2 Else-if branch annotations and formatter compatibility

Versions 1.x of `eslint-plugin-traceability` extend the `traceability/require-branch-annotation` rule to better support formatter-driven layouts for `else if` branches. In most projects you **do not need to change existing annotations**:

- Comments immediately before an `else if` line remain valid and continue to satisfy the rule.
- When formatters such as Prettier move comments between the `else if (condition)` and the opening `{`, or into the first comment-only lines inside the `{ ... }` block, those annotations are now also recognized and associated with the correct branch.

If you previously added suppressions or workaround comments around `else if` branches due to formatter conflicts, you can usually remove those workarounds after upgrading to 1.x as long as your annotations live in one of the supported locations. For new code, you can place annotations either directly above the `else if` or, when you know a formatter will wrap a long condition, on the first comment-only line inside the consequent block body, which is where the rule places auto-fix placeholders by default.

### 3.3 Redundant traceability annotation cleanup

As you move toward an **`@supports`-first** style while still supporting legacy `@story`/`@req`, v1.x adds `traceability/no-redundant-annotation` to help clean up redundant **statement-level** annotations that often accumulate during migration and refactoring.

This rule is enabled as `"warn"` in the built-in recommended presets, so you automatically get guidance without breaking existing builds.

At a high level, the rule targets common duplication patterns where multiple adjacent statements or branches repeat the **same story/requirement coverage**, for example:

- **Branch + statement duplication** — the `if`/`else` branch is annotated, and the first statement inside the block repeats the exact same coverage.
- **Sequential simple statements** — back‑to‑back statements each carry identical traceability, even though they form a single logical step.
- **Trivial returns** — a branch and an immediately returning statement both repeat the same story/requirement pair.

In all cases, the rule is conservative:

- It **never removes the last annotation** that provides coverage for a given `(story path, requirement ID)` pair.
- It prefers to keep annotations in the positions that are easiest to reason about (for example, on the controlling branch or on the first statement in a short sequence), and trims only clearly redundant copies.

The rule operates over both `@supports` and legacy `@story`/`@req` style annotations, so it continues to work even in mixed codebases during a long-running migration.

In addition, `catch` blocks are treated as distinct execution paths: repeating the same `(story, requirement)` pair in a `catch` block is **not** considered redundant, because the error-handling path is typically validated and reasoned about separately from the main control flow.

A simplified example, using an illustrative story path that represents a file in **your** documentation tree:

Before (redundant duplication inside a branch):

```js
if (!user) {
  // @supports docs/stories/010.0-AUTH-SESSION-MANAGEMENT.story.md REQ-UNAUTH-REDIRECT
  // @supports docs/stories/010.0-AUTH-SESSION-MANAGEMENT.story.md REQ-UNAUTH-REDIRECT
  return redirectToLogin();
}
```

After (`no-redundant-annotation` auto-fix, coverage preserved but duplication removed):

```js
if (!user) {
  // @supports docs/stories/010.0-AUTH-SESSION-MANAGEMENT.story.md REQ-UNAUTH-REDIRECT
  return redirectToLogin();
}
```

Another example where the branch and first statement are both annotated with the same coverage:

Before:

```js
// @supports docs/stories/020.0-ORDERS-CHECKOUT.story.md REQ-CALCULATE-TOTAL
if (cart.items.length === 0) {
  // @supports docs/stories/020.0-ORDERS-CHECKOUT.story.md REQ-CALCULATE-TOTAL
  return 0;
}
```

After (keep coverage at the branch, drop the redundant inner statement annotation):

```js
// @supports docs/stories/020.0-ORDERS-CHECKOUT.story.md REQ-CALCULATE-TOTAL
if (cart.items.length === 0) {
  return 0;
}
```

#### Example: try/if/else-if/catch with non-redundant catch annotation

The following example shows a `try` block with an `if` / `else if` chain that validates a safe operation, and a `catch` block that handles the error path for the **same** requirement. Both paths are annotated with the same `(story, requirement)` pair to make it clear that the requirement covers normal execution and error handling:

```js
async function performSafeOperation(input) {
  try {
    // @supports docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION
    if (input == null) {
      throw new Error("Missing input");
    }

    // @supports docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION
    if (typeof input === "string") {
      return await doSafeStringOperation(input);
    } else if (Array.isArray(input)) {
      return await doSafeArrayOperation(input);
    }

    return await doSafeFallbackOperation(input);
  } catch (error) {
    // This catch represents the error-handling path for the same safe-operation requirement.
    // Even though the coverage matches the try/if/else-if chain above, it is *not* redundant:
    // it documents how failures are handled for the same requirement.
    // @supports docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION
    return handleSafeOperationFailure(error, input);
  }
}
```

Here, `traceability/no-redundant-annotation` recognizes the `catch` block as a separate execution path from the main `try` body. The annotation in the `catch` remains intact and is **not** treated as redundant, even though it repeats the same `docs/stories/010.0-EXAMPLE.story.md REQ-SAFE-OPERATION` coverage as the guarded `if` / `else if` chain in the `try`. This behavior was introduced and validated as part of story `027.0-DEV-REDUNDANT-ANNOTATION-DETECTION (Detect and Remove Redundant Annotations)` to prevent regressions in real-world `try/if/else-if/catch` scenarios like the one discussed there.

#### Safe migration workflow

To use `traceability/no-redundant-annotation` safely during your v1.x migration:

1. **Start from the recommended preset**

   Make sure your ESLint flat config includes the plugin’s recommended config (which enables this rule as `"warn"`):

   ```js
   import traceability from "eslint-plugin-traceability";

   export default [traceability.configs.recommended];
   ```

2. **Run ESLint without auto-fix**

   Run ESLint without `--fix` to review the warnings:

   ```bash
   npm run lint
   ```

   Look for diagnostics from `traceability/no-redundant-annotation` and confirm that the suggested removals match your expectations.

3. **Run with `--fix` once comfortable**

   When you are satisfied with the behavior, re-run ESLint with auto-fix enabled to apply safe cleanups in bulk:

   ```bash
   npm run lint -- --fix
   ```

4. **Optionally tighten over time**

   As your team gets comfortable:
   - You can raise the rule severity to `"error"` for new code, and/or
   - Increase strictness via configuration (see below) to catch more subtle forms of duplication.

#### Key configuration knobs

The full API reference documents all options, but the most important knobs for migration are:

- **`strictness`** — controls how aggressively the rule interprets “redundant.” Lower settings only remove obvious duplication; higher levels consider more complex patterns across nearby statements and branches.
- **`allowEmphasisDuplication`** — when `true`, allows an explicit “emphasis” annotation to repeat coverage (for example, keeping a second comment in a particularly critical spot) without being reported as redundant.
- **`maxScopeDepth`** — limits how far into nested blocks the rule looks when deciding what is redundant, which can be useful if you want very local cleanups only.
- **`alwaysCovered`** — a safety valve that forces the rule to preserve at least one annotation for each `(story, requirement)` pair within the relevant scope, even under stricter modes.

For most teams, the defaults in the recommended preset are a good starting point; you can then tune these options incrementally as your traceability style and `@supports` usage stabilize.

### 3.4 Inside-brace branch annotation placement (optional)

Story 028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION introduces an **inside-brace** placement standard for branch annotations. Instead of placing annotations directly above a branch, you can configure `traceability/require-branch-annotation` to look for annotations as the first comment-only lines **inside** each block body.

The feature is controlled by the `annotationPlacement` option on `require-branch-annotation`:

```js
// eslint.config.js (flat config example)
import traceability from "eslint-plugin-traceability";

export default [
  traceability.configs.recommended,
  {
    rules: {
      "traceability/require-branch-annotation": [
        "error",
        {
          annotationPlacement: "inside", // "before" (default) or "inside"
        },
      ],
    },
  },
];
```

With `annotationPlacement: "inside"`, the rule expects annotations in these locations:

- `if` / `else if` / `else`: first comment-only lines inside the `{ ... }` block.
- Loops: first comment-only lines inside the loop body.
- `try` / `catch` / `finally`: first comment-only lines inside the corresponding block body.
- `switch` cases: first comment-only lines inside the `case` body when it is a block (`case 'a': { ... }`).

Before-brace annotations are still honored when you leave `annotationPlacement` at the default value (`"before"`), so you can migrate gradually:

1. **Start in default mode** — keep `annotationPlacement` unspecified (or set to `"before"`) and continue using your existing `// @story` / `// @req` comments above branches.
2. **Introduce inside-brace style for new code** — when adding or refactoring branches, place annotations on the first comment-only line inside the block body. This layout plays nicely with Prettier and is what the rule’s auto-fix uses for `if`/`else if` and similar branches.
3. **Opt-in to `annotationPlacement: "inside"`** — once your codebase is mostly using inside-brace annotations, enable the option. Branches that still rely only on before-brace comments will be reported as missing annotations in inside mode, and the rule’s autofix can insert placeholders at the correct inside location to help you complete the migration.

The default configuration in 1.x keeps `annotationPlacement` at `"before"` for backward compatibility, so existing projects do not need to change anything unless they want the new inside-brace behavior.

## 4. Test and Validate

Run your test suite to confirm everything passes:

```bash
npm test
npm run lint -- --max-warnings=0
npm run format:check
```

## 5. Update Documentation

If you have custom documentation or examples that reference old rule names or file paths, update them to match the new conventions introduced in v1.x.

## Security and Dependency Notes

Production dependency guarantees are enforced by CI scripts that run `npm audit --omit=dev --audit-level=high` and manage version changes via `dry-aged-deps`, with additional details on thresholds, review policies, and incident handling defined in the project's internal security and dependency health documentation.

---

If you encounter any issues during migration, please file an issue at https://github.com/voder-ai/eslint-plugin-traceability/issues.