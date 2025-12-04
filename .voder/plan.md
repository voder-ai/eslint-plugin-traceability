## NOW

- [ ] Analyze the most highly duplicated test file and refactor it to use shared helpers or data builders so that repeated RuleTester setups and case definitions are centralized, reducing duplication without changing test behavior.

## NEXT

- [ ] Apply the same refactoring approach to the remaining test files that have very high duplication, extracting common configuration, fixtures, and assertion patterns into reusable test utilities while ensuring existing behaviors remain covered.
- [ ] Review the project’s traceability report and add or refine story and requirement annotations on any remaining unannotated functions and control-flow branches so that implementation traceability is effectively complete for existing features.
- [ ] Revisit the existing lint-rule suppression for the function that exceeds the parameter limit and either refactor the code to remove the need for the suppression or update its rationale to clearly document why it remains the preferred design.
- [ ] Once duplication and traceability improvements are in place, re-run the project’s duplication and traceability checks to confirm that overall code-quality indicators have improved enough to allow a full functionality assessment.

## LATER

- [ ] Consider tightening selected linting thresholds (such as maximum complexity or function length) in small increments, guided by current violation hotspots, to further reinforce maintainable design without causing widespread breakage.
- [ ] Enhance internal developer documentation to describe the shared testing helpers, traceability expectations, and how to extend them when adding new rules or maintenance features so future work naturally preserves high code quality.
- [ ] Evaluate whether the traceability check should be made stricter (for example, failing when coverage drops below an agreed threshold) once the current gaps are closed and the team is comfortable with the process.
