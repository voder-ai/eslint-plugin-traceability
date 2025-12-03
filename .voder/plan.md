## NOW

- [ ] Correct the development-only dependency audit script so that it uses valid configuration for the audit tool and reliably produces a valid JSON snapshot focused on high-severity issues in dev dependencies.

## NEXT

- [ ] Enhance the development-only audit and security documentation so it clearly explains how the dev audit script works, what its output means, and how it complements the production-only audit and dependency maturity checks.
- [ ] Update the main user-facing documentation to clarify the recommended ESLint configuration examples, explicitly call out the intended severity of the annotation-format rule, and briefly introduce the @implements annotation style with links to the detailed guides.
- [ ] Review the documented and implemented secret-scanning workflow to ensure it is clearly described how and when secret checks run locally and in CI, and adjust the description so that it reflects the intended parity between local pre-push checks and the CI pipeline without altering existing behavior.
- [ ] Perform a focused pass over the codebase to look for any remaining minor security or code-quality nits (such as overly broad comments, small inline suppressions, or slightly oversized helper modules) and document specific, low-risk refactors that can be done incrementally later.

## LATER

- [ ] Implement the small, documented refactors to reduce the size or responsibility of any remaining large helper or CLI modules while keeping behavior and public APIs unchanged.
- [ ] Add narrowly scoped tests or checks that exercise any remaining defensive branches or error paths identified during the security and code-quality review to further strengthen confidence without changing behavior.
- [ ] Periodically re-evaluate the dev-only dependency risk and dry-aged-deps output to see whether new, policy-compliant versions of the tooling stack (especially release tooling) become available and, when they do, plan safe upgrades guided by the maturity rules.
- [ ] Capture the finalized handling of dev-only audits, secret scanning, and minor security nits in an updated or new decision record so that future contributors have a clear reference for the project’s security and audit posture.
