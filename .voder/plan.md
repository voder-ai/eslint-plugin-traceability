## NOW  
Modify CHANGELOG.md to add a new “## [1.0.0] – 2025-11-16” section with bullet points summarizing all v1.0.0 changes so the changelog version matches package.json.

## NEXT  
- Add `lib/` (and any other build output directories) to `.gitignore` to stop committing artifacts.  
- Update the Husky pre-push hook (`.husky/pre-push`) to include running the CLI integration tests (e.g. add `node cli-integration.js` after the existing checks).  
- Create a new GitHub Actions workflow file (`.github/workflows/deploy.yml`) that:  
  1. Triggers on `push` to `main`.  
  2. Checks out the code, installs dependencies, runs build/test/lint.  
  3. Publishes the package to npm via `npm publish` (using `NODE_AUTH_TOKEN` secret).  
  4. Uploads the built `lib/` directory as a GitHub release artifact.  
- Adjust the existing release job trigger in `ci.yml` to remove “tags only” gating so that the `deploy.yml` workflow handles publishing automatically on every merge to `main`.  

## LATER  
- Add a CI smoke-test job that installs the freshly published package in a clean workspace and runs a basic CLI command to verify the npm release.  
- Migrate to semantic-release or GitHub’s “release” event to automate version bumping and changelog generation.  
- Document these version-control and CD workflow decisions in an ADR (e.g. `docs/decisions/ADR-version-control-and-CD.md`).  
- Continuously monitor and enforce parity between the local Husky hooks and the CI workflows, adding any missing checks to both.