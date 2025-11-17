---
status: "accepted"
date: 2025-11-17
decision-makers: [Development Team]
consulted: [Implementation Plan, ESLint Documentation]
informed: [All Contributors]
---

# Code Quality Ratcheting Plan

## Context and Decision Drivers

The project currently enforces maintainability through ESLint rules `max-lines-per-function` and `complexity` with thresholds that allow overly large functions and moderately high cyclomatic complexity. While these thresholds have kept development velocity high, they permit functions and branches that are too complex to maintain effectively over time.

To systematically improve code quality and maintainability, we will implement an incremental ratcheting plan that gradually tightens these ESLint rules across multiple sprints, ensuring continuous improvement without large-scale refactors in a single release.

## Considered Options

1. **Immediate Strict Enforcement**: Set aggressive thresholds (e.g., 50 lines/function, complexity max 10) immediately.
2. **No Change**: Maintain current thresholds indefinitely.
3. **Incremental Ratcheting**: Gradually reduce thresholds over successive sprints.

### Decision Outcome

We choose **Incremental Ratcheting** (Option 3) to balance maintainability improvements with manageable refactoring efforts.

## Ratcheting Schedule

| Sprint         | `max-lines-per-function` |         `complexity` | Success Criteria                            |
| -------------- | -----------------------: | -------------------: | ------------------------------------------- |
| Now (Sprint 0) |                       65 |                   18 | No ESLint violations against new thresholds |
| Sprint 1 (2w)  |                       60 |                   16 | All functions ≤60 lines, all methods comply |
| Sprint 2 (4w)  |                       55 |                   14 | All functions ≤55 lines, complexity ≤14     |
| Sprint 3 (6w)  |                       50 |                   12 | All functions ≤50 lines, complexity ≤12     |
| Final Review   |         Default (revert) | Default (see ESLint) | Remove explicit overrides, rely on defaults |

- **Timeline**: Each sprint is bi-weekly (2 weeks) aligned with release cycles.
- **Metrics**: ESLint violations count per rule must be zero at each milestone.
- **Automation**: CI will enforce thresholds and fail builds on any violations.

## Implementation Steps

1. Update `eslint.config.js` to set the `max-lines-per-function` and `complexity` rules to the Sprint 0 values.
2. Configure CI/CD to fail on any rule violations by running `npm run lint -- --max-warnings=0`.
3. Identify and refactor existing functions and branches that exceed the new thresholds.
4. At the end of each sprint, verify zero violations, then ratchet thresholds to the next values.
5. After the final Sprint, remove explicit rule overrides to revert to ESLint defaults.

## Future Review

- At each sprint boundary, review the ratcheting plan and adjust if necessary.
- Consider additional ratcheting for other style rules (e.g., `max-lines-per-file`, `max-params`).
- Document the ratcheting process in CONTRIBUTING.md for new contributors.
