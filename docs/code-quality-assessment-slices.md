# Code Quality Assessment Slices

_Last updated: 2025-12-04_

This document defines **logical code slices** for eslint-plugin-traceability so that
CODE_QUALITY-style analysis can run on smaller, self-contained parts of the
repository instead of attempting to load the entire project at once.

The goal is to:

- Keep each slice small enough to fit comfortably within model/context limits.
- Group related source and test files together (rules, helpers, maintenance CLI, etc.).
- Ensure at least one high-priority slice can always be analyzed even if others are
  temporarily too large.

These slices are also encoded in the machine-readable configuration file
`.voder-code-quality-slices.json` at the repository root.

## High-level strategy

The codebase is organized roughly into four concerns:

1. **Core ESLint rules and helpers** (`src/rules`, `src/utils`, `tests/rules`, `tests/utils`)
2. **Maintenance API and CLI** (`src/maintenance`, `tests/maintenance`, `tests/integration`, fixtures)
3. **Plugin entrypoint and ESLint configuration** (`src/index.ts`, config files, plugin/config tests)
4. **Tooling and CI helpers** (`scripts`, `.github/workflows`)

To avoid context explosions, **documentation is intentionally excluded** from these
CODE_QUALITY slices; documentation is covered separately by the documentation
assessment pipeline.

## Slice definitions

Each slice below is also represented in `.voder-code-quality-slices.json` with the
same `id`, `paths`, and `priority`.

### 1. `rules-and-helpers` (priority 1)

**Purpose:**

- Capture the heart of the plugin: all ESLint rules plus their shared helper
  utilities and tests.
- Provide a **small, high-value slice** that can always be analyzed even under
  tight context limits.

**Included paths (relative to repo root):**

- `src/rules`
- `src/utils`
- `tests/rules`
- `tests/utils`

**Notes:**

- This slice deliberately **excludes** maintenance code, plugin entrypoint wiring,
  CI scripts, and documentation to minimize size.
- When only one slice can be analyzed, this is the default and highest-priority
  target for CODE_QUALITY.

### 2. `maintenance-and-cli` (priority 2)

**Purpose:**

- Cover maintenance operations and the `traceability-maint` CLI: detection,
  update, verification, and reporting of annotations.

**Included paths:**

- `src/maintenance`
- `tests/maintenance`
- `tests/integration`
- `tests/fixtures/stale`
- `tests/fixtures/update`
- `tests/fixtures/valid-annotations`

**Notes:**

- This slice can be analyzed independently of the rules: it focuses on
  filesystem traversal, safety checks, CLI behavior, and JSON/report output.
- If context is tight, prefer analyzing this slice **after**
  `rules-and-helpers`.

### 3. `plugin-and-config` (priority 3)

**Purpose:**

- Capture the plugin entrypoint wiring and flat-config presets, plus associated
  tests for configuration behavior.

**Included paths:**

- `src/index.ts`
- `eslint.config.js`
- `jest.config.js`
- `tsconfig.json`
- `tests/config`
- `tests/plugin-setup.test.ts`
- `tests/plugin-default-export-and-configs.test.ts`
- `tests/plugin-setup-error.test.ts`
- `tests/cli-error-handling.test.ts`

**Notes:**

- This slice is smaller than the full repository but larger than
  `rules-and-helpers`.
- It is useful for verifying that rules are correctly exported, configs are
  wired as documented, and CLI-level error handling is robust.

### 4. `tooling-and-ci` (priority 4)

**Purpose:**

- Group build scripts and CI workflow definitions that support development and
  release automation.

**Included paths:**

- `scripts`
- `.github/workflows`

**Notes:**

- This slice is **lowest priority** for CODE_QUALITY; analyze it only if there
  is sufficient context budget after higher-priority slices.
- Scripts are already exercised indirectly via `npm run` commands in CI; this
  slice is mainly for style/maintainability review of supporting tooling.

## Using slices for CODE_QUALITY analysis

Automated assessment tools (including external CODE_QUALITY runs) should:

1. Load `.voder-code-quality-slices.json`.
2. Select a target slice (by `id`) based on priority and available context.
3. Restrict file loading to the union of `paths` listed for that slice.
4. Analyze additional slices in separate passes, rather than combining all
   slices into a single massive context.

### Recommended minimum viable target

- **Always prefer `rules-and-helpers` first.** It provides the best signal for
  overall code quality while remaining small enough to avoid context issues.
- If context still proves too tight even for this slice, the next step would be
  to further sub-divide it (for example, splitting `src/rules` and `tests/rules`
  into multiple smaller groups by feature). That refinement can be done by
  editing `.voder-code-quality-slices.json` and updating this document.

### Handling future context issues

If a CODE_QUALITY run against a given slice still exceeds context limits:

1. **Identify the heaviest directories or files** within that slice
   (e.g. large test files or helper modules).
2. **Split the slice** into two or more smaller slices, each with a disjoint set
   of paths (for example, `rules-core` and `rules-edgecases`), and adjust the
   `priority` values accordingly.
3. Update `.voder-code-quality-slices.json` and this document in the same
   change, then rerun CODE_QUALITY against the new highest-priority slice.

By following this pattern, the codebase can grow while maintaining a
**stable, repeatable CODE_QUALITY workflow** that never attempts to load the
entire repository into a single model context.
