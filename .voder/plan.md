## NOW

- [ ] Enable the traceability annotation format lint rule in the project’s lint configuration and add targeted suppressions so that all existing TypeScript and JavaScript files pass linting while the rule is active.

## NEXT

- [ ] Update a small group of malformed or legacy traceability annotations in one helper module to comply with the new format rule so that the corresponding suppressions can be safely removed.
- [ ] Refactor one clearly duplicated helper pattern in the traceability rule helpers into a shared function so that the amount of duplicated code in that area is reduced without increasing complexity.
- [ ] Align any remaining mixed @story/@req annotations on core rule entry points with the preferred @supports-first style so that the codebase consistently uses the modern traceability format.

## LATER

- [ ] Gradually replace the remaining suppressions for the traceability annotation format rule by correcting annotations across the codebase in small, self-contained changes.
- [ ] Identify another small cluster of duplicated logic in the rules or maintenance helpers and extract it into a shared utility to further lower code duplication while keeping functions short and focused.
- [ ] Lower the maximum allowed file length limit in the lint configuration once helpers are more decomposed so that long files are discouraged without forcing disruptive refactors.
