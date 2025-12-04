## NOW

- [ ] Identify the most heavily duplicated rule test suite and refactor it to use shared test helpers or data builders so that repeated RuleTester setup and case definitions are centralized while keeping existing behavior and coverage intact.

## NEXT

- [ ] Apply the same shared helper pattern to other closely related rule test files that currently duplicate large blocks of RuleTester configuration and test cases, further reducing structural duplication without changing test behavior.
- [ ] Introduce small, focused utility modules for repeated CLI and maintenance tests (for example, common temp-project setup or command invocation patterns) and update the corresponding tests to use these utilities instead of inlining similar code.
- [ ] Review the remaining test suite for any obvious copy‑and‑paste clusters and opportunistically refactor them into reusable helpers or fixtures, stopping short of over‑abstraction so the tests stay readable and easy to extend.

## LATER

- [ ] Reassess overall duplication and complexity metrics for tests and production code to confirm the code-quality score comfortably exceeds the target threshold and to identify any remaining hotspots worth a future refactor.
- [ ] Document the preferred patterns for DRY, story‑traceable tests in the internal development docs so new tests follow the refactored structure and do not reintroduce heavy duplication.
- [ ] Once duplication and structure are in a good state, consider whether it is appropriate to very slightly tighten selected lint rules (such as maximum function length or complexity) to lock in the improved code quality without making the codebase harder to work with.
