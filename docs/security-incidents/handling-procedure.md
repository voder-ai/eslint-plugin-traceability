# Security Incident Handling Procedures

This document outlines the standardized process for identifying, documenting, approving, and reviewing security incidents and manual dependency overrides within the project.

## Scope

This procedure applies to all security-related issues discovered in both production and development dependencies, with special focus on manual overrides configured in `package.json` under the `overrides` section.

## Roles and Responsibilities

- **Developer**: Identifies vulnerabilities, assesses impact, and proposes mitigations or overrides.
- **Security Lead**: Reviews vulnerability assessments and approves residual risk decisions.
- **Team Lead**: Ensures procedure compliance and schedules periodic reviews.

## Procedure

1. **Identification**  
   - Discover vulnerabilities via automated tools (e.g., `npm audit`, `dry-aged-deps`) or external advisories.
   - Log the finding in the issue tracker and reference the advisory (CVE or GHSA ID).

2. **Initial Assessment**  
   - Evaluate severity and exploitability in the project context.
   - Determine if an automated patch or upgrade is available via `dry-aged-deps` or other tooling.
   - If a safe version exists, prefer automated upgrades; do not use manual overrides.

3. **Decision to Override**  
   - If no safe version is available (e.g., bundled dependency cannot be patched), propose a manual override in `package.json`.
   - Document the rationale in `docs/security-incidents/dependency-override-rationale.md`.

4. **Incident Report**  
   - Create a security incident report by copying `docs/security-incidents/SECURITY-INCIDENT-TEMPLATE.md` and naming it `YYYY-MM-DD-<package>-<short-title>.md`.
   - Populate the report with details (Date, Dependency, Vulnerability ID, Severity, Description, Remediation, Timeline, Impact Analysis, Testing).

5. **Approval and Documentation**  
   - Security Lead reviews and approves the incident report and override rationale.
   - Include a link to the incident report in `dependency-override-rationale.md`.

6. **Implementation**  
   - Commit the manual override to `package.json` under `overrides`.
   - Ensure the incident report and rationale documents are committed in the same PR.

7. **Monitoring and Review**  
   - Schedule a follow-up review within 7 days to re-assess availability of safe patches.
   - Update or remove overrides and incident reports when safe upgrades become available.
   - Document decision changes in the existing incident report with new timeline entries.

8. **Escalation**  
   - If a critical vulnerability remains unpatched beyond the tolerance period, escalate to the Security Lead and Team Lead for urgent action.

## References

- [Security Incident Template](SECURITY-INCIDENT-TEMPLATE.md)  
- [Dependency Override Rationale](dependency-override-rationale.md)