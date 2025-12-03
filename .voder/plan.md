## NOW

- [ ] Enhance the main user-facing documentation to clearly explain the project’s security and dependency posture, including how mature dependency updates are managed and how the documented dev-only tooling risks are controlled and do not impact end users.

## NEXT

- [ ] Review and refine the internal development documentation about dependency health and security incidents so that it accurately reflects the current dry-aged-deps configuration, audit scripts, and the accepted dev-only semantic-release/npm risk.
- [ ] Improve inline API documentation for the public maintenance functions by adding or tightening parameter and return descriptions so that code-level docs match the existing user-facing API reference.
- [ ] Adjust user documentation to separate core usage guidance from advanced traceability concepts, ensuring that essential instructions do not rely on development stories while still linking to them as optional background material.
- [ ] Clarify in contributor-focused documentation how local checks relate to the CI pipeline’s security and dependency gates, so that contributors understand how their changes are validated before release.

## LATER

- [ ] Revisit dependency versions when new safe, mature releases become available and update overrides and documentation to reflect any changes to the risk profile.
- [ ] Extend security incident records if new advisories affect the tooling stack, maintaining a clear history of decisions and compensating controls.
- [ ] Once documentation, dependencies, and security are confirmed above the target thresholds, perform and document a dedicated functionality assessment that maps implemented behavior to the user stories and requirements.
