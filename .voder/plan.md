## NOW

- [ ] Analyze the remaining uncovered defensive branches in the story utility helper to determine which specific edge-case inputs would exercise them and whether they represent distinct, user-visible behavior worth testing.

## NEXT

- [ ] Design one or two minimal additional test cases that target only the uncovered but meaningful defensive branches in the story utility helper, keeping them tied to the existing function-annotation story and requirement IDs.
- [ ] Extend the dedicated helper test file with these new edge-case tests, ensuring they follow the existing traceability and naming conventions and do not duplicate already-covered scenarios.
- [ ] Re-evaluate coverage for the story utility helper to confirm that all behaviorally meaningful branches are now executed by tests, and explicitly note any remaining untested guards that are intentionally left as generic defensive code.

## LATER

- [ ] Apply the same targeted-coverage approach to other rule helper modules that still have notable branch coverage gaps, adding only focused tests for behaviorally important defensive branches.
- [ ] Document a brief internal guideline for closing coverage gaps after refactors, using the story utility and redundant-annotation helpers as concrete examples of how to approach defensive branches.
- [ ] Enhance the user-facing documentation with a short section that clarifies the overall documentation layout and clearly distinguishes between end-user guides and internal development references without exposing internal-only paths.
