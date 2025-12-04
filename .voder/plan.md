## NOW

- [ ] Review and revise the development workflow documentation so that it clearly defines trunk-based development on the main branch as the standard practice, replacing or updating any guidance that currently promotes a feature-branch or PR-centric workflow as the default.

## NEXT

- [ ] Update the version control and CI/CD documentation to ensure that all described workflows, branch usage, and quality gates are consistent with a trunk-based model and the current automated pipeline behavior.
- [ ] Align local pre-push checks with CI by ensuring that secret scanning is included in the same composite verification script used by both environments, so that security-related checks are part of the standard pre-push gate.
- [ ] Review the security policy and supporting internal security/dependency health documentation to confirm they accurately describe the current tooling (secret scanning, audits, maturity checks) and how they integrate into the automated workflow.
- [ ] Summarize the project’s security tooling and guarantees in a concise, central section that can be easily consumed by automated assessments and human reviewers, reducing the chance of security evaluations failing due to fragmented context.

## LATER

- [ ] Revisit the functionality coverage documentation once security and version-control practices are fully aligned with the specified standards, and update coverage status to reflect any new tests or checks added as part of the improvements.
- [ ] Periodically refine version-control and security-related ADRs to keep them in sync with evolving tooling or policy changes, ensuring the documented decisions remain accurate and discoverable.
- [ ] Evaluate whether additional lightweight, automated security checks (such as periodic dependency health snapshots or extended secret scans) would provide meaningful benefit without overburdening the trunk-based workflow.
- [ ] Consider adding brief contributor-facing guidance that explains how external pull requests fit into the trunk-based model while preserving the core expectation that main remains the single integration branch.
