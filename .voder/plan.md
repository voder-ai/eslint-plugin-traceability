## NOW

- [ ] Assess the current formatter integration tests and Jest configuration to determine whether any Prettier-related integration paths are still failing or flaky and to pinpoint exactly which scenarios need additional test coverage or fixes.

## NEXT

- [ ] Design and add focused integration tests that cover any uncovered or previously failing Prettier-driven formatting scenarios, ensuring they exercise the real CLI behavior and are fast, deterministic, and clearly annotated with the relevant story and requirement IDs.
- [ ] Adjust or extend the formatter-integration helpers and rule logic, if needed, so that they behave correctly under the currently supported Prettier and Jest versions and so that the new integration tests pass reliably.
- [ ] Run the full test suite to confirm that all Jest tests, including the formatter integration tests, complete successfully without Prettier-related errors or module-resolution issues and that coverage thresholds remain satisfied.
- [ ] Review and, if necessary, refine the new formatter integration tests to reduce brittleness against harmless upstream Prettier formatting changes while still asserting the essential behavior and exit codes.
- [ ] Update any relevant story documents and internal testing documentation to reflect the finalized formatter integration behavior, the new tests that cover it, and the confirmed support matrix for Node, Jest, and Prettier versions.

## LATER

- [ ] Perform a focused functionality review of the stories that depend on formatter-aware behavior (such as catch and else-if branch annotations) to confirm that they are now fully satisfied end to end, including their Prettier integration aspects.
- [ ] Identify any remaining areas of the plugin that rely on external tooling behavior (other than Prettier) and add similar robust integration tests and documentation so those dependencies are equally well covered.
- [ ] Once all formatter and external-tool integrations are stable, cross-check story requirements, implementation, tests, and user-facing documentation to ensure there are no undocumented behaviors and no documented behaviors lacking executable tests.
