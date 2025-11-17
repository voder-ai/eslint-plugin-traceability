# Security Incident Report: glob CLI Vulnerability

**Date:** 2025-11-17

**Dependency:** glob (versions 10.3.7 – 11.0.3)

**Vulnerability ID:** GHSA-5j98-mcp5-4vw2

**Severity:** high

**Description:**
A command injection vulnerability in the glob CLI when using the `-c/--cmd` option, which executes matches with `shell:true`. An attacker able to control glob patterns could execute arbitrary shell commands.

**Remediation:**
- **Status:** Monitor (upstream patch expected)
- **Fixed Version:** glob@12.0.0 (pending release of patched version)

**References:**
- https://github.com/advisories/GHSA-5j98-mcp5-4vw2

**Timeline:**
- **2025-11-17:** Identified vulnerability in dev dependencies via npm audit
- **2025-11-17:** Decision to monitor and await upstream patch

**Impact Analysis:**
This vulnerability affects development-time CLI tools and is not invoked in production or by end users. The plugin itself does not pass untrusted patterns to glob. Risk to the project and downstream users is minimal.

**Testing:**
Continuous `npm audit` checks in CI and pre-push hooks will detect and block if reintroduced or present in new tools.