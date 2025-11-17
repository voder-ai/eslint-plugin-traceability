## NOW
Modify `.github/workflows/ci-cd.yml` to add an `npm publish --access public` step (using the `NPM_TOKEN` secret) in the `publish` job immediately after the quality‐checks have passed.

## NEXT
- Update the `smoke-test` job in `.github/workflows/ci-cd.yml` to install the newly published package from npm into a temporary directory (e.g. `npm install <package>@latest`) and run a basic smoke test (such as invoking `eslint --print-config` or a sample lint check against fixture code).  
- Remove the existing `npm pack` step from the `publish` job so that only `npm publish` runs.  
- Append `npm run type-check` to the Husky `pre-commit` hook in `.husky/pre-commit` to catch type errors before commits.

## LATER
- Introduce a post-deployment “health-check” job in CI that spins up an isolated environment (Docker, Codespaces, etc.), installs the published package, and verifies end-to-end plugin behavior.  
- Adopt semantic-release (or a similar tool) to fully automate version bumps, tagging, and CHANGELOG generation on each publish.  
- Schedule automated dependency audits and update PRs via GitHub Actions (Dependabot/renovate).  
- Continue ratcheting ESLint thresholds and refactoring per the incremental ratcheting ADR.