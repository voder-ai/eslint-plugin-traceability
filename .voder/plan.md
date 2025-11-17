## NOW
Modify the `"license"` field in `package.json` from `"ISC"` to `"MIT"` so it exactly matches the text of the root `LICENSE` file.

## NEXT
- Update the Husky pre-push hook to run `npm audit --production --audit-level=moderate` and fail on any moderate-or-higher vulnerabilities.  
- Update the GitHub Actions CI workflow (`.github/workflows/ci-cd.yml`) to use `npm audit --production --audit-level=moderate` in its audit step.  
- Add a new scheduled “dependency-health” job in the CI workflow that runs daily, executes `npm audit --production --audit-level=moderate`, and fails the run (blocking merges) if any moderate-or-higher issues are found.

## LATER
- After audit hooks and the scheduled dependency-health job are in place and passing, proceed with the full functionality assessment and resume feature development.  
- Establish a cadence for reviewing and applying updates or overrides as new vulnerabilities emerge.