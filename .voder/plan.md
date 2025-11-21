## NOW

- [ ] find_files docs/stories/*.story.md

## NEXT

- [ ] read_file docs/stories/007.0-DEV-ERROR-REPORTING.story.md
- [ ] read_file the primary implementation files associated with the identified failing story (e.g., relevant rule or maintenance modules and their helper utilities) to compare behavior with the story’s acceptance criteria
- [ ] read_file the corresponding test files (for that rule or feature) to understand current coverage and any missing cases related to the story’s requirements
- [ ] modify_file the relevant source file(s) to implement any missing behavior required by the failing story, keeping changes minimal and clearly annotated with @story/@req traceability
- [ ] modify_file the associated test file(s) to add or adjust tests that validate the new or corrected behavior against the story’s acceptance criteria
- [ ] modify_file the story markdown and any relevant rule/user documentation to mark satisfied acceptance criteria and ensure docs align with the implemented behavior

## LATER

- [ ] After updating the identified failing story, re-run or review the functionality assessment to verify that all stories now pass and no new functional regressions have been introduced
- [ ] If multiple rules or utilities share behavior required by the fixed story, consider a small follow-up refactor to extract shared helpers, using branch-by-abstraction so behavior stays stable
- [ ] Review and extend traceability annotations where needed in newly modified files to ensure every new or changed function/branch points to the correct story and requirement IDs
- [ ] Once all documented stories pass, consider tightening or adding targeted tests in any areas where coverage is minimal for the last-fixed story, without overcomplicating the suite
