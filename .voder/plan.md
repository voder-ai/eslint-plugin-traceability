## NOW
Modify the GitHub Actions CI workflow (`.github/workflows/ci.yml`) to trigger the existing release job on every push to the `main` branch (not just on tag pushes), enabling automatic publishing of new package versions on main-branch merges.

## NEXT
- Remove any `continue-on-error: true` setting from the security audit step in `.github/workflows/ci.yml` so that audit failures block the CI build, aligning CI behavior with the pre-push hook.  
- Update the Husky pre-push hook (`.husky/pre-push`) to invoke the same `npm audit --audit-level=high` command without allowing errors, ensuring both CI and pre-push use identical exit-code handling.  
- Add `.voder/` to `.gitignore` so that internal Voder process files are not tracked in version control.

## LATER
- Refactor the Husky pre-commit hook to use `lint-staged` for staged-file formatting and linting, improving performance by only processing changed files.  
- Add a lightweight “smoke test” or post-release validation job in CI that installs the published package and runs a basic lint check to verify the release pipeline end-to-end.