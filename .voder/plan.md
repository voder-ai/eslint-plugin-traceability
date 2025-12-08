## NOW

- [ ] Update the development dependency definition for the testing adapter package so that it references the latest safe ts-jest version identified by the dependency maturity report, making the unified function-level tests rely on the up-to-date adapter.

## NEXT

- [ ] Refresh the dependency lockfile so it records the new ts-jest version and ensures future installs use the updated, safe version consistently.
- [ ] Verify that all project quality checks still pass with the upgraded testing adapter, including building the code, running the full automated test suite, performing static analysis, and confirming formatting compliance.
- [ ] Re-run the dependency maturity and vulnerability checks conceptually to confirm there are no remaining safe-but-outdated packages and that audits report zero unresolved issues.
- [ ] Document the outcome of the ts-jest upgrade in the internal dependency health or decision documentation so maintainers understand why and when this change was made.

## LATER

- [ ] Add a concise user-facing documentation section that answers which traceability rule to enable by default, clearly recommending the unified rule while explaining when legacy aliases are appropriate.
- [ ] Extend the internal development documentation to briefly describe how the unified require-traceability rule and its legacy aliases are wired together so future refactors keep behavior and documentation aligned.
- [ ] Enable the plugin’s own traceability rules in its lint configuration incrementally (with temporary suppressions where needed) so that the codebase fully dogfoods the traceability enforcement it provides to users.
