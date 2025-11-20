## NOW

- [ ] Create docs/decisions/adr-pre-push-parity.md documenting that .husky/pre-push runs npm run ci-verify:fast instead of the full CI suite, including rationale, constraints, exact commands (ci-verify vs ci-verify:fast), and a brief rollback/migration plan.

## NEXT

- [ ] Update the comment in .husky/pre-push to reference docs/decisions/adr-pre-push-parity.md so the hook’s behavior is explicitly tied to the documented decision.
- [ ] Add a short section to CONTRIBUTING.md (or an appropriate internal dev doc) explaining the pre-commit and pre-push behavior, linking to adr-pre-push-parity.md for full rationale and listing which scripts run locally vs in CI.
- [ ] Review package.json script descriptions (if any) for ci-verify and ci-verify:fast to ensure they clearly state their intended use (full CI gate vs fast pre-push gate) in line with the ADR.

## LATER

- [ ] Periodically re-evaluate whether ci-verify:fast should be expanded (e.g., add lint or a subset of tests) based on developer feedback and CI failure patterns, updating adr-pre-push-parity.md if the policy changes.
- [ ] Consider adding a brief docs/decisions/index.md or similar ADR catalog that lists adr-pre-push-parity.md alongside other ADRs for easier discovery by maintainers.
- [ ] If CI failures continue to arise from checks not covered by ci-verify:fast, revisit the pre-push policy to either broaden the local checks or introduce additional optional scripts developers can run before committing high-risk changes.
