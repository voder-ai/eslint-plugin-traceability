## NOW

- [ ] Refactor the most highly duplicated test suite into clearer shared helpers or parameterized tests so that it keeps the same behavior while significantly reducing internal copy‑paste duplication.

## NEXT

- [ ] Apply the same style of duplication‑reducing refactor to the next one or two most duplicated test files, extracting common setup and assertion patterns into reusable helpers while ensuring all existing scenarios remain covered.
- [ ] Review the shared test utilities to smooth out any remaining type or lint edge cases so they use consistent patterns and no longer require ad‑hoc workarounds.
- [ ] Update the main user-facing documentation files to replace plain-text or backticked file references with proper Markdown links so that all referenced guides are easily navigable.
- [ ] Adjust the packaging configuration and documentation references so that every user-facing link in the README and user docs either points to a file that is included in the published package or to a stable canonical URL that will work for npm consumers.
- [ ] Verify that code-level traceability annotations remain accurate after the refactors by checking functions and key branches in the updated tests and utilities and adding or fixing annotations where they are missing or incomplete.

## LATER

- [ ] Continue reducing duplication in remaining test files and any newly identified hotspots in production code, keeping an eye on jscpd reports to drive small, focused refactors.
- [ ] Revisit ESLint complexity, max-lines, and related thresholds once duplication and structure are improved, tightening them only where they clearly support maintainability without causing churn.
- [ ] Expand defensive-path and edge-case tests for the deeper validation rules (such as complex @implements combinations and strict path-boundary behavior) to further strengthen code quality and confidence.
- [ ] Audit the entire codebase for traceability consistency, ensuring every named function and significant conditional branch includes a properly formatted story/requirement annotation, and add or update ADRs to document the improved testing and documentation structure.
