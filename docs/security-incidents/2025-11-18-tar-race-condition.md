# Security Incident Report: tar Race Condition

**Date:** 2025-11-18

**Dependency:** tar@7.5.1 bundled in npm@11.6.2 within @semantic-release/npm@10.0.6

**Vulnerability ID:** GHSA-29xp-372q-xqph

**Severity:** moderate

**Description:**
A race condition vulnerability in node-tar that can lead to uninitialized memory exposure. This vulnerability affects tar version 7.5.1 specifically.

**Remediation:**

- **Status:** Mitigated / resolved via dependency overrides and upstream updates
- **Fixed Version:** tar >=6.1.12 enforced via overrides; current npm audit reports no active tar-related vulnerabilities in the dependency tree.

**References:**

- https://github.com/advisories/GHSA-29xp-372q-xqph

**Timeline:**

- **2025-11-18:** Identified vulnerability in dev dependencies via npm audit
- **2025-11-18:** Identified as bundled dependency in @semantic-release/npm that cannot be overridden
- **2025-11-18:** Accepted as residual risk with documented mitigation
- **2025-11-21:** Confirmed mitigated: overrides in package.json and upstream updates mean npm audit no longer reports GHSA-29xp-372q-xqph for this project. Incident reclassified from residual risk to resolved.

**Impact Analysis:**
This vulnerability affects development-time dependencies bundled within the npm package used by semantic-release for automated publishing. The race condition requires specific timing conditions and is isolated to the CI/CD publishing process. Risk to the project and downstream users is minimal as:
- Dev dependency only (not in production)
- Race condition requires specific timing scenarios
- Isolated to CI/CD publishing process
- No end-user exposure
- No production code impact

**Current Status (as of 2025-11-21):**

Subsequent dependency updates and the `tar` override (`tar >=6.1.12`) have removed the vulnerable version from the active dependency graph. Automated `npm audit --omit=dev --audit-level=high` checks report no tar-related vulnerabilities. This incident remains documented for historical purposes but does not represent an ongoing risk.

**Testing:**
Continuous `npm audit` checks in CI and pre-push hooks will detect if this vulnerability is resolved or if new vulnerabilities are introduced.