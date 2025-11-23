## NOW

- [ ] Identify the production TypeScript and JavaScript functions that currently have the largest bodies and are likely to exceed a 55-line limit, and decide which ones should be refactored into smaller helpers first to support tightening the max-lines-per-function rule.

## NEXT

- [ ] Update the linting configuration so that the maximum allowed function length for production code is reduced from 60 lines to 55 lines, keeping test-specific relaxations unchanged.
- [ ] Refactor the selected long functions into smaller, clearly named helper functions that each have a single responsibility while preserving existing behavior and maintaining the current traceability annotations.
- [ ] Revisit any remaining functions that hit the new limit and iteratively split or simplify them until they comply with the 55-line constraint without introducing duplication or unnecessary complexity.

## LATER

- [ ] Plan the next incremental reduction of the max-lines-per-function limit (for example from 55 to 50) in alignment with the existing code-quality ratcheting ADR and identify future refactor targets to support that change.
- [ ] Address the modest duplication reported in larger test files by extracting common setup and assertion helpers, improving maintainability without changing test behavior.
- [ ] Reassess overall code-quality metrics after these refactors to confirm that function size, complexity, and duplication trends are heading in the desired direction and update the ratcheting ADR to reflect the new baseline.
