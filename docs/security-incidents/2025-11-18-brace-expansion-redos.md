# Security Incident Report: brace-expansion ReDoS

**Date:** 2025-11-18

**Dependency:** brace-expansion (1.0.0 - 1.1.11 and 2.0.0 - 2.0.1) bundled in npm within @semantic-release/npm@10.0.6

**Vulnerability ID:** GHSA-v6h2-p8h4-qcjw

**Severity:** low

**Description:**
A Regular Expression Denial of Service (ReDoS) vulnerability in brace-expansion affecting versions 1.0.0-1.1.11 and 2.0.0-2.0.1. An attacker who can control the input to brace-expansion could cause high CPU usage through crafted regex patterns.

**Remediation:**

- **Status:** Accepted as residual risk (bundled dependency - cannot be overridden)
- **Fixed Version:** Awaiting upstream patch in npm package bundled within @semantic-release/npm

**References:**

- https://github.com/advisories/GHSA-v6h2-p8h4-qcjw

**Timeline:**

- **2025-11-18:** Identified vulnerability in dev dependencies via npm audit
- **2025-11-18:** Identified as bundled dependency in @semantic-release/npm that cannot be overridden
- **2025-11-18:** Accepted as residual risk with documented mitigation

**Impact Analysis:**
This vulnerability affects development-time dependencies bundled within the npm package used by semantic-release for automated publishing. The ReDoS vulnerability requires control over input patterns to brace-expansion, which is not exposed in our CI/CD workflow. Risk to the project and downstream users is minimal as:
- Dev dependency only (not in production)
- Low severity (DoS only, no data exposure)
- Requires attacker-controlled input patterns
- Isolated to CI/CD publishing process
- No end-user exposure
- No production code impact

**Testing:**
Continuous `npm audit` checks in CI and pre-push hooks will detect if this vulnerability is resolved or if new vulnerabilities are introduced.
