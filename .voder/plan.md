## NOW

- [ ] Update the main README so that the list of available ESLint rules explicitly includes the `traceability/require-test-traceability` rule with a concise description consistent with the existing API reference.

## NEXT

- [ ] Review the source files for any remaining traceability annotations that still use non-standard tags such as `@implements` and convert them to use the canonical `@supports` or `@story`/`@req` formats so documentation and implementation traceability are fully aligned.
- [ ] Cross-check SECURITY-related documentation (such as the security policy and CI/CD pipeline description) against the existing security scripts and audits to ensure they accurately describe the current security checks and guarantees.
- [ ] Refine the user-facing documentation for the `traceability/require-test-traceability` rule to include a short, self-contained example that shows test files with `@supports` annotations and `[REQ-...]`-prefixed test names, making its behavior clear without requiring knowledge of internal stories.

## LATER

- [ ] Create a brief security overview document for end users that summarizes how dependency audits, secret scanning, and maturity checks work together, referencing only the user-visible scripts and guarantees.
- [ ] Expand the examples section to include a complete project snippet demonstrating how all key rules (including `require-test-traceability`) work together in a typical repository layout.
- [ ] Periodically re-review documentation whenever new rules or maintenance commands are added to ensure the README, API reference, and security policy remain synchronized with the implementation.
