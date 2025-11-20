# ADR: Accept residual risk for glob/npm high-severity transitive dev dependency

Status: proposed

## Context

The CI dev dependency audit (ci/npm-audit.json) reports a high-severity advisory for `glob` and `npm` transitively required by `@semantic-release/npm`. Fixes are available upstream but require coordination and may not be immediately possible without an update to semantic-release or npm bundled tooling.

## Decision

We accept the residual risk in development dependencies for the current release while tracking the issue in a scheduled reassessment. This ADR documents the rationale and mitigations.

## Consequences and mitigations

- Owner: DevOps/Release Engineer (team)
- Reassessment: Weekly during dependency-health scheduled workflow runs
- Mitigations:
  - Do not ship production code that depends on vulnerable dev-time tooling
  - CI pipeline uses `npm ci` and runs production `npm audit` which must pass for releases
  - Develop a plan to upgrade `@semantic-release/npm` to a version that avoids bundling vulnerable `glob`/`npm` when safe

## References

- Vulnerability details: see ci/npm-audit.json stored in CI artifacts

Created autonomously by voder.ai
