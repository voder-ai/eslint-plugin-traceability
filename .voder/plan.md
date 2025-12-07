## NOW

- [ ] Review the duplicated logic region in the branch annotation helpers module to clearly identify the common behavior and boundaries that can be safely extracted into a shared helper.

## NEXT

- [ ] Design a small, well-named helper function that encapsulates the identified common behavior while preserving existing semantics for all callers.
- [ ] Refactor the existing duplicated code sites in the branch annotation helpers module to call the new helper, keeping the code readable and maintaining existing traceability annotations.
- [ ] Review and, if needed, extend the existing unit and integration tests around branch annotation behavior to ensure they still pass and adequately cover the refactored helper paths.

## LATER

- [ ] Conceptually reassess the overall duplication and complexity in the branch annotation helpers module to confirm that the targeted refactor has reduced duplication without hurting clarity.
- [ ] Update any internal development or architecture documentation that describes helper patterns for branch annotation logic to mention the new shared helper and its intended use.
- [ ] Identify any nearby opportunities for similarly small, incremental refactors in related utilities that could further reduce duplication or complexity in future work.
