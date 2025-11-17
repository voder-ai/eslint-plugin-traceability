## NOW
Run `npm audit --omit=prod --audit-level=high --json > docs/security-incidents/dev-deps-high.json` to generate a complete report of all high-severity vulnerabilities in development dependencies.

## NEXT
- Review `docs/security-incidents/dev-deps-high.json` and upgrade or patch each affected devDependency in `package.json`/`package-lock.json`; rerun `npm audit --omit=prod --audit-level=high` until zero high-severity issues remain.  
- For any vulnerabilities that cannot be fixed via upgrades, create formal incident reports in `docs/security-incidents/` using the project’s incident-report template, detailing impact and mitigation plans.  
- Update the Husky pre-push hook (`.husky/pre-push`) to re-enable a blocking `npm audit --omit=prod --audit-level=high` step so that devDependency vulnerabilities fail local pushes.  
- Restore the security audit in the CI workflow (`.github/workflows/ci-cd.yml`) by replacing `npm audit --production --audit-level=high || true` (or `continue-on-error`) with a hard-failing `npm audit --production --audit-level=high` step.

## LATER
- Once all high-severity devDependency issues are cleared, consider lowering the audit threshold to “moderate” for development dependencies and re-enable moderate-level auditing in both Husky and CI.  
- Automate weekly or bi-weekly `npm audit --omit=prod --audit-level=high` on devDependencies in a scheduled CI job and alert the team on new findings.  
- Update `SECURITY.md` and `CONTRIBUTING.md` with guidelines for handling devDependency vulnerabilities, incident reporting, and remediation timelines.