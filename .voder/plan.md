## NOW  
Lower the ESLint `max-lines-per-function` rule from 65 to 60 in `eslint.config.js`.

## NEXT  
- Run `npm run lint` to identify functions now violating the 60-line limit, refactor each to comply, and commit the fixes.  
- Execute `npm audit --omit=dev --audit-level=high`, upgrade all remaining high-severity production dependencies until the audit reports zero issues, and commit the updated lockfile.  
- Upgrade every devDependency listed in `docs/security-incidents/dev-deps-high.json` to its patched version and update that incident report.  
- Update `.github/workflows/ci-cd.yml` to enforce `npm audit --audit-level=high` on both production and dev dependencies and fail the build on any moderate-or-higher findings.

## LATER  
- Define and implement an incremental ratcheting plan for ESLint (60 → 55 → 50 lines) and integrate those thresholds into CI quality gates.  
- Add a scheduled GitHub Actions job for weekly high- and moderate-severity dependency audits with automated notifications.  
- Expand `SECURITY.md` and `CONTRIBUTING.md` with formal remediation timelines, incident-reporting procedures, and dependency-upgrade guidelines.  
- Automate creation of new security-incident entries using `SECURITY-INCIDENT-TEMPLATE.md` for any future unresolved vulnerabilities.