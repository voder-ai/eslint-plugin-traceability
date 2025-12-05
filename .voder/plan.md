## NOW

- [ ] Review and improve both user-facing and internal documentation for the optional prefer-implements-annotation rule so that its current behavior, deprecation status, migration path, and key edge cases are clearly described and aligned with the implemented code.

## NEXT

- [ ] Inspect the implementation and existing tests for the prefer-implements-annotation rule to identify any edge cases or migration scenarios that are not yet covered by tests, and add focused tests to exercise those behaviors.
- [ ] Design and extend at least one additional end-to-end flow that invokes the installed traceability-maint CLI binary in a realistic scenario, verifying its behavior for both success and error paths in line with the documented options and exit codes.
- [ ] Update developer-focused documentation to briefly summarize the new tests and end-to-end CLI flows, explaining how they relate to optional and edge-case behaviors and how future contributors should extend them when changing those areas.

## LATER

- [ ] Broaden edge-case test coverage for other optional or less frequently used rules, ensuring that unusual configuration combinations and mixed legacy annotations are well exercised.
- [ ] Introduce additional end-to-end scenarios for the CLI that cover more complex argument combinations, such as different output formats, dry-run behavior, and boundary error conditions.
- [ ] Use insights from the new tests and documentation to identify any small refactors that could simplify handling of optional or deprecated behaviors without changing external behavior, and implement them incrementally.
