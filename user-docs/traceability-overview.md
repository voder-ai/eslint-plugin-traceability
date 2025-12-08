# Traceability Overview and FAQ

Created autonomously by [voder.ai](https://voder.ai).

This page gives a high-level overview of how to use `eslint-plugin-traceability` in day-to-day development and answers common questions about annotations, rules, and their relationship to legacy aliases.

For detailed rule and option descriptions, see the [API Reference](api-reference.md). For concrete code samples, see the [Examples](examples.md) document.

## Which annotations should I use?

The plugin understands three annotation forms:

- `@supports` – **Preferred for new code and multi-story integrations.**  
  Use this when a function, module, or branch implements requirements from one or more stories. A single `@supports` tag can express both the story path and the requirement IDs it implements.
- `@story` – Legacy story-level tag.  
  Still valid and useful when a function is tied to a single story file and you have not yet migrated to `@supports`.
- `@req` – Legacy requirement-level tag.  
  Pairs naturally with `@story` for simple, single-story scenarios.

Recommended usage:

- For **new or refactored code**, prefer `@supports` as your primary annotation.
- For **simple, single-story functions** that already use `@story` + `@req`, you can keep that style; there is no forced cut-over.
- During migration, you can temporarily have both `@story`/`@req` and `@supports` in the same block; the core rules and the optional `traceability/prefer-supports-annotation` rule are designed to support this.

The [Migration Guide](migration-guide.md) explains when and how to introduce `@supports` in more detail, including conservative auto-fix behavior.

## Which ESLint rule should I enable for functions?

For function-level checks, think in terms of a single canonical rule plus a small set of supporting rules.

- `traceability/require-traceability` – **Canonical function-level rule for new configurations.**  
  Ensures that in-scope functions and methods have both story and requirement coverage. It understands both `@supports` (preferred) and legacy `@story` / `@req` annotations.

Most users can choose one of these options:

1. **Use the recommended preset** (simplest):

   ```js
   // eslint.config.js
   import js from "@eslint/js";
   import traceability from "eslint-plugin-traceability";

   export default [js.configs.recommended, traceability.configs.recommended];
   ```

   This enables `traceability/require-traceability` and the other core rules with sensible defaults.

2. **Manually enable the unified rule and common helpers** (when you need custom tuning):

   ```js
   // eslint.config.js
   import traceability from "eslint-plugin-traceability";

   export default [
     {
       plugins: { traceability },
       rules: {
         // Canonical function-level rule
         "traceability/require-traceability": "error",

         // Common supporting rules
         "traceability/require-branch-annotation": "warn",
         "traceability/valid-annotation-format": "error",
         "traceability/valid-story-reference": "error",
         "traceability/valid-req-reference": "error",

         // Optional: enforce test traceability conventions
         "traceability/require-test-traceability": "warn",
       },
     },
   ];
   ```

The same guidance is summarized in the README under **"Canonical function-level rule and legacy aliases"**.

## What about the legacy alias rules?

Two additional rule keys exist for backward compatibility:

- `traceability/require-story-annotation`
- `traceability/require-req-annotation`

Key points:

- They are **legacy aliases** that share the same underlying engine as `traceability/require-traceability`.
- They are kept so that older configurations continue to work without change.
- New configurations should **not** rely on these keys directly unless you have a specific reason to tune their severities independently.

If you are starting from scratch, you can safely ignore the legacy keys and use only `traceability/require-traceability` together with the supporting rules listed above.

## Do I have to migrate existing `@story` / `@req` annotations to `@supports`?

No. Existing `@story` + `@req` annotations remain valid and fully supported.

Typical migration path:

1. Keep your current `@story` + `@req` annotations for simple, single-story functions.
2. Introduce `@supports` gradually for integration code that naturally spans multiple stories.
3. Optionally enable `traceability/prefer-supports-annotation` at `"warn"` to get gentle guidance and conservative auto-fixes for straightforward single-story blocks.
4. Once you are comfortable, you can tighten enforcement or standardize on `@supports` for new multi-story work.

See the [Migration Guide](migration-guide.md#31-multi-story-supports-annotations) for concrete before/after examples.

## Where can I see concrete examples?

- **Quick start and minimal config:** See the main [README](../README.md#quick-start).
- **Full rule list and options:** See the [API Reference](api-reference.md#rules).
- **End-to-end examples:** See the [Examples](examples.md) document, including:
  - Flat-config snippets using the recommended and strict presets.
  - CLI usage with the unified rule and clearly labeled legacy-alias examples.
  - Test traceability examples using `traceability/require-test-traceability`.
  - Branch annotation patterns that work well with formatters such as Prettier.
- **Migration guidance:** See the [Migration Guide](migration-guide.md).

These resources are designed to be complementary: start with this overview to choose the right annotations and rules, then refer to the API reference and examples when you need exact configuration shapes or runnable code samples.