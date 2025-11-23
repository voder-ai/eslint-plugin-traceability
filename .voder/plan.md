## NOW

- [ ] Review and tighten the user-facing maintenance documentation so that the described maintenance API functions and `traceability-maint` CLI commands, options, examples, and exit codes exactly match the current implementation and no longer claim unsupported behavior.

## NEXT

- [ ] Audit the maintenance and CLI source files for any remaining missing or inconsistent traceability annotations on functions and significant branches, and add or correct @story and @req tags so they align with the maintenance tools story and requirements.
- [ ] Adjust the declared Node engine version in the project metadata to reflect the true minimum supported runtime implied by the ESLint 9 toolchain, and confirm that this change is consistent with how the project is currently built and tested.
- [ ] Revisit the documented dev-only security incidents and dependency override rationale to ensure they still accurately describe the present dependency tree and accepted residual risks, updating timelines or notes where necessary.
- [ ] After documentation and security updates are in place, re-assess the maintenance tools story against the implementation and tests to confirm all acceptance criteria are met and that functionality can be considered complete for this story.

## LATER

- [ ] Enhance the maintenance reporting capabilities to include file and line level information for each stale annotation, and reflect that richer detail in both the programmatic API and CLI output formats.
- [ ] Improve the robustness of maintenance utilities when encountering filesystem edge cases such as permission-denied directories or unexpected file types, ensuring these scenarios are handled gracefully and are clearly surfaced through the CLI without crashing.
- [ ] Refine the maintenance documentation to include more advanced usage patterns, such as integrating the CLI into CI workflows or project scripts, once the core behavior and basic docs are fully aligned and stable.
- [ ] Evaluate whether any additional automated checks are helpful to continuously enforce documentation–implementation alignment for the maintenance tools, such as lightweight tests that parse example commands or compare documented signatures against exported APIs.
