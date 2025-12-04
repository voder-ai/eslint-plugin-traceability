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

Review and update your existing annotations accordingly:

```diff
- /** @story docs/stories/001.0-DEV-PLUGIN-SETUP.md */
+ /** @story docs/stories/001.0-DEV-PLUGIN-SETUP.story.md */
```

### 3.1 Multi-story `@implements` annotations

Starting in v1.x, `eslint-plugin-traceability` supports an additional annotation form for integration code that implements requirements from multiple stories:

```js
/**
 * @implements docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md REQ-IMPLEMENTS-PARSE REQ-IMPLEMENTS-VALIDATE
 */
function integrate() {}
```

You **do not** need to change existing, single-story annotations that already use `@story` and `@req`. Migration to `@implements` is only recommended when a function or module genuinely implements requirements from more than one story file.

#### Optional `prefer-implements-annotation` migration rule

For teams that want to gradually migrate from `@story` + `@req` to `@implements`, the plugin provides an optional rule: `traceability/prefer-implements-annotation`.

- This rule is **disabled by default** and is **not** included in any built-in presets.
- You can enable it with any standard ESLint severity (`"off"`, `"warn"`, or `"error"`) in your config, for example:

  ```js
  // excerpt from eslint.config.js
  {
    rules: {
      "traceability/prefer-implements-annotation": "warn",
    },
  }
  ```

- When enabled, it offers **conservative auto-fixes** that rewrite eligible `@story` + `@req` combinations into equivalent `@implements` lines, without attempting risky or ambiguous transformations.
- Detailed behavior, limitations, and examples are documented in `docs/rules/prefer-implements-annotation.md`.

#### When to keep `@story` + `@req`

Keep your current annotations if:

- Each function is tied to a single story file.
- All relevant requirements live in that story file.
- You do not need to distinguish which story a particular requirement ID comes from.

Example (no migration required):

```js
/**
 * @story docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
 * @req REQ-ANNOTATION-REQUIRED
 */
export function initAuth() {
  // ...
}
```

#### When to introduce `@implements`

Adopt `@implements` for **multi-story integration** code, especially when:

- The function combines behavior governed by **multiple** stories.
- Requirement IDs are reused across stories (for example, `REQ-SHARED-ID` appears in more than one story file).
- You want deep validation (via `valid-req-reference`) to know **which story file** each requirement came from.

Before (single-story annotations trying to describe multi-story behavior):

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

After (multi-story `@implements`), aligned with Story 010.2:

```js
/**
 * Apply age and security filters to rows.
 * @story docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md
 * @req REQ-AGE-THRESHOLD
 * @req REQ-OUTPUT
 *
 * @implements docs/stories/003.0-DEV-IDENTIFY-OUTDATED.story.md REQ-AGE-THRESHOLD REQ-OUTPUT
 * @implements docs/stories/004.0-DEV-FILTER-VULNERABLE-VERSIONS.story.md REQ-AUDIT-CHECK REQ-SAFE-ONLY
 */
export async function applyFilters(rows, options) {
  // combined behavior
}
```

In the "after" example:

- `valid-annotation-format` ensures the `@implements` lines use a valid story path and requirement ID format.
- `valid-req-reference` validates that each requirement listed after `@implements` exists in the corresponding story file.

#### Mixed usage during migration

You can introduce `@implements` gradually without breaking existing code:

1. Leave existing `@story` and `@req` annotations in place.
2. Add `@implements` lines that group requirements by story file.
3. Run ESLint with `traceability/valid-annotation-format` and `traceability/valid-req-reference` enabled to confirm everything passes.
4. Optionally, once you are comfortable, standardize on using `@implements` for multi-story integration functions while keeping `@story` + `@req` for simple, single-story code.

For detailed semantics and edge cases (path validation, scoped requirement IDs, and multi-story fixtures), see the valid-annotation-format and valid-req-reference rule documentation and the multi-story support story in the project documentation.

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
