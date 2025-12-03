## NOW

- [ ] Review the existing implementation and tests for the rules that require story and requirement annotations so you can design how they should recognize `@implements` annotations as satisfying those requirements without breaking current `@story` and `@req` behavior.

## NEXT

- [ ] Update the annotation detection utilities and the require-story-annotation rule so that functions documented only with appropriate `@implements` lines are treated as having the necessary story coverage and no longer reported as missing `@story` annotations.
- [ ] Update the requirement detection utilities and the require-req-annotation rule so that suitable `@implements` lines are treated as satisfying the requirement-annotation check and do not trigger missing `@req` errors.
- [ ] Extend the rule test suites to include cases where `@implements` is used with and without legacy `@story` and `@req` annotations, verifying that the new behavior matches the multi-story support requirements in the 010.2 story and that existing scenarios remain unchanged.
- [ ] Align the 010.2 multi-story support story, relevant rule documentation, and any related ADRs to explicitly state that `@implements` satisfies the require-story-annotation and require-req-annotation rules, ensuring traceability annotations in code and tests reference the fulfilled requirement.
- [ ] Run a focused functionality review of all multi-story support behavior, using the updated tests and stories, to confirm that the remaining multi-story requirements are fully implemented and no new gaps have been introduced.

## LATER

- [ ] Identify and implement any additional usability enhancements around `@implements` (such as clearer diagnostics when `@implements` is malformed but present) while keeping behavior backwards compatible.
- [ ] Consider further refactoring of shared annotation-detection logic so that future extensions to traceability annotations can be added in one place and reused consistently across all related rules and maintenance tools.
