## NOW
Generate the missing `cli-integration.js` at the project root as a stub implementation for ESLint plugin integration, matching the usage examples referenced in `README.md` and `docs/cli-integration.md`.

## NEXT
- Update `README.md` and `docs/cli-integration.md` to point to the new `cli-integration.js` script, including a copy-and-paste usage example.  
- Add entries for versions 1.0.2 and 1.0.3 in `CHANGELOG.md` (with dates and summaries of the released changes).  
- Either author the promised “Migration Guide” under `user-docs/migration-guide.md` or remove all references to it from user-facing documentation.

## LATER
- Remove committed build artifacts (`lib/`) and ensure they remain in `.gitignore`.  
- Refactor `.github/workflows/ci-cd.yml` to replace the dry-run publish with a real `npm publish --access public` on every push to `main`, consolidate quality and deploy steps into one job, and guard on the presence of `secrets.NPM_TOKEN`.  
- Introduce semantic-release (or similar) to automate version bumps, Git tags, and CHANGELOG generation.  
- Add a CI post-deployment health-check job that installs the published package and verifies end-to-end ESLint plugin behavior.