## NOW
In `.github/workflows/ci-cd.yml`, collapse the separate `quality-checks` and `deploy` jobs into a single `quality-and-deploy` job that runs all quality gates (build, lint, type-check, tests, format-check, security audit) and then publishes the package.

## NEXT
- Delete the old `deploy` job block and remove any duplicate build/test/lint steps from the workflow.
- In the new `quality-and-deploy` job, after the quality steps, add the publish step (e.g. `npm publish` with `NPM_TOKEN`).
- Update any `needs:` or `if:` settings so that there is only one job on push to `main`.
- Commit and push these changes, then verify that a single CI/CD run builds, tests, lints, type-checks, formats, audits, and publishes the package end-to-end.

## LATER
- Write an ADR under `docs/decisions/` documenting the switch to a unified CI/CD workflow.
- Add a CI YAML linter or schema check to flag future duplicate steps.
- Optimize caching and parallelism in the unified job to reduce pipeline runtime.