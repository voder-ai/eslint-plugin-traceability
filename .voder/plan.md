## NOW
Update the CI audit step in `.github/workflows/ci-cd.yml` to run `npm audit --audit-level=moderate` (remove the `--production` flag) so that both production and development dependencies are scanned.

## NEXT
- Modify the Husky pre-push hook (`.husky/pre-push`) to run `npm audit --audit-level=moderate` instead of only auditing production deps.
- Update the scheduled `dependency-health` job in `.github/workflows/ci-cd.yml` to run `npm audit --audit-level=moderate`, ensuring dev dependencies are included.
- Run `npm audit --audit-level=moderate` locally, identify all moderate-severity vulnerabilities, and apply upgrades, patches, or overrides as appropriate.
- Document any remaining unpatchable vulnerabilities in `docs/security-incidents/unresolved-vulnerabilities.md`, noting dates and remediation status.

## LATER
- Establish an ongoing vulnerability‐review cadence: add a documented process for triaging new audit findings and assigning ownership.
- After the audit hooks and scheduled job pass reliably, resume the full functionality assessment and feature roadmap.
- Consider integrating a periodic notification (e.g., Slack or email) for new audit failures to ensure timely attention.
- Evaluate adding a third-party monitoring tool (e.g., Snyk) if moderate issues persist beyond acceptable windows.