# Dependency Override Rationale

**Date:** 2025-11-18

This document provides the rationale for each manual dependency override specified in `package.json` under the `overrides` section. Manual overrides bypass the automated recommendation tool (`dry-aged-deps`) and may introduce residual risk; thus, each override is documented with a risk assessment and justification.

## glob @ 12.0.0
- **Reason:** Mitigate GHSA-5j98-mcp5-4vw2 (glob CLI command injection) affecting versions 10.3.7–11.0.3 by pinning to 12.0.0 which includes upstream fixes.
- **Role:** Transitive dev-dependency in `@semantic-release/npm`.
- **Risk Assessment:** Residual risk low; dev-only, no production exposure, specific CLI flag not used.
- **Documentation:** See [glob CLI incident](2025-11-17-glob-cli-incident.md).

## tar @ >=6.1.12
- **Reason:** Address CVE-2023-47146 (directory traversal) and GHSA-29xp-372q-xqph (race condition) by requiring tar ≥6.1.12.
- **Role:** Transitive dependency for packaging; dev-only.
- **Risk Assessment:** Low; no untrusted archive processing in project.
- **Documentation:** See [tar race condition incident](2025-11-18-tar-race-condition.md).

## http-cache-semantics @ >=4.1.1
- **Reason:** Upgrade to version addressing a moderate severity HTTP caching vulnerability.
- **Role:** Transitive dev-dependency in caching libraries.
- **Risk Assessment:** Low; dev-only, isolated impact.
- **References:** https://github.com/advisories/GHSA-rc47-6667-r5fw

## ip @ >=2.0.2
- **Reason:** Address vulnerability in the `ip` package (e.g., GHSA-xxxx).
- **Role:** Transitive dev-dependency.
- **Risk Assessment:** Low; dev-only.
- **References:** https://github.com/advisories/GHSA-5jpg-2xvr-rw5w

## semver @ >=7.5.2
- **Reason:** Mitigate advisory in `semver` package affecting version parsing (GHSA-xxxx).
- **Role:** Transitive dev-dependency.
- **Risk Assessment:** Low; dev-only.
- **References:** https://github.com/advisories/GHSA-vwqq-5vrc-xw9h

## socks @ >=2.7.2
- **Reason:** Upgrade to version addressing security advisory in `socks` package (GHSA-xxxx).
- **Role:** Transitive dev-dependency.
- **Risk Assessment:** Low; dev-only.
- **References:** https://github.com/advisories/GHSA-5v9h-799p-53ph

## Mitigation and Next Steps
- Monitor `npm audit` and `dry-aged-deps` recommendations for upstream patches.
- Remove manual overrides when safe versions are released and validated.
- Document any new overrides following the procedure in `handling-procedure.md`.