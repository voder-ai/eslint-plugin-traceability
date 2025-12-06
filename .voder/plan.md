## NOW

- [ ] Implement the next dogfooding requirement from the dogfooding validation story by extending the project’s ESLint configuration so that an additional core traceability rule is enforced on this repository in line with that story’s acceptance criteria.

## NEXT

- [ ] Add or update automated tests that verify the updated ESLint configuration correctly enforces the newly enabled traceability rule, including both configuration inspection and CLI-based failure behavior when annotations are missing.
- [ ] Update the dogfooding validation story document to mark the newly satisfied acceptance criteria as complete and link them to the new tests and configuration, ensuring the story accurately reflects the current state.
- [ ] Review related problem/incident or design documents connected to the dogfooding work and adjust them so they describe the resolved state and the new level of self-enforcement provided by the plugin.

## LATER

- [ ] Extend the dogfooding approach to cover all remaining traceability rules that are safe to enforce on this codebase, updating ESLint configuration and tests incrementally for each rule.
- [ ] Refine CI and pre-push guidance in contributor documentation so that developers clearly understand how the self-enforced traceability rules and dogfooding tests protect the project.
- [ ] Look for opportunities to further simplify or refactor the ESLint configuration and dogfooding tests while keeping all dogfooding story acceptance criteria fully satisfied and covered.
