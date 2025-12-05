# Maintenance Tools Performance & Stress Testing

**Story:** docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md  
**Scope:** `src/maintenance/*`, maintenance CLI entrypoint, and related tests under `tests/maintenance/*`.

## Critical Workflows and Code Paths

After reviewing the maintenance and CLI modules plus their existing tests, the following workflows are the most sensitive to very large workspaces:

1. **Stale annotation detection**
   - **Code paths**:
     - `detectStaleAnnotations` in `src/maintenance/detect.ts`
     - `getAllFiles` in `src/maintenance/utils.ts`
     - `handleStoryMatch` and boundary checks in `src/maintenance/detect.ts`
     - `isUnsafeStoryPath` / `enforceProjectBoundary` in `src/utils/storyReferenceUtils.ts` (used transitively)
   - **Why critical**:
     - Performs a full recursive traversal of the workspace and reads each file.
     - Uses regular expressions to scan contents for `@story` annotations.
     - Performs multiple filesystem existence checks for each distinct `@story` path.
     - This is the primary **O(number of files + number of annotations)** operation in the maintenance toolchain.

2. **Batch verification and reporting**
   - **Code paths**:
     - `verifyAnnotations` in `src/maintenance/batch.ts`
     - `generateMaintenanceReport` in `src/maintenance/report.ts`
     - These both reuse `detectStaleAnnotations` internally.
   - **Why critical**:
     - They directly wrap detection and therefore inherit its scaling behavior.
     - Often run as part of CI or local quality gates where prolonged runtime is user-visible.

3. **In-place annotation updates**
   - **Code paths**:
     - `updateAnnotationReferences` in `src/maintenance/update.ts`
     - `batchUpdateAnnotations` in `src/maintenance/batch.ts`
   - **Why critical**:
     - Also performs a full traversal via `getAllFiles` and reads each file.
     - Uses a global regex replace to update `@story` paths and writes files back when changed.
     - On very large workspaces, this can stress both IO throughput and string processing.

4. **CLI entrypoints for maintenance workflows**
   - **Code paths**:
     - `runMaintenanceCli` in `src/maintenance/cli.ts`
     - Subcommand handlers in `src/maintenance/commands.ts` (`handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`).
     - Flag parsing and normalization in `src/maintenance/flags.ts`.
   - **Why critical**:
     - The CLI wiring is thin, but it ties user-visible performance directly to the detection and update routines.
     - Stress tests should exercise these entrypoints so we detect regressions in real invocation patterns, not just internal helpers.

## Target Scales for Performance Characterization

To keep tests reliable while still exercising realistic "large workspace" behavior, we define the following target scales:

1. **Large detection workspace (core maintenance APIs)**
   - **Shape**:
     - ~10 top-level subdirectories under a synthetic workspace root.
     - ~50 TypeScript source files per directory, for a total of **≈500 source files**.
     - Each source file contains at least one `@story` annotation.
     - A mix of **existing** and **stale** story paths:
       - ~250 unique `*.story.md` paths that **do** exist.
       - ~250 unique `*.story.md` paths that **do not** exist (stale).
   - **Operations under test**:
     - `detectStaleAnnotations(workspaceRoot)`
     - `verifyAnnotations(workspaceRoot)`
     - `generateMaintenanceReport(workspaceRoot)`
   - **Expectation**:
     - All operations complete successfully and return correct results on this dataset.
     - Wall-clock runtime for the combined detection/verification/reporting path on a CI-class machine remains **comfortably under ~5 seconds**.
     - No excessive memory usage (no attempts to load the entire workspace contents into a single, long-lived in-memory structure).

