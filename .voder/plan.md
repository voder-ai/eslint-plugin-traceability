## NOW

- [x] Adjust the plugin’s built-in configuration so that the `prefer-implements-annotation` rule is disabled by default (not included or set to off in the recommended/strict presets), while keeping it fully configurable for users who explicitly enable it, thereby bringing the default behavior into line with the 010.3 migration story requirements.

## NEXT

- [x] Update the existing tests that assert the default severities in the recommended and strict configs so they expect `prefer-implements-annotation` to be disabled by default, and add or refine tests that demonstrate how users can opt in to this rule at warn or error severity via their own config.
- [x] Review and update user-facing documentation (README and user-docs, especially the API reference and migration guide) so that they clearly state the rule is opt-in and show examples of explicitly enabling `prefer-implements-annotation`, rather than implying it is active in the presets by default.
- [x] Update maintainer-facing documentation and the 010.3 story/coverage notes to record that the default severity behavior now matches the acceptance criteria, and verify that the story can be marked fully implemented based on current code and tests.
- [x] Refine the dry-aged-deps CI helper script so that when dry-aged-deps fails or produces no output it records an explicit error status or warning in its JSON/report output instead of silently pretending there are zero packages, making it clear to maintainers when the safety check did not actually run.
- [x] Update the historical semantic-release bundled-npm security incident documentation to mark the vulnerability as resolved in light of the current clean audits and newer toolchain, so the security documentation accurately reflects present risk rather than an outdated known error.

## LATER

- [ ] Consider adding a small dedicated example or guide snippet that walks users through adopting `prefer-implements-annotation` in a real project, including how to gradually roll it out from off to warn to error as their codebase migrates.
- [ ] Evaluate whether any additional edge cases or complex comment patterns for `@implements` migration should be covered by new tests or documented limitations, ensuring the migration rule’s behavior is fully transparent to users.
- [ ] Periodically review dependency safety tooling and security docs to ensure that future changes to dry-aged-deps, npm audit behavior, or semantic-release do not drift from the documented processes and guarantees.