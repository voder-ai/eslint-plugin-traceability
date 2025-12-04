## NOW

- [ ] Clarify in the internal code-quality assessment guide how maintainers and tools should interpret CODE_QUALITY results for the rules-and-helpers slice, including what counts as a passing outcome versus when targeted refactoring is required before re-running the assessment.

## NEXT

- [ ] Update the existing architecture decision record about code-quality ratcheting to reference the slice-based approach and describe how ratcheting thresholds should now be applied per slice, starting with the rules-and-helpers slice.
- [ ] Add a note to the internal functionality-coverage documentation making it explicit that FUNCTIONALITY assessments must wait until CODE_QUALITY has successfully passed for the rules-and-helpers slice, so the dependency between these assessments is clear.
- [ ] Review the slice configuration file to confirm that no lower-priority slices inadvertently include large or unnecessary paths that could jeopardize context limits when they are assessed later, adjusting boundaries if needed without changing the already-defined rules-and-helpers slice.

## LATER

- [ ] Once a CODE_QUALITY run on the rules-and-helpers slice has completed successfully, extend the same interpretation and gating rules to the maintenance-and-cli and plugin-and-config slices so their results can inform further improvements.
- [ ] Use feedback from CODE_QUALITY runs on individual slices to plan small, behavior-preserving refactors that address identified issues in the most critical modules and then re-run slice-based assessments to confirm improvements.
- [ ] After CODE_QUALITY assessments are consistently passing on all high-priority slices, proceed to request or enable a full FUNCTIONALITY assessment that relies on the now-stable CODE_QUALITY foundation and update documentation to reflect this new baseline.