2. **Large update workspace (in-place rewrite flows)**
   - **Shape**:
     - Reuses the same ~500-file layout, but with a controlled set of `@story old.path-X.story.md` references.
     - A subset (e.g. ~250 annotations) target an "old" path that will be updated to a new path.
   - **Operations under test**:
     - `updateAnnotationReferences(workspaceRoot, oldPath, newPath)`
     - `batchUpdateAnnotations(workspaceRoot, mappings)`
   - **Expectation**:
     - All matching annotations are updated correctly and idempotently.
     - Total runtime for a representative update (single mapping) remains **comfortably under ~5 seconds**.
     - The API remains safe to use in CI and pre-commit hooks for workspaces of this order of magnitude.

3. **CLI-level large workspace scenarios**
   - **Shape**:
     - Reuse the same synthetic large workspace roots from the maintenance API tests.
   - **Operations under test**:
     - `runMaintenanceCli(["node", "traceability-maint", "detect", "--root", <workspaceRoot>, "--json"])`.
     - Optionally, additional coverage for `report` and `update` subcommands using the same fixture.
   - **Expectation**:
     - CLI commands complete within a generous time budget (aligned with the ~5 second target for core APIs on this dataset).
     - Exit codes follow the contract (0 for clean, 1 for stale, 2 for usage errors).
     - JSON output is well-formed and includes the expected number of stale paths for the large fixture.

## Fixture Design Principles

The synthetic large-workspace fixtures to be implemented in tests will follow these principles:

- **Generated, not checked-in**: Use OS temporary directories and helper utilities (e.g. `tests/utils/temp-dir-helpers.ts`) to construct large workspaces at test time rather than committing thousands of files to the repository.
- **Simple and deterministic structure**: Directory and file naming patterns are derived from simple counters (e.g. `module-001/file-0001.ts`, `story-0001.story.md`) so that expected story paths and counts are easy to reason about in tests.
- **Balanced stale vs valid references**: Each large fixture includes both valid and stale `@story` references so that detection, verification, and reporting behaviors are all meaningfully exercised.
- **Reusable across tests**: A shared helper will construct these fixtures once per test suite (where practical) and clean them up after the suite completes, minimizing duplication and keeping test runtime predictable.

These decisions complete the **NOW** task of identifying the critical maintenance and CLI workflows that are sensitive to very large workspaces and defining concrete target scales for performance characterization.

## Test Locations and Commands

Performance and stress tests for the maintenance tools live under:

- Core API performance tests:
  - `tests/maintenance/perf/detect-large-workspace.test.ts`
  - `tests/maintenance/perf/update-large-workspace.test.ts`
- CLI-level performance tests:
  - `tests/maintenance/perf/cli-large-workspace.test.ts`
- Shared fixture and helper utilities:
  - `tests/maintenance/perf/large-workspace-fixtures.ts`
  - `tests/utils/temp-dir-helpers.ts`

Typical commands:

- Run only maintenance performance tests (recommended):
  - Using package script (preferred, if available):
    - `pnpm test:maintenance-perf`
    - or `npm run test:maintenance-perf`
  - Direct Vitest invocation:
    - `pnpm vitest run tests/maintenance/perf`
    - or `npx vitest run tests/maintenance/perf`

- Run a single perf test file:
  - `pnpm vitest run tests/maintenance/perf/detect-large-workspace.test.ts`
  - `pnpm vitest run tests/maintenance/perf/cli-large-workspace.test.ts`

- Run maintenance tests including perf as part of a broader suite (slower):
  - `pnpm vitest run tests/maintenance`

If your project uses Jest instead of Vitest, the equivalent commands are:

- `pnpm jest tests/maintenance/perf`
- `pnpm jest tests/maintenance/perf/detect-large-workspace.test.ts`

Check `package.json` for the authoritative scripts and preferred test runner.

## When to Run These Tests

These performance tests are intentionally heavier than unit tests and should not run on every edit-save cycle. Use them in these situations:

- **Before merging significant maintenance-tool changes**
  - Any change to:
    - `src/maintenance/detect.ts`
    - `src/maintenance/update.ts`
    - `src/maintenance/batch.ts`
    - `src/maintenance/report.ts`
    - `src/maintenance/utils.ts`
    - `src/maintenance/cli.ts`, `src/maintenance/commands.ts`, or `src/maintenance/flags.ts`
  - Any change to `@story` parsing, path resolution, or file traversal utilities used by these modules.

