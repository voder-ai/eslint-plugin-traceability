## NOW

- [ ] Start implementing the first small CLI refactor by extracting the maintenance CLI flag parsing and normalization logic into a dedicated flags module, updating the existing CLI entry point to delegate to this module without changing any external behavior or public APIs.

## NEXT

- [ ] Extract the maintenance CLI subcommand handler functions into a separate commands module so that the main CLI entry point is reduced to wiring parsed arguments to these handlers while preserving existing behavior and exit codes.
- [ ] Refine the helper code currently using targeted ESLint suppressions so that the same behavior is achieved without needing those suppressions, for example by adjusting function signatures or introducing small configuration objects.
- [ ] Add focused tests that exercise defensive and error-handling paths in the maintenance CLI and supporting helpers, such as invalid flag combinations, non-existent roots, and filesystem access failures, to ensure these paths are explicitly covered without altering behavior.
- [ ] Review the updated CLI and helper structure to confirm it still aligns with the documented stories and ADRs, and lightly adjust internal documentation where necessary to reflect the new module boundaries.

## LATER

- [ ] Carry out the remaining low-risk refactors identified in the code-quality refactor opportunities document, such as further narrowing responsibilities in helper modules and introducing small wrapper utilities around annotation-detection logic.
- [ ] Introduce additional defensive-path tests around the deep validation rules (e.g., complex @implements combinations and path-boundary checks) to provide even stronger coverage of failure modes.
- [ ] Re-evaluate Cyclomatic complexity or max-lines thresholds after refactors to see whether they can be modestly tightened without impacting maintainability, and update the lint configuration only if it is clearly beneficial.
- [ ] Update or add a concise architecture decision record that captures the final structure of the maintenance CLI, the rationale for removing eslint suppressions, and the approach to defensive-path testing so that future contributors understand the design choices.
