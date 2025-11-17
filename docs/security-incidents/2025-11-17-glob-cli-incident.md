# Security Incident Report: glob CLI Vulnerability

**Date:** 2025-11-18 (Updated)

**Dependency:** glob (versions 10.3.7 – 11.0.3) bundled in npm@11.6.2 within @semantic-release/npm@10.0.6

**Vulnerability ID:** GHSA-5j98-mcp5-4vw2

**Severity:** high

**Description:**
A command injection vulnerability in the glob CLI when using the `-c/--cmd` option, which executes matches with `shell:true`. An attacker able to control glob patterns could execute arbitrary shell commands.

**Remediation:**

- **Status:** Accepted as residual risk (bundled dependency - cannot be overridden)
- **Fixed Version:** Awaiting upstream patch in npm package bundled within @semantic-release/npm

**References:**

- https://github.com/advisories/GHSA-5j98-mcp5-4vw2

**Timeline:**

- **2025-11-17:** Identified vulnerability in dev dependencies via npm audit
- **2025-11-17:** Initial decision to monitor and await upstream patch
- **2025-11-18:** Identified as bundled dependency in @semantic-release/npm that cannot be overridden
- **2025-11-18:** Accepted as residual risk with documented mitigation

**Impact Analysis:**
This vulnerability affects development-time CLI tools bundled within the npm package used by semantic-release for automated publishing. The vulnerability requires specific CLI usage patterns (`-c/--cmd` flag) that are not used in our CI/CD workflow. The plugin itself does not pass untrusted patterns to glob. Risk to the project and downstream users is minimal as:
- Dev dependency only (not in production)
- Requires specific CLI flags not used in our workflow
- Isolated to CI/CD publishing process
- No end-user exposure

**Testing:**
Continuous `npm audit` checks in CI and pre-push hooks will detect if this vulnerability is resolved or if new vulnerabilities are introduced.
