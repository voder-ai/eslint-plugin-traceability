## NOW  
Create `user-docs/api-reference.md` containing a skeleton outline of the plugin’s public API (listing each exported rule and config).

## NEXT  
- Populate `user-docs/api-reference.md` with detailed descriptions, options, default values, and JSDoc‐style examples for every rule and config.  
- Add `user-docs/examples.md` with runnable end-to-end ESLint configurations and CLI invocation scenarios.  
- Update `README.md` to link to the new API reference and examples under `user-docs/`.  
- Replace the separate `ci.yml` and `deploy.yml` workflows with a single `.github/workflows/ci-cd.yml` that on every push to `main` runs build, lint, type-check, test, audit, and then publishes to npm.  
- Remove or disable the old `deploy.yml` and adjust any branch/tag filters so only `ci-cd.yml` handles publishing.

## LATER  
- In `ci-cd.yml`, add a smoke-test job that installs the freshly published package in a clean workspace and exercises basic CLI commands.  
- Record the unified CI/CD and documentation decisions in ADRs (e.g. `docs/decisions/ADR-unified-cicd.md`, `docs/decisions/ADR-api-reference.md`).  
- Migrate to semantic-release (or GitHub Releases) to automate version bumps and changelog updates.  
- Introduce a scheduled dependency/vulnerability audit job in CI to catch new advisories early.