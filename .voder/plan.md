## NOW

- [ ] Review the branch annotation helper module to precisely identify the remaining duplicated logic in the formatter-aware branch handling code and decide on a small shared helper shape that can consolidate those behaviors without changing observable behavior.

## NEXT

- [ ] Introduce a new, well-named helper function in the branch annotation helper module that encapsulates the duplicated formatter-aware logic, including clear story and requirement annotations explaining its purpose.
- [ ] Refactor the existing duplicated code sites to use the new helper function, ensuring inputs and outputs remain equivalent so that catch and else-if branch handling behavior does not change.
- [ ] Revisit the existing branch-annotation helper tests for catch and else-if positions and insert positions to confirm they still exercise the refactored logic and add a targeted test if the new helper introduces any previously untested edge case.

## LATER

- [ ] Re-run a duplication-focused review of the codebase to confirm that the branch annotation helper refactor has eliminated the identified duplicate block and to see if any similar micro-duplication remains worth addressing in future iterations.
- [ ] Update any relevant internal documentation or decision records, if needed, to briefly note the consolidation of formatter-aware branch helper logic and its rationale for maintainability.
- [ ] Look for other highly cohesive helper modules in the rules and utilities where small, behavior-preserving refactors could further reduce duplication and improve clarity without impacting existing story-aligned behavior.
