## NOW
Update the CI/CD workflow (`.github/workflows/ci-cd.yml`) to replace the `npm publish --dry-run` step with a real `npm publish --access public` invocation that runs automatically on every push to `main` when `secrets.NPM_TOKEN` is set.

## NEXT
- Remove the committed `lib/` build artifacts from version control (`git rm -r --cached lib/`) and add `lib/` to `.gitignore`.  
- Refactor the CI job to build once, upload the compiled artifacts as a workflow artifact, and then download them in the publish step to ensure correct artifact tracking.  
- Consolidate quality‐check and deploy steps into a single `quality-and-deploy` job that gates on `secrets.NPM_TOKEN` and publishes without manual approval.

## LATER
- Introduce semantic-release (or a similar tool) to automate version bumps, changelog generation, Git tagging, and npm publication.  
- Add a post-deployment health-check job that installs the just-published package and runs an end-to-end ESLint plugin smoke test.  
- Periodically review and ratchet CI security and dependency audit thresholds to maintain a robust release pipeline.