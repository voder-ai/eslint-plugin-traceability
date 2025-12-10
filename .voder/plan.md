## NOW

- [ ] Update the Prettier development dependency declaration in the main package configuration so it specifies the latest safe version identified by the dependency maturity check, without altering any other dependencies or configuration fields.

## NEXT

- [ ] Regenerate the project’s dependency lockfile so it reflects the updated Prettier version while keeping the rest of the dependency tree consistent.
- [ ] Apply any formatting changes that the new Prettier version would introduce across the codebase so that all source and test files conform to the updated formatting rules.
- [ ] Ensure the project still builds and all automated quality checks and tests pass successfully with the updated Prettier version and regenerated lockfile.

## LATER

- [ ] When dependency maturity checks indicate that currently filtered packages like the TypeScript-ESLint tooling and dry-aged-deps itself have reached the safe age threshold, update those dependencies in the same controlled, one-at-a-time manner.
- [ ] Document in an internal development note or ADR that Prettier has been updated as a dev-only tooling change, including the rationale based on the maturity report, to help future maintainers understand the dependency history.
- [ ] Periodically repeat the dependency maturity and audit process to keep dev tooling up to date while respecting the age-based safety filter, upgrading one mature dependency at a time as new safe versions become available.
