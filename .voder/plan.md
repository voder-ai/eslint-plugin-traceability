## NOW
Run `npm audit fix` to automatically resolve all fixable vulnerabilities in the project’s dependencies.

## NEXT
- Review the updated `npm audit` report and manually upgrade or replace any remaining vulnerable packages in `package.json`.  
- Create a new directory `docs/security-incidents/` and add a markdown file (e.g. `unresolved-vulnerabilities.md`) that lists any unresolved issues, their severity, affected packages, and a mitigation plan.

## LATER
- Add an `npm audit --audit-level=moderate` step to the CI workflow in `.github/workflows/ci.yml` so that any moderate-or-higher vulnerabilities cause the build to fail.  
- Configure Dependabot (via a `.github/dependabot.yml` file) to automatically propose dependency updates.  
- Define and document a formal security incident response process in `docs/security-incidents/`, including a reusable incident-report template for future vulnerabilities.