- **When changing filesystem or globbing behavior**
  - Modifications to directory walking logic, ignore rules, or project boundary enforcement.

- **Periodically in CI**
  - As a scheduled job (e.g. nightly or weekly) to detect regressions unrelated to local changes (such as dependency upgrades).
  - As an optional “extended” CI job that runs on main or release branches.

- **Before tagging a release**
  - Especially for releases that advertise improvements or changes to maintenance tooling or CLI behavior.

Avoid running these tests in the tight inner loop (e.g. pre-push hooks) unless you are specifically working on performance and accept the extra run time.

## Interpreting Results

### Functional expectations

All performance tests must first pass functionally:

- **Detection / verification / reporting tests**:
  - The number of detected stale annotations matches the expected counts for the synthetic workspace.
  - No unexpected errors or thrown exceptions.
- **Update tests**:
  - All targeted `@story` references are updated to the new path.
  - Non-targeted references remain unchanged.
  - Running the same update operation a second time is effectively a no-op (idempotent).
- **CLI tests**:
  - Exit code:
    - `0` when no stale annotations are present.
    - `1` when stale annotations are found (per contract).
    - `2` for usage errors or invalid flags.
  - JSON output parses successfully and reports the expected number of stale annotations.

If any of these assertions fail, treat it as a correctness bug rather than a performance issue.

### Performance and timing expectations

The tests are written to assert that operations complete within a **generous but finite** time budget. Guidelines:

- For the synthetic ~500-file workspaces described above:
  - Combined detection/verification/report/report paths should complete **comfortably under ~5 seconds** on a CI-class machine.
  - Representative single-path update operations should also complete **comfortably under ~5 seconds**.
- Test code typically:
  - Measures wall-clock time around the operation under test.
  - Asserts that the measured time is less than a threshold value.
  - May log timings for informational purposes.

If a test fails due to a timeout or an explicit duration assertion:

1. **Confirm environment**
   - Ensure you are not running on an unusually constrained machine (e.g. heavy load, low I/O, containers with strict limits).
   - Re-run the specific test file once to rule out transient slowdowns.

2. **Check for recent changes**
   - Look for recent modifications to:
     - File traversal logic (`getAllFiles`, globs, recursion).
     - Annotation parsing/regexes.
     - Batch operations that may now be performing extra work (e.g. repeated reads, redundant stat calls).
   - Compare the implementation with previous versions to identify new sources of repeated I/O or allocations.

3. **Profile or instrument**
   - Add temporary timers or logging around:
     - Filesystem traversal.
     - Story resolution and boundary checks.
     - Regex-based scanning and replacements.
   - Use these to locate hotspots (e.g. a nested loop over files and stories, or synchronous I/O in tight loops).

4. **Decide on next steps**
   - If performance degraded due to a clear regression, fix the underlying issue and re-run the tests.
   - If the environment is inherently slower than CI but timings are still reasonable, consider:
     - Increasing local thresholds only for ad-hoc runs (do not relax CI thresholds without clear justification).
     - Running the tests in CI to get canonical timing measurements.

### What is acceptable to adjust

- It is acceptable to:
  - Tweak thresholds slightly if:
    - CI hardware is changed and becomes consistently slower or faster.
    - There is evidence that variability near the threshold causes flaky failures.
  - Improve fixture generation code to be faster or simpler as long as the overall scale and behavior remain equivalent.

- It is **not** acceptable to:
  - Loosen thresholds merely to “make tests pass” without understanding the performance change.
  - Reduce the size or complexity of the synthetic workspace in a way that stops reflecting realistic large-workspace behavior.

Use these tests as a guardrail: if they fail, it should prompt a discussion and investigation into the trade-offs being made between new functionality and the scalability of the maintenance tools.
