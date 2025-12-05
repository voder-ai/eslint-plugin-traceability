# Core CODE_QUALITY Review Scope

_Last updated: 2025-12-05_

This internal document defines the **minimal set of core source and test
directories** that SHOULD be the **primary focus** for CODE_QUALITY reviews of
`eslint-plugin-traceability`.

It exists to keep future CODE_QUALITY assessments small, high‑value, and
repeatable even when tooling or models have tight context limits.

## Relationship to slice configuration

- The core focus described here intentionally matches the
  `rules-and-helpers` slice defined in:
  - `docs/code-quality-assessment-slices.md`
  - `.voder-code-quality-slices.json` (machine‑readable, ignored from git)
- When CODE_QUALITY can only analyze **one** slice, it SHOULD always prefer
  this core focus first.

## Minimal core directories for CODE_QUALITY

When running CODE_QUALITY assessments in a constrained context, restrict
analysis to ONLY the following directories (relative to the repo root):

1. `src/rules`
   - All ESLint rule implementations.
   - This is the highest‑value surface for maintainability and correctness
     review because it defines user‑visible behavior.

2. `src/utils`
   - Shared traceability utilities and helpers used by rules (for example,
     annotation detection and AST helpers).
   - These utilities directly influence rule behavior and are part of the
     "core" rules surface.

3. `tests/rules`
   - Jest/RuleTester suites that validate rule behavior.
   - Including these tests in CODE_QUALITY review allows assessors to cross‑check
     implementation structure against behavioral coverage.

4. `tests/utils`
   - Test‑only helpers that support rule tests (for example, AST factories,
     parser options, and shared fixtures).
   - While not shipped to users, they are small and tightly coupled to the
     rule surface, so reviewing them alongside `tests/rules` provides a
     complete picture.

## How to use this scope in assessments

When a CODE_QUALITY assessment for this project needs to minimize context:

1. Treat the directories above as the **authoritative core focus**.
2. Build the file list **only** from these paths (respecting `.gitignore`).
3. Avoid expanding the scope to maintenance CLI, plugin wiring, documentation,
   or CI tooling unless additional context budget is explicitly available.

Higher‑priority assessments (for example, determining whether CODE_QUALITY is
"passing" for the purposes of FUNCTIONALITY) SHOULD be based at minimum on a
successful, non‑truncated review of this core surface.
