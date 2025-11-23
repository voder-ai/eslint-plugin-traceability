## NOW

- [ ] Review the existing linting and static analysis configuration to identify specific, security-relevant rules that can be safely enabled or tightened to catch risky patterns without overwhelming the current codebase.

## NEXT

- [ ] Enable a small, well-justified set of additional security-focused lint rules and update the configuration accordingly, then address any reported issues in the code so the project continues to pass all checks.
- [ ] Inspect the most complex or largest source module related to traceability or maintenance logic and design a small, behavior-preserving refactor that simplifies its structure or splits responsibilities without changing public behavior.
- [ ] Implement the planned refactor in that module, keeping changes narrowly scoped and ensuring the code remains clear, traceable, and easy to test.
- [ ] Use the existing duplication reports to pinpoint one or two of the most duplicated test or helper patterns and plan a small extraction into shared utilities to reduce copy-paste while preserving test readability.
- [ ] Apply the selected duplication reduction by introducing shared helpers or fixtures, updating the affected tests to use them, and confirming that behavior and coverage remain unchanged.

## LATER

- [ ] Introduce a dedicated static application security analysis workflow that integrates with the existing pipeline to scan the TypeScript codebase for deeper security issues beyond what linting can detect.
- [ ] Progressively expand the set of security-oriented lint rules as the codebase adapts, periodically reviewing rule impact to ensure a good balance between safety and developer ergonomics.
- [ ] Continue iteratively decomposing remaining large or complex files into smaller, focused modules so that future changes are easier and less error-prone, especially in maintenance and rule helper code.
- [ ] Refine and automate reporting from duplication and security tools so that maintainers can quickly see trends and hotspots over time without manually inspecting raw reports.
