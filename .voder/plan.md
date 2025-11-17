# Implementation Plan## NOW  

Modify the `overrides` section of package.json to pin all high-severity vulnerable packages to their patched versions (e.g. tar@>=6.1.12, npm@>=10.6.0, semantic-release@>=21.1.2, @semantic-release/github@>=12.0.2, @semantic-release/npm@>=13.1.2).

## NOW

## NEXT  

Fix high-severity security vulnerabilities in development dependencies by upgrading to patched versions.- Run `npm install` and then `npm audit --include=dev --audit-level=high` to verify zero high-severity findings.  

- For any remaining unpatched advisories, create a security incident report in docs/security-incidents/ using SECURITY-INCIDENT-TEMPLATE.md and update SECURITY.md with your triage decisions.  

**Action**: Update `package.json` to override vulnerable packages:- Integrate `npm audit --dev --audit-level=high` into your Husky pre-push hook and CI pipeline to block new high-severity dev-dependency issues.

- Add/update `overrides` section to pin `tar@>=6.2.1`, `npm@>=10.9.0`, `semantic-release@>=24.2.0`, `@semantic-release/github@>=11.0.1`, `@semantic-release/npm@>=12.0.1`

- Run `npm install` to apply overrides## LATER  

- Verify with `npm audit --include=dev --audit-level=high` to confirm zero high-severity findings- Add a scheduled GitHub Actions job to perform weekly dev-dependency audits and notify on new moderate or high issues.  

- Document any remaining unfixable vulnerabilities as security incidents in `docs/security-incidents/` using the template- Update CONTRIBUTING.md and SECURITY.md to formalize SLAs and patch-triage procedures for dev-dependencies.  

- Update `docs/security-incidents/unresolved-vulnerabilities.md` to match actual audit state- If upstream patches remain unavailable, evaluate alternative release workflows (e.g. replacing @semantic-release/npm) to eliminate the vulnerable bundles.

This unblocks the SECURITY assessment (currently 0%) which is preventing functionality assessment.

## NEXT

Fix the Jest coverage reporter to restore coverage metrics validation.

**Actions**:
- Investigate and resolve the TypeError in coverage reporter: `Cannot read properties of undefined (reading 'sync')`
- Verify coverage output generates successfully with `npm test -- --coverage`
- Confirm actual coverage meets configured thresholds (branches ≥47%, lines ≥59%)
- Add missing tests if coverage gaps are identified

This brings TESTING assessment from 85% to the required 90% threshold, unblocking functionality assessment.

## LATER

Once both SECURITY and TESTING meet thresholds and functionality assessment completes:

- **CI Stability**: Fix Node 20.x lockfile mismatch causing intermittent CI failures
- **CI Optimization**: Cache build artifacts between quality-checks and deploy jobs to avoid redundant builds
- **Coverage Ratcheting**: Gradually increase coverage thresholds as new tests are added
- **Complexity Ratcheting**: Lower max-complexity from 18 to 15 if metrics allow
- **Dev Dependency Monitoring**: Add scheduled GitHub Actions job for weekly dependency audits
- **Security Process**: Update CONTRIBUTING.md and SECURITY.md to formalize SLA and patch-triage procedures
