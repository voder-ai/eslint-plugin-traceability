## NOW
Run `npm audit --omit=dev --audit-level=high --json > docs/security-incidents/prod-deps-high.json` to generate a comprehensive report of all high-severity vulnerabilities in production dependencies.

## NEXT
- Review `docs/security-incidents/prod-deps-high.json` and upgrade or patch each affected dependency in `package.json`/`package-lock.json`; rerun `npm audit --omit=dev --audit-level=high` until zero high-severity issues remain.  
- For any vulnerabilities that cannot be fixed via upgrades, use `docs/security-incidents/SECURITY-INCIDENT-TEMPLATE.md` to create formal incident reports detailing impact and mitigation.  
- Verify that both the CI workflow (`.github/workflows/ci-cd.yml`) and the Husky pre-push hook include a hard-failing `npm audit --production --audit-level=high` step (no `|| true` or continue-on-error).

## LATER
- Once all high-severity production issues are cleared, lower the audit threshold to “moderate” for production dependencies and re-enable moderate-level auditing in CI and Husky.  
- Add a scheduled CI job (weekly or bi-weekly) to run high-severity production audits and notify the team of new findings.  
- Update `SECURITY.md` and `CONTRIBUTING.md` with guidelines for handling production dependency vulnerabilities, incident reporting, and remediation timelines.