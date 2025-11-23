## NOW

- [ ] Review the maintenance tools story and the existing maintenance utilities and tests to map each documented requirement and acceptance criterion to current behavior, producing a clear list of functional gaps that must be closed for the maintenance tools to fully satisfy the story.

## NEXT

- [ ] Design a minimal, safe command-line or workflow interface around the existing maintenance utilities that lets users run the key maintenance operations in a way that matches the story’s user experience requirements, and specify the data each command reports back.
- [ ] Enhance the maintenance reporting behavior so it provides clear, human-readable information about which annotations are stale or changed (and where), aligned with the story’s reporting and safety requirements, and add tests that capture this expected output.
- [ ] Refine the maintenance error-handling behavior for edge cases such as permission-denied paths or invalid inputs so it is explicitly defined and, where appropriate, graceful, and update or add tests to assert the chosen behavior for each scenario.
- [ ] Update or create user-facing documentation that explains how to use the maintenance tools (both programmatic APIs and any new CLI/workflow entrypoints), including examples and cautions about safety and reversibility, ensuring it is consistent with the implemented behavior and the story’s acceptance criteria.
- [ ] Re-run the full story against the updated implementation and tests to verify that all acceptance criteria for the maintenance tools are now met and that the functionality assessment for this story can be considered passing.

## LATER

- [ ] Consider adding optional automation, such as file-watching or integration with existing project scripts or hooks, to run maintenance operations when story files are moved or renamed if the story explicitly calls for it and it can be implemented without overcomplicating the workflow.
- [ ] Refine and, if helpful, generalize the maintenance reporting format so it can be consumed by other tools (for example, machine-readable JSON alongside human-readable output) while keeping the primary user experience simple.
- [ ] Look for opportunities to further simplify or refactor the maintenance code and tests once all functionality is complete, ensuring they remain easy to read, maintain, and extend without changing external behavior.
