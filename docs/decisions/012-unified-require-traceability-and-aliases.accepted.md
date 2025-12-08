---
status: "accepted"
date: 2025-12-08
decision-makers: [Development Team]
consulted:
  [
    docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md,
    docs/stories/010.2-DEV-MULTI-STORY-SUPPORT.story.md,
    docs/stories/010.3-DEV-MIGRATE-TO-SUPPORTS.story.md,
    docs/decisions/010-implements-annotation-for-multi-story-requirements.proposed.md,
    docs/decisions/011-rename-implements-to-supports-annotation.accepted.md
  ]
informed: [Plugin Users, Project Contributors]
---

# Unified `require-traceability` Rule, Legacy Aliases, and `@supports`-First Model

## Context and Problem Statement

Story 003.0-DEV-FUNCTION-ANNOTATIONS introduced the core function-level validation rules for this plugin:

- `traceability/require-story-annotation`
- `traceability/require-req-annotation`

Over time these evolved into a **unified rule** and a new multi-story annotation model:

- A single composite rule, `traceability/require-traceability`, that enforces both story- and requirement-level coverage.
- A new `@supports <story-path> <REQ-ID> [...]` annotation, formalised in ADR 011, that better expresses multi-story and integration behaviour than the legacy `@story`/`@req` pair.

The codebase now contains:

- A canonical rule implementation in `src/rules/require-traceability.ts` that composes the legacy rules.
- Backward-compatible rule keys `traceability/require-story-annotation` and `traceability/require-req-annotation` that must continue to work for existing configurations.
- A migration rule `traceability/prefer-supports-annotation` (with deprecated alias `traceability/prefer-implements-annotation`) that recommends and auto-fixes `@story`/`@req` to `@supports`.

Without a clear architectural decision, there is a risk that:

- Future changes accidentally diverge behaviour between the canonical rule and its legacy aliases.
- Documentation and presets drift from the actual wiring in `src/index.ts`.
- Contributors are unsure which rule keys to use in new configurations, or how `@supports` relates to the legacy annotations.

## Decision

We standardise on a **unified, `@supports`-first function-level model** with explicit behaviour for legacy aliases.

### 1. Canonical function-level rule

- `traceability/require-traceability` is the **canonical function-level rule**.
- Its implementation lives in `src/rules/require-traceability.ts` and:
  - Composes `require-story-annotation` and `require-req-annotation` at the listener level.
  - Exposes a single `meta` block that includes message IDs from both underlying rules.
  - Supports both legacy `@story`/`@req` and modern `@supports` annotations, as described in story 010.2.
- All new configurations and presets MUST target `traceability/require-traceability` directly.

### 2. Legacy alias rule keys

- `traceability/require-story-annotation` and `traceability/require-req-annotation` are treated as **legacy alias keys**.
- Their behaviour is defined as follows:
  - Both aliases share the same underlying implementation as `require-traceability`.
  - Alias `meta` objects are derived by merging the canonical rule metadata with any historical alias-specific docs/schema.
  - The `create` function for each alias is the `create` function from `require-traceability`; there is no divergent listener logic.
- This wiring is implemented centrally in `src/index.ts` by:
  - Loading all rule modules into an internal `rules` map.
  - Creating alias RuleModules that:
    - Reuse the `create` function from the canonical rule.
    - Merge `meta` from the canonical rule and the historical alias module, preferring alias-specific `docs`, `messages`, and `schema` where present.
  - Assigning these alias RuleModules back into `rules["require-story-annotation"]` and `rules["require-req-annotation"]`.

### 3. `@supports`-first annotation model

- The **primary user-facing annotation model** for new code is:
  - `@supports <story-path> <REQ-ID> [<REQ-ID> ...]`
- Legacy annotations remain fully supported:
  - `@story <story-path>`
  - `@req <REQ-ID>`
- The unified rule and its aliases MUST:
  - Accept either `@supports` or the combination of `@story` + `@req` as satisfying traceability presence checks (REQ-REQUIRE-ACCEPTS-SUPPORTS).
  - Treat mixed usage (both styles on the same element) as valid for validation purposes, deferring stylistic guidance to the migration rule.

### 4. Migration rule and alias

- `traceability/prefer-supports-annotation` is the **canonical migration rule** that:
  - Encourages and auto-fixes `@story` + `@req` into `@supports` where safe.
  - Is **disabled by default** to preserve backward compatibility.
- `traceability/prefer-implements-annotation` is retained as a **deprecated alias**:
  - It is wired to the same implementation as `prefer-supports-annotation`.
  - Its `meta.deprecated` flag is set to `true` and `meta.replacedBy` lists `"prefer-supports-annotation"`.
  - Rule descriptions clarify that `prefer-supports-annotation` is the preferred name.

### 5. Preset behaviour

- Flat-config presets exposed by the plugin (`configs.recommended`, `configs.strict`) MUST:
  - Enable `traceability/require-traceability` as the primary function-level rule.
  - MAY enable supporting rules such as `valid-annotation-format`, `valid-story-reference`, `valid-req-reference`, and `require-branch-annotation` at recommended severities.
  - MUST NOT enable legacy alias keys by default; aliases exist primarily for older configurations.

