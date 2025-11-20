# ADR: Add CI lint-plugin check and targeted branch tests

Date: 2025-11-20

Status: Accepted

Context

- CI currently runs a large, monolithic pipeline for every push/PR. This results in long feedback cycles and increased compute cost.
- Inconsistent commit messages and branch names reduce traceability and can cause problems for automated tooling (release automation, changelogs).
- Some tests are expensive and only relevant to certain branches (e.g., release or platform-specific branches), while most feature work only needs a smaller, targeted test subset.
- Contributors and maintainers want faster, reliable feedback on changes without sacrificing quality gates.

Decision

- Add a CI check that runs a lint-plugin against commits/PRs to enforce commit message format and branch naming rules. The lint-plugin will be integrated into the PR pipeline and fail the build on violations.
- Implement targeted branch tests:
  - For feature and routine PR branches: run a focused subset of tests (unit tests, fast integration tests, and any tests related to changed files) to provide quick feedback.
  - For release, main, or explicitly labeled branches (e.g., "release/_", "main", "hotfix/_"): run the full test suite.
  - Allow explicit overrides (e.g., PR label or commit tag) to trigger full runs when desired.
- Document the rules that determine which tests run and how to opt into full runs.

Rationale

- Lint-plugin for commits/branches enforces consistency and prevents human errors that complicate downstream automation (releases, changelogs, CI heuristics).
- Targeted tests reduce median CI turnaround time for everyday contributions, improving developer productivity and reducing wasted compute.
- Running the full suite only on critical branches preserves confidence for releases while keeping developer feedback loops short.
- Explicit override mechanism balances automation with developer control when a full run is necessary.

Consequences

- Positive:
  - Faster PR feedback for most contributions.
  - Improved commit/branch hygiene and stronger automation compatibility.
  - Lower CI costs for routine development.
  - Full confidence preserved for release and critical branches.
- Negative / Trade-offs:
  - Additional maintenance: rules for mapping changes to targeted tests must be maintained and updated.
  - Risk of missed regressions if test selection logic is incorrect or incomplete. Mitigated by defaulting to full runs on protected branches and providing an easy override.
  - Contributors will need to conform to enforced commit/branch rules; documentation and examples will be required.

Alternatives considered

- Always run full CI on every PR: simple but slow and costly.
- No lint-plugin enforcement: lower friction but greater chance of inconsistent metadata and automation failures.
- Run only full suite for releases and minimal checks for everything else without targeted selection: simpler but less efficient in catching relevant regressions early.

Implementation notes (high-level)

- Add lint-plugin step to CI config; fail on violations and provide clear error messages with remediation.
- Implement test-selection logic using file-change analysis and branch name rules; fall back to a safe default (full run for protected branches).
- Provide CONTRIBUTING and CI docs detailing commit message format, branch naming conventions, and how to force full CI runs.

This ADR is intended to be revisited after observing CI performance and quality metrics for one quarter post-rollout.
