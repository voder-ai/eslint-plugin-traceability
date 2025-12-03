## NOW

- [ ] Review the current dev-only security vulnerabilities associated with the release tooling (especially the semantic-release npm plugin and its bundled npm/glob/brace-expansion) and determine whether there is now a safe, policy-compliant upgrade path that would eliminate these issues without violating the dependency maturity rules.

## NEXT

- [ ] If a safe, policy-compliant upgrade path exists, update the release-related dependencies to those versions while preserving existing release behavior, and verify that the security vulnerabilities are resolved and that releases still function as expected.
- [ ] If no safe upgrade path exists yet, create formal security incident records using the required SECURITY-INCIDENT known-error format that document the remaining dev-only vulnerabilities, their risk analysis, and the compensating controls that make continued use acceptable under the security policy.
- [ ] Align the existing informal incident markdown files about glob, brace-expansion, and bundled dev dependencies so they reference or are superseded by the new SECURITY-INCIDENT known-error documents, ensuring there is a single, authoritative source for each accepted-risk decision.
- [ ] Review the CI/CD workflow configuration for the release job to confirm that the environment running the vulnerable release tooling is as isolated and least-privileged as practical, and document these controls in the corresponding security incident records as part of the compensating controls.

## LATER

- [ ] Evaluate alternative release or publishing mechanisms that avoid relying on tooling which embeds its own copy of npm and related vulnerable components, and document a migration path away from the current plugin if a safer option becomes viable.
- [ ] Refine the security incident handling documentation so that future dev-only vulnerabilities in tooling dependencies can be triaged, documented, and either upgraded or converted into known errors in a repeatable way.
- [ ] Add lightweight automation or checks that ensure any unresolved high-severity vulnerabilities older than the allowed window either have a corresponding SECURITY-INCIDENT known-error document or are blocked from merging until addressed.