## Rationale

- A single canonical rule key simplifies configuration, documentation, and mental models:
  - Users enable `traceability/require-traceability` and get both story- and requirement-level checks.
- Legacy alias keys preserve backwards compatibility without fragmenting behaviour:
  - Because they share the same implementation, fixing a bug or adding a feature in the canonical rule automatically applies to the aliases.
- `@supports` provides a clearer, more scalable annotation model, especially for multi-story integration functions, while still allowing gradual migration.
- A dedicated migration rule (`prefer-supports-annotation`) separates **behavioural correctness** (validation) from **style/format preference** (which annotation form to use), keeping concerns clean.

## Consequences

### Positive

- **Consistent behaviour**: All three function-level keys (`require-traceability`, `require-story-annotation`, `require-req-annotation`) share a single implementation, preventing behavioural drift.
- **Clear guidance**: Documentation, stories, and presets can confidently recommend `require-traceability` as the one rule most users need to turn on.
- **Safe migration**: Teams can adopt `@supports` gradually while keeping existing `@story`/`@req` annotations valid.
- **Traceability clarity**: Multi-story integration functions can accurately express which requirements from which stories they support, aligning with ADR 011 and story 010.2.

### Negative / Trade-offs

- The alias wiring logic in `src/index.ts` becomes slightly more complex to ensure metadata merging behaves as intended.
- Some advanced users may still choose to reference alias keys directly (e.g., to tune severities independently), which requires documenting that they are legacy names.
- The `prefer-implements-annotation` alias adds a small amount of historical baggage that must be maintained until a future major version removes it.

## Alternatives Considered

1. **Keep legacy rules fully separate**
   - Each of `require-story-annotation` and `require-req-annotation` would maintain its own implementation and configuration.
   - Rejected because it increases maintenance cost, duplicates logic, and makes it difficult to guarantee consistent behaviour across rule keys.

2. **Deprecate and remove legacy rule keys immediately**
   - Force all users to migrate to `require-traceability` in a single major release.
   - Rejected because it would break existing configurations for little gain; aliases are cheap to maintain once they share the same implementation.

3. **Expose only `@supports` and deprecate `@story` / `@req` entirely**
   - Remove legacy annotation forms from validation rules.
   - Rejected because large, existing codebases use `@story`/`@req` heavily; dropping support would be disruptive and contrary to the incremental migration strategy in story 010.3.

## Implementation Notes

- The unified rule implementation in `src/rules/require-traceability.ts`:
  - Imports the legacy rules from `./require-story-annotation` and `./require-req-annotation`.
  - Merges their listeners by event name, so that both rule behaviours run for each relevant node.
  - Exposes a combined `meta` object with unioned `messages` and a simple `schema: []`.
- The alias wiring block in `src/index.ts`:
  - Locates the canonical rule and both legacy rules in the `rules` map.
  - Builds alias RuleModules whose `meta` merges canonical and legacy `meta` objects (docs, messages, schema, fixability, and deprecation flags), while reusing the canonical `create` function.
- The migration wiring block in `src/index.ts`:
  - Promotes `prefer-supports-annotation` as the primary rule name:
    - Copies the implementation and metadata from `prefer-implements-annotation`.
    - Clears `deprecated` on the primary name.
  - Marks `prefer-implements-annotation` as deprecated with an appropriate `replacedBy` list and description suffix.

## Validation

We consider this ADR implemented and kept in sync when:

- `src/rules/require-traceability.ts` remains the single source of truth for function-level behaviour.
- `src/index.ts` continues to wire:
  - `require-story-annotation` → alias of `require-traceability`.
  - `require-req-annotation` → alias of `require-traceability`.
  - `prefer-supports-annotation` → canonical migration rule.
  - `prefer-implements-annotation` → deprecated alias of `prefer-supports-annotation`.
- Presets (`configs.recommended`, `configs.strict`) enable `traceability/require-traceability` and do not enable alias keys by default.
- User-facing docs (README, user-docs/api-reference.md, user-docs/traceability-overview.md, user-docs/migration-guide.md) describe:
  - `require-traceability` as the canonical function-level rule.
  - `require-story-annotation` and `require-req-annotation` as legacy aliases sharing the same engine.
  - `@supports` as the preferred annotation form for new and multi-story code, with `@story`/`@req` documented as backward-compatible alternatives.

## Related Stories and Decisions

- Story 003.0-DEV-FUNCTION-ANNOTATIONS: Core function annotation validation and unified rule export requirements.
- Story 010.2-DEV-MULTI-STORY-SUPPORT: `@supports` annotation semantics and validation.
- Story 010.3-DEV-MIGRATE-TO-SUPPORTS: Migration rule, auto-fix behaviour, and documentation requirements.
- ADR 010: Multi-story requirements with the original `@implements` naming.
- ADR 011: Rename `@implements` to `@supports` to avoid TypeScript conflicts.
