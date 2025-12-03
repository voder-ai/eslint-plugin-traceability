## NOW

- [x] Define and integrate a clear, project-standard way to invoke the dependency maturity tool from the project configuration so that contributors and automation can run it consistently and its behavior is documented.

## NEXT

- [x] Review the dependency maturity tool’s output format and current results to understand which direct and transitive dependencies, if any, have safe mature upgrade candidates according to the project’s policy.
- [x] Apply any safe, policy-compliant dependency updates identified by the maturity tool, focusing first on resolving or reducing known dev-only vulnerabilities without impacting runtime behavior.
- [ ] Revisit the existing security incident and known-error documentation to align it with the current dependency state, updating the rationale if vulnerabilities have been remediated or if the maturity tool still reports no safe upgrade path.
- [ ] Summarize the updated dependency health status in the development documentation, including how and when the maturity tool should be used by contributors to keep dependencies within the required health threshold.

## LATER

- [ ] Once dependency health meets the required threshold, perform the deferred functionality assessment to validate feature completeness against the documented stories and requirements.
- [ ] Refine the long-term dependency maintenance strategy in an ADR, clarifying how the maturity tool, audits, and overrides should be used together for future upgrades.
- [ ] Extend contributor guidance with a short checklist for dependency changes, covering when to run the maturity tool, how to interpret its output, and how to update dependency-related documentation and incident records.