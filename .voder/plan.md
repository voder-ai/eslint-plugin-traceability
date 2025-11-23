## NOW

- [ ] Analyze the most duplicated test file related to annotation checking and design a small shared helper or fixture abstraction that will let you remove obvious copy‑pasted test code while keeping the tests’ behavior and readability intact.

## NEXT

- [ ] Refactor the selected annotation-checker test file to use the new shared helper or fixture, ensuring all existing scenarios are still covered and the tests remain easy to understand.
- [ ] Apply the same shared helper or a closely related one to at least one or two other highly duplicated rule test files so that their repeated patterns are consolidated without changing tested behavior.
- [ ] Review one large, complex production module that underpins traceability or maintenance logic and sketch a minimal, behavior-preserving restructuring that extracts cohesive helper functions or submodules to reduce size and clarify responsibilities.
- [ ] Implement the planned restructuring in that production module, updating traceability annotations as needed and confirming that public behavior and existing test coverage remain unchanged.
- [ ] Re-evaluate duplication and file-size metrics after these changes to confirm that the worst hotspots have improved and that the overall code-quality posture has moved closer to the desired threshold.

## LATER

- [ ] Systematically apply similar duplication-reduction techniques to the remaining high-duplication test files, introducing additional shared test utilities where they clearly improve maintainability.
- [ ] Incrementally decompose the other large production files identified in the assessment into smaller, focused modules or helpers, using behavior-preserving refactors and keeping each step small and well-covered by tests.
- [ ] Refine the duplication monitoring setup to emphasize separate thresholds for production and test code, using the reports to guard against regressions now that the biggest hotspots have been addressed.
- [ ] Periodically revisit the ESLint configuration and code-quality ratcheting ADR to see if further tightening of limits (such as function length or complexity) is appropriate once the structure of the codebase is cleaner.
