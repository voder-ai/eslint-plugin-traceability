## NOW

- [ ] Update all user-facing documentation to remove or generalize stale hard-coded version and date labels so they no longer conflict with the semantic-release strategy, and instead clearly direct users to GitHub Releases as the authoritative source for current versions and change history.

## NEXT

- [ ] Review the README and user documentation to ensure every mention of versioning and releases consistently explains that semantic-release controls versions and that GitHub Releases, not package.json, is the authoritative changelog for end users.
- [ ] Revisit all user-facing security and dependency sections to confirm they describe only production dependency guarantees and clearly state that any documented semantic-release/npm risks are restricted to dev-only CI tooling and cannot impact consumers of the published plugin.
- [ ] Refine internal dependency-health and security incident records so they explicitly reference the latest dry-aged-deps output and clearly explain why specific dev-only vulnerabilities remain accepted residual risks given the current absence of safe mature updates.
- [ ] Ensure contributor and maintainer documentation clearly instructs how and when to run the dependency maturity and audit scripts, and how to interpret their outputs when considering dependency updates or security incident documentation.

## LATER

- [ ] When dry-aged-deps identifies new safe mature versions for the semantic-release/npm toolchain or other devDependencies, update those dependencies, refresh overrides, and revise documentation and incident records to reflect the improved risk profile.
- [ ] After documentation and dependency management meet their target thresholds, perform a focused functionality assessment that maps implemented behavior and tests to the documented stories and requirements, and summarize any remaining functional gaps.
- [ ] Periodically refine the documentation structure so that new security incidents, ADRs, and dependency-health reviews can be linked from user-facing guarantees without overwhelming typical users with implementation details.
