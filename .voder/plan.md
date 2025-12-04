## NOW

- [ ] Create or refine a root-level security policy document that clearly describes the dev-only semantic-release/npm toolchain risk, the existing compensating controls and CI isolation around it, and the intended upgrade path once a safe version becomes available, so that this aspect of the project’s security posture is explicit and centralized.

## NEXT

- [ ] Review the continuous integration workflow configuration to verify exactly how and where the semantic-release job runs, and adjust its structure or permissions if needed to further isolate it from untrusted inputs while preserving automated releases.
- [ ] Align the existing security incident and dependency health documents with the new centralized security policy so they consistently describe the same controls, assumptions, and future remediation plan for the semantic-release/npm toolchain.
- [ ] Introduce a lightweight guard or precondition around the semantic-release invocation that enforces the intended safe usage context and prevents accidental invocation in unsupported or less-isolated environments.

## LATER

- [ ] When a dry-aged-deps–approved safe upgrade path for the semantic-release/npm toolchain becomes available, update the relevant dependencies and then convert the current known-error documentation into a resolved-incident record describing the remediation.
- [ ] Extend the security review to other dev-only tooling to detect any similar bundled or embedded high-risk dependencies, and add documentation plus compensating controls where necessary.
- [ ] After the SECURITY area comfortably exceeds its threshold, revisit the functionality assessment to identify and close any remaining story-level feature gaps using the strengthened security foundation.
