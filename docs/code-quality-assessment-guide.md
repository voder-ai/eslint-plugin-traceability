# Code Quality Assessment Guide

This guide explains how maintainers and automated tools should approach
CODE_QUALITY analysis for `eslint-plugin-traceability` using the **slice-based
strategy** defined in `docs/code-quality-assessment-slices.md` and
`.voder-code-quality-slices.json`.

## Goals

- Avoid context/execution limits when analyzing the repository as a whole.
- Provide a **repeatable, documented process** for running CODE_QUALITY
  assessments on subsets of the codebase.
- Ensure that at least one **high-value slice** (`rules-and-helpers`) can
  always be assessed, even under strict limits.

## Slices at a Glance

The canonical slice definitions live in:

- `docs/code-quality-assessment-slices.md` (human-readable)
- `.voder-code-quality-slices.json` (machine-readable)

Current slices:

1. `rules-and-helpers` (priority 1)
2. `maintenance-and-cli` (priority 2)
3. `plugin-and-config` (priority 3)
4. `tooling-and-ci` (priority 4)

See `docs/code-quality-assessment-slices.md` for details.

## How to Run a Slice-Based CODE_QUALITY Assessment

### 1. Choose a target slice

Start with the **highest-priority slice**:

1. `rules-and-helpers`
2. `maintenance-and-cli`
3. `plugin-and-config`
4. `tooling-and-ci`

If tooling or model limits prevent analyzing all slices, it is acceptable to
analyze only the first one or two slices, as long as the chosen
slice(s) fit comfortably within context limits.

### 2. Restrict file loading to slice paths

When running CODE_QUALITY analysis (manually or via automation):

1. Read `.voder-code-quality-slices.json`.
2. Select the desired slice by `id` (e.g. `rules-and-helpers`).
3. Build the file list by expanding each entry in `paths` relative to the
   repository root.
4. **Only load these files** into the analysis context.

Do **not** attempt to add additional directories (like `docs/` or `.voder/`)
for CODE_QUALITY analysis; those areas are covered by other assessments.

### 3. Analyze and record results per slice

For each slice you analyze:

- Record which slice ID was used (e.g. `rules-and-helpers`).
- Summarize:
  - Notable strengths (structure, readability, test coverage alignment).
  - Specific improvement opportunities (e.g. large functions, complex
    branches, duplication, or missing traceability annotations).
- If the analysis stopped early due to context limits, note that explicitly.

### 4. Handling context errors

If a CODE_QUALITY run still fails with a context/size error **for a single
slice**:

1. Identify which directories or files inside that slice are the largest
   contributors (for example, very large test files).
2. Refine the slices by splitting the offending slice into two or more
   smaller slices (e.g. `rules-core` and `rules-edgecases`).
3. Update both:
   - `.voder-code-quality-slices.json`
   - `docs/code-quality-assessment-slices.md`
4. Re-run CODE_QUALITY on the new highest-priority slice.

The aim is to iterate in **small, safe steps**, always keeping at least one
slice analyzable.

## Minimum Acceptable Assessment

For CODE_QUALITY to be considered sufficiently evaluated for this project:

- At **minimum**, the `rules-and-helpers` slice must be analyzed successfully.
- Additional slices (especially `maintenance-and-cli`) should be added over
  time as context budgets allow, but they are **secondary** to the core rules.

## Relationship to Other Quality Gates

Slice-based CODE_QUALITY does **not** replace existing automated quality
gates:

- ESLint (`npm run lint`) with max-warnings=0
- Type checking (`npm run type-check`)
- Jest tests with coverage thresholds
- Duplication checks (`npm run duplication`)
- Dependency audits and security checks

Instead, slice-based CODE_QUALITY provides **deeper, human/language-model
review** of maintainability, structure, and style **within the constraints** of
available context.

By following this guide and the slice definitions, future CODE_QUALITY
assessments should complete without running into context-size issues and can
focus on actionable improvements in each part of the codebase.