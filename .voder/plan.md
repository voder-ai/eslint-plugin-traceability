## NOW

- [ ] Review the existing documentation and configuration that describe this project’s version control and release workflow to ensure they clearly reflect the current trunk-based development, Conventional Commits usage, semantic-release setup, and single CI/CD pipeline behavior.

## NEXT

- [ ] Identify any gaps or ambiguities in how the version control strategy is documented (such as missing details about branch policy, commit message expectations, or how releases are produced) and decide what additional documentation or clarifications are needed.
- [ ] Create or update an internal architecture decision record that explicitly captures the chosen version control and release strategy, including trunk-based development, Conventional Commits, semantic-release, and the automatic publish-on-main workflow.
- [ ] Update contributor-facing documentation so that the practical version control workflow (how to structure commits, how changes flow to main and get released) is clearly summarized and aligned with the new or updated decision record.
- [ ] Perform a focused review of the CI/CD workflow configuration to confirm it fully matches the documented version control and release process, and adjust the documentation if any intentional deviations exist.

## LATER

- [ ] Introduce a concise internal guide or checklist specifically aimed at automated assessments and new maintainers that outlines the project’s version control practices and where to find the authoritative decisions and configuration files.
- [ ] Periodically revisit the version control ADR and contributor docs when significant workflow or tooling changes occur (such as major semantic-release upgrades or CI restructuring) to keep them in sync with actual practice.
- [ ] Consider adding lightweight repository hygiene guidelines (for example, expectations for keeping main green, handling revert commits, and dealing with long-lived work) to further support both human reviewers and automated version-control assessments.
