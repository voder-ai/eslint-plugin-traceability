## NOW

- [ ] Use read_file on `docs/security-incidents/dependency-override-rationale.md` to review the current override list and locate any placeholder advisory IDs (e.g., `CVE-2021-xxxx`, `GHSA-xxxx`) that need to be replaced with concrete identifiers.

## NEXT

- [ ] Use read_file on `docs/security-incidents/2025-11-18-tar-race-condition.md` to verify how the tar race-condition incident is currently described, including its status and any references to ongoing residual risk.
- [ ] Based on the findings, use modify_file on `docs/security-incidents/dependency-override-rationale.md` to replace placeholder advisory IDs with specific CVE/GHSA identifiers and, where possible, brief links or references to their official advisories for each override entry.
- [ ] Use read_file on `ci/npm-audit.json` (or the latest available audit JSON under `ci/`) to cross-check that all currently reported vulnerabilities correspond to documented incidents (glob CLI, brace-expansion, bundled npm, etc.).
- [ ] If any documented incident, particularly the tar race-condition one, no longer appears in the current audit JSON, use modify_file on `docs/security-incidents/2025-11-18-tar-race-condition.md` to update its narrative and status from active residual risk to mitigated/resolved, clearly noting the override and audit evidence.
- [ ] Use read_file on `docs/security-incidents/bundled-dev-deps-accepted-risk.md` to confirm it still accurately describes the dev-only bundled `@semantic-release/npm` vulnerabilities and their short-term residual-risk acceptance; if needed, update it via modify_file to reference the current audit snapshot and reaffirm scope (dev-only, no untrusted input).

## LATER

- [ ] Once the security incident documentation and override rationale are updated, re-run the SECURITY portion of the implementation assessment (handled by existing automation) to confirm the score meets or exceeds the 90% threshold and that FUNCTIONALITY assessment is no longer blocked.
- [ ] After FUNCTIONALITY is unblocked, review any uncovered failing or partially implemented stories and plan focused code/test/doc changes following the usual small-step, test-first workflow.
- [ ] Consider adding a concise ADR in `docs/decisions/` that records the policy around dev-only vulnerability acceptance (e.g., for bundled `@semantic-release/npm`), how overrides are justified and documented, and how audit artifacts (`ci/npm-audit.json`, `ci/dry-aged-deps.json`) are used to support those decisions.
