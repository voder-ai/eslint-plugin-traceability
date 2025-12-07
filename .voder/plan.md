## NOW

- [ ] Update the function-annotations story document so that it explicitly states that the advanced req-detection heuristics are now covered by dedicated tests and marks the corresponding acceptance-criteria or Definition of Done items as complete.

## NEXT

- [ ] Review the requirement IDs and descriptions in the function-annotations story to ensure they match the behaviors exercised by the new req-annotation detection tests and adjust wording where necessary for clarity.
- [ ] Check any related development documentation that references the advanced req-detection heuristics to confirm it no longer suggests these paths are untested or experimental, updating the language to reflect their tested status.

## LATER

- [ ] Scan coverage reports for other minor uncovered branches in core helper modules and plan similarly small, focused test additions to close those gaps incrementally.
- [ ] Standardize the use of @supports traceability annotations in any remaining legacy test files that still rely only on @story/@req so they match the preferred format.
- [ ] Revisit the else-if single-line annotation support story and design the implementation and tests needed to fully satisfy that requirement once the current coverage and documentation updates are complete.
