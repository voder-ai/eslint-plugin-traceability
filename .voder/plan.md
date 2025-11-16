## Updated Plan

## NOW
Generate a GitHub Actions CI workflow file (`.github/workflows/ci.yml`) that runs the full quality-check pipeline (build, type-check, lint, test, format:check, and `npm audit`) on every push.

## NEXT
- Install and configure Husky and lint-staged:
  - `npm install --save-dev husky lint-staged`
  - `npx husky install`
  - Add a `pre-commit` hook to run `npm run format:check`, `npm run lint`, and `npm run type-check`
  - Add a `pre-push` hook to run `npm test`
  - Add a `lint-staged` section to `package.json` to format and lint only staged files  
- Create a `.prettierignore` to exclude `lib/` and `.voder/` artifacts from formatting checks  
- Verify that `npm run lint` and `npx eslint` now execute successfully under the new CI and local hooks configuration

## LATER
- Run `npm audit fix` (and `npm audit fix --force` if needed), document any remaining vulnerabilities in `docs/security-incidents/` and track remediation  
- Flesh out `README.md` with installation, configuration, usage examples, and links to `docs/`  
- Commit the `package-lock.json`, enable Dependabot or Renovate for automated dependency updates  
- Add an `.env.example` for any future environment variables and update project documentation accordingly  
- Review and update version control policies (e.g., branch protection, PR templates) to enforce the new CI and hook requirements