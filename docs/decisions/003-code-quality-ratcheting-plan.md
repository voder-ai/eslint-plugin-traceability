---
status: "accepted"
date: 2025-11-16
decision-makers: [Development Team]
consulted: [Implementation Plan, ESLint Documentation]
informed: [All Contributors]
---

# 003-Code Quality Ratcheting Plan

## Context and Decision Drivers

The project currently enforces maintainability through ESLint `max-lines-per-function` and `max-lines` rules with thresholds set to 200 lines/function and 1000 lines/file. These loose thresholds present technical debt and allow overly large functions and files, which can hinder readability, maintainability, and increase complexity over time.

Ratcheting is applied with particular focus on the `rules-and-helpers` slice as defined in `.voder-code-quality-slices.json` and `docs/code-quality-assessment-slices.md`, since that slice has the greatest impact on overall CODE_QUALITY and plugin correctness.

## Considered Options

1. Adopt strict industry-standard thresholds immediately (e.g., 100 lines/function, 500 lines/file).
2. Maintain the current loose thresholds indefinitely.
3. Implement an incremental ratcheting plan to gradually reduce thresholds over multiple sprints.

## Decision Outcome

We will implement option 3: an incremental ratcheting plan to gradually reduce the ESLint thresholds:

- **Sprint 0 (Now)**: Reduce `max-lines-per-function` to 150 and `max-lines` to 800.
- **Sprint 2 (Completed 2025-11-16)**: Reduce `max-lines-per-function` to 120 and `max-lines` to 600.
- **Sprint 4**: Reduce `max-lines-per-function` to 100 and `max-lines` to 500.

Automation:

- Update the ESLint configuration to enforce the new thresholds immediately.
- Configure the CI pipeline to fail on any new violations of these rules.
- Document the ratcheting schedule in this ADR and revisit the plan at each milestone.

## Relationship to Slice-based CODE_QUALITY

- For CODE_QUALITY evaluation, ratcheting thresholds are applied and measured primarily on the `rules-and-helpers` slice (as defined in `.voder-code-quality-slices.json` and described in `docs/code-quality-assessment-slices.md`).
- In CODE_QUALITY assessments, violations of these ratcheted thresholds within the `rules-and-helpers` slice must be treated as **Blockers**, in line with the criteria described in `docs/code-quality-assessment-guide.md`.
- Other slices (`maintenance-and-cli`, `plugin-and-config`, `tooling-and-ci`) may adopt similar ratcheting rules over time, but the initial and strictest enforcement focus is on the `rules-and-helpers` slice to ensure the core rule logic remains highly maintainable.

## Consequences

- Ensures maintainability improves in manageable increments, reducing developer overhead per sprint.
- Provides clear visibility into the schedule and expectations for code size reductions.
- Allows refactoring efforts to be planned and executed incrementally, avoiding large-scale rewrites.
- Guarantees continuous improvement by automating enforcement in CI.

## Future Review

At the end of each milestone sprint, the team will:

- Review existing violations.
- Refactor code to comply with the new thresholds.
- Update this ADR if any adjustments to the schedule are required.