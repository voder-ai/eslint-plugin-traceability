# Security Incident: Bundled Dev Dependencies Accepted as Residual Risk

**Date**: 2025-11-18  
**Severity**: High (glob), Low (brace-expansion)  
**Status**: Accepted as residual risk  
**Affected Package**: @semantic-release/npm@10.0.6 (bundled dependencies)

## Summary

The @semantic-release/npm package (v10.0.6) includes the npm package which bundles vulnerable versions of glob and brace-expansion that cannot be automatically fixed or overridden.

## Vulnerabilities

### 1. glob CLI Vulnerability (GHSA-5j98-mcp5-4vw2)
- **Severity**: High
- **Affected versions**: glob 10.3.7 - 11.0.3
- **Status**: Accepted as residual risk
- **Rationale**: 
  - Dev-dependency only (used by semantic-release for publishing)
  - Vulnerability requires specific CLI usage (`-c/--cmd` flag) not used in our workflow
  - Bundled dependency cannot be overridden
  - No production impact
  - Awaiting upstream patch in npm package

### 2. brace-expansion ReDoS (GHSA-v6h2-p8h4-qcjw)
- **Severity**: Low
- **Affected versions**: 1.0.0 - 1.1.11 and 2.0.0 - 2.0.1
- **Status**: Accepted as residual risk
- **Rationale**:
  - Dev-dependency only (bundled in npm package within @semantic-release/npm)
  - Low severity ReDoS requires attacker-controlled input patterns
  - No production impact
  - Bundled dependency cannot be overridden
  - Awaiting upstream patch in npm package

## Risk Acceptance Decision

**Decision**: Accept these vulnerabilities as residual risk  
**Decision Date**: 2025-11-18  
**Reviewed By**: Automated security assessment

**Justification**:
1. **Scope Limitation**: Dev-dependency only (used by semantic-release for publishing in CI/CD)
2. **No Production Impact**: Vulnerabilities isolated to development/publishing process, no end-user or production code exposure
3. **Usage Pattern**: The glob CLI vulnerability requires specific `-c/--cmd` flag usage not present in our workflow
4. **Technical Constraint**: Bundled dependencies within npm package cannot be overridden via package.json
5. **Severity vs Impact**: Low/High severity ratings don't reflect actual risk given our usage context
6. **Monitoring**: Continuing to monitor for upstream patches in npm and semantic-release packages

## Mitigation Measures

- Continue monitoring npm audit reports for upstream fixes
- Review and upgrade semantic-release packages when new versions are released
- Isolate CI/CD publishing process from untrusted input
- Regular (weekly) review of dev-dependency audit status

## Review Schedule

- **Next Review**: 2025-11-25 (7 days)
- **Escalation Trigger**: New vulnerability in bundled dependencies OR upstream patch available

## Related Incidents

- [2025-11-17 glob CLI incident](2025-11-17-glob-cli-incident.md) - Original glob vulnerability documentation

## Previously Resolved

- **js-yaml (GHSA-mh29-5h37-fv8m)**: Prototype pollution vulnerability resolved by upgrading to `js-yaml` >= 4.1.1 via `npm audit fix` and package.json override.
- **tar (node-tar) (CVE-2023-47146)**: Arbitrary file write via directory traversal vulnerability resolved by enforcing `tar` >= 6.1.11 via package.json override.
- **tar race condition (GHSA-29xp-372q-xqph)**: Resolved by downgrading semantic-release packages to v10.x/v21.x which don't bundle vulnerable npm versions.
