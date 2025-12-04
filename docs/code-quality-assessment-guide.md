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

## Interpreting CODE_QUALITY results for `rules-and-helpers`

The `rules-and-helpers` slice is the highest-priority area for CODE_QUALITY,
and its status directly influences higher-level assessments.

### Valid vs. invalid runs

A CODE_QUALITY run for `rules-and-helpers` is considered **valid** only when:

- The slice definition is taken from `.voder-code-quality-slices.json` (and is
  consistent with `docs/code-quality-assessment-slices.md`).
- The run completes without context/size errors or truncation.
- The analysis explicitly records that the `rules-and-helpers` slice was used.

If a run fails due to context/size limits, or the tool reports truncated
output, the assessment for `rules-and-helpers` is treated as **not run**.
Maintainers must then:

- Refine the slice definitions (for example, splitting `rules-and-helpers`
  into smaller sub-slices) in both:
  - `.voder-code-quality-slices.json`
  - `docs/code-quality-assessment-slices.md`
- Or temporarily reduce scope (for example, focusing on the highest-impact
  rule files first)
- And re-run CODE_QUALITY until a full, non-truncated assessment completes.

### What constitutes a “passing” outcome

Within a **valid** run, `rules-and-helpers` is considered **passing** when:

- There are **no violations** of the current ratcheted ESLint thresholds as
  defined in `docs/decisions/code-quality-ratcheting-plan.md` (for example,
  complexity, max-lines, or other structural constraints that have been
  ratcheted for this project).
- Core rule implementations and their helpers:
  - Have appropriate traceability annotations where required by
    `eslint-plugin-traceability` itself.
  - Are not missing coverage for critical/central code paths (for example,
    major branches or configuration modes used in production scenarios).
- There are **no critical structural issues** such as:
  - Extremely large or deeply nested functions that clearly exceed the
    project’s ratcheted expectations.
  - Architectural tangles or tight coupling that would block safe
    evolution of core rules.
  - Repeated patterns of duplication that would make future changes error-prone.

“Passing” does **not** mean “perfect”; it means that no findings rise to the
level of a **Blocker** (defined below).

### Classifying findings

All findings from a `rules-and-helpers` assessment should be categorized into
one of three buckets:

1. **Blockers**

   These are issues that must be resolved **before FUNCTIONALITY can rely on
   this slice as “healthy”**. Examples:

   - Confirmed violations of ratcheted ESLint thresholds that were intended
     to be hard limits under the current plan in
     `docs/decisions/code-quality-ratcheting-plan.md`.
   - Missing or clearly incorrect traceability annotations on core rule
     code paths that affect how rules are interpreted or enforced.
   - Uncovered or untested **core** rule paths, where a failure would have
     significant user or safety impact.
   - Structural problems that would make correct behavior difficult to
     reason about (for example, very complex conditionals driving rule
     behavior with no tests and no clear decomposition).

   Blockers **must** be refactored or otherwise addressed before this slice
   can be considered passing for use in higher-level FUNCTIONALITY decisions.

2. **Near-term improvements**

   These are non-blocking issues that should be planned in the **near term**
   (for example, upcoming sprints or refactoring windows) but do **not**
   prevent FUNCTIONALITY from relying on the current implementation. Examples:

   - Code that is moderately complex but still within ratcheted thresholds,
     where restructuring would improve maintainability.
   - Helper functions or rule branches that are tested but would benefit
     from clearer naming, smaller units, or reduced duplication.
   - Traceability annotations that exist but are incomplete, inconsistent,
     or harder to maintain than necessary.
   - Known technical debt that does not threaten correctness but raises the
     cost of future work.

   These items should be tracked and scheduled, but they do not change the
   pass/fail status for the slice.

3. **Informational observations**

   These are neutral or low-risk observations that:

   - Highlight patterns worth monitoring.
   - Suggest possible future refactorings or documentation improvements.
   - Provide context about trade-offs that are acceptable under the current
     ratcheting plan.

   Informational observations do not require tracking as tasks unless
   maintainers choose to, and they do **not** affect pass/fail status.

### Relationship to higher-level assessments

For the purposes of higher-level quality gates and project decisions:

- CODE_QUALITY for `rules-and-helpers` is considered **passing** only when:
  - A **valid** run (no context/size errors) has completed; and
  - There are **no open Blockers** remaining for this slice.
- If Blockers are present, CODE_QUALITY for `rules-and-helpers` is
  considered **failing**, even if tests, linting, and other gates are green.
- If the run fails due to context limits or is otherwise invalid, CODE_QUALITY
  for `rules-and-helpers` is considered **not run**, and maintainers must
  refine slices or reduce scope and attempt the assessment again.

This classification ensures that `rules-and-helpers` remains the most
scrutinized and reliable part of the codebase, in line with the priorities
described in `docs/code-quality-assessment-slices.md` and the ratcheting
strategy in `docs/decisions/code-quality-ratcheting-plan.md`.

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