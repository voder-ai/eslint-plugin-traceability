## NOW

- [ ] Audit the repository for any remaining generated CI or report files that are still tracked in version control and decide, for each one, whether it should be removed or relocated so that only source and configuration files remain under version control.

## NEXT

- [ ] Strengthen the existing guardrails against committing generated CI artifacts by reviewing the artifact-detection helper and wiring it into the project’s standard quality checks, so future accidental commits of reports are automatically blocked.
- [ ] Review all recently added debug and error logging paths in the core helpers and maintenance tooling to ensure they are fully controlled by opt-in environment flags, remain silent in normal use, and avoid leaking unnecessary internal details.
- [ ] Update internal development documentation to clearly state the policy that generated reports and CI artifacts must not be committed and to describe how to use the debug flags safely when troubleshooting.

## LATER

- [ ] Perform a focused review of user-facing error messages and logs to confirm they provide helpful context without exposing sensitive or noisy implementation details, tightening wording where appropriate.
- [ ] Revisit the security and repository-hygiene sections of the CI/CD and security docs to ensure they reflect the final behavior of artifact guards and debug logging, including any future refinements.
- [ ] Consider extending automated checks to cover any new directories or tooling that might produce generated artifacts, keeping the repository consistently free of build and report outputs.
