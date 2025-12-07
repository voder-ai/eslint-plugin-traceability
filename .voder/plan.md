## NOW

- [ ] Perform a focused review of the entire req-annotation detection utility to identify any remaining subtle edge cases or conditional paths that may not be clearly covered by existing tests.

## NEXT

- [ ] List any newly identified edge cases or branch scenarios from the req-annotation detection utility review and map each one to a concrete example that should be tested.
- [ ] Extend the existing req-annotation detection test suite with additional test cases that exercise the newly identified scenarios, ensuring each test is clearly named and tied to the relevant story and requirement annotations.
- [ ] Re-evaluate the utility’s behavior against the strengthened tests to confirm that all important branches are now exercised and that the observable behavior remains correct and consistent.

## LATER

- [ ] Consider small, behavior-preserving refactorings to the req-annotation detection utility to make its branching logic and heuristics easier to read and reason about, using the expanded tests as a safety net.
- [ ] Update or add internal development documentation to describe the req-annotation detection strategies, including the newly tested edge cases, so future contributors can understand and extend the heuristics safely.
- [ ] Periodically revisit the req-annotation detection tests when new stories or requirements are added to ensure the suite continues to reflect the full range of supported annotation patterns.
