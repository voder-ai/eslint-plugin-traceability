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
