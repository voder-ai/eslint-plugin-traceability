# ADR: Maintenance CLI Interface for Traceability Annotations

## Status

Accepted

## Date

2025-11-23

## Context

Story `docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md` introduces maintenance tools that help keep `@story` and `@req` annotations accurate as story files are moved, renamed, or removed.

We already have programmatic utilities under `src/maintenance/`:

- `detectStaleAnnotations(codebasePath)`
- `updateAnnotationReferences(codebasePath, oldPath, newPath)`
- `batchUpdateAnnotations(codebasePath, mappings)`
- `verifyAnnotations(codebasePath)`
- `generateMaintenanceReport(codebasePath)`

These are well-tested but only accessible from code. The story's acceptance criteria and implementation notes explicitly call out **CLI tools** and a **clear user experience**:

- Detect and update annotation references when story files are moved or renamed.
- Provide clear feedback about what changed.
- Handle edge cases (e.g., permission issues) gracefully.

Without a small, well-defined CLI layer, developers must write ad-hoc scripts to use the maintenance API, which undermines the goal of "helper tools" and makes it harder to adopt maintenance workflows consistently across projects.

## Decision

We will introduce a small Node CLI, published with the plugin, that wraps the existing maintenance utilities with a minimal, safe interface.

### 1. CLI entrypoint

- **Binary name**: `traceability-maint`
- **Implementation**: TypeScript module `src/maintenance/cli.ts` compiled to `lib/src/maintenance/cli.js`.
- **Package wiring**:
  - Add a `bin` entry to `package.json` pointing `traceability-maint` to `lib/src/maintenance/cli.js`.
  - Keep `files: ["lib", "README.md", "LICENSE"]` so the compiled CLI is included automatically.
- **Shebang**: `#!/usr/bin/env node` at the top of the compiled script so it is directly executable.

The CLI module will export a `runMaintenanceCli(argv: string[]): number` function for tests, and execute it when invoked as the main module.

### 2. Supported commands (initial scope)

The initial CLI will support the following subcommands:

1. `detect`
   - Usage: `traceability-maint detect [--root <dir>] [--json]`
   - Behavior:
     - Uses `detectStaleAnnotations(root)` to find stale `@story` references.
     - Prints either:
       - Plain text: one stale story path per line plus a short summary, or
       - JSON: `{ "root": "...", "stale": ["..."] }` when `--json` is provided.
     - **Exit codes**:
       - `0` when no stale annotations are found.
       - `1` when one or more stale annotations are found.
       - `2` for invalid arguments or unexpected errors.

2. `verify`
   - Usage: `traceability-maint verify [--root <dir>]`
   - Behavior:
     - Uses `verifyAnnotations(root)` (and/or `detectStaleAnnotations`) to check overall health.
     - Prints a short human-readable summary indicating whether annotations are valid.
     - **Exit codes**:
       - `0` when all annotations under `root` are valid.
       - `1` when stale annotations exist.
       - `2` for invalid arguments or unexpected errors.

3. `report`
   - Usage: `traceability-maint report [--root <dir>] [--format text|json]`
   - Behavior (initially):
     - Uses maintenance detection utilities to produce a **human-readable report** of stale annotations.
     - At a minimum, lists stale story paths and the workspace root.
     - In follow-up work (same story), the report will be enhanced to include **file and line** locations for each stale annotation.
   - **Exit codes**:
     - `0` on successful report generation (even if stale annotations exist).
     - `2` for invalid arguments or unexpected errors.

4. `update`
   - Usage: `traceability-maint update --root <dir> --from <oldPath> --to <newPath> [--dry-run] [--json]`
   - Behavior (initially):
     - Uses `updateAnnotationReferences(root, oldPath, newPath)` to update `@story` references.
     - Prints how many annotations were updated.
     - When `--dry-run` is passed, it will **plan** changes and report what would be updated without modifying files (implemented via small helpers in `src/maintenance/update.ts`).
   - **Exit codes**:
     - `0` when the operation completes successfully.
     - `2` for invalid arguments or unexpected errors.

The CLI will also support `--help` / `-h` or no subcommand to print usage.

### 3. Safety and error handling

- The CLI will:
  - Validate arguments and print clear error messages for misuse (e.g., missing `--from` / `--to`).
  - Catch unexpected errors at the top level, log a concise diagnostic to stderr, and exit with a non-zero code.
  - Treat normal findings (e.g., stale annotations found) as **controlled outcomes** with predictable exit codes, not unhandled exceptions.
- Core maintenance utilities (`src/maintenance/*.ts`) will remain free of `console.*` calls; only the CLI layer will write to stdout/stderr, per ADR-0001.

### 4. Defaults and configuration

- `--root` defaults to the current working directory (`.`) when omitted.
- All paths are treated as workspace-relative to the process CWD, consistent with existing maintenance helpers.
- No additional configuration files are introduced for the CLI in this story; future enhancements (e.g., a JSON config) would be separate stories.

### 5. Testing strategy

- Add dedicated Jest tests under `tests/maintenance/cli.test.ts` that:
  - Import and call `runMaintenanceCli([...])` directly (no need to spawn a new Node process).
  - Use temporary directories under `os.tmpdir()` with cleanup in `afterAll`/`finally` blocks.
  - Assert on:
    - Exit codes for `detect`, `verify`, `report`, and `update`.
    - Key substrings in console output (captured via Jest spies on `console.log` / `console.error`).
  - Include `@story` / `@req` annotations referencing `docs/stories/009.0-DEV-MAINTENANCE-TOOLS.story.md`.

## Consequences

### Positive

- Developers gain a simple, documented CLI for common maintenance operations, without needing to write custom scripts.
- The CLI design keeps safety and reversibility in mind (dry-run support, clear exit codes).
- The CLI remains thin: it delegates all real work to the existing, tested maintenance utilities.
- Tests target the CLI behavior directly, while keeping it easy to evolve.

### Negative / Trade-offs

- Adding a CLI introduces a small surface area of user-facing behavior that must be maintained and versioned.
- The initial `report` and `update --dry-run` implementations will be relatively simple; richer reporting (file/line details, machine-readable change logs) will require incremental enhancements.

## Future Work (within Story 009.0)

The following improvements are planned as part of fully satisfying Story 009.0 but are not required to introduce the CLI itself:

- Enhance maintenance reporting to include **file and line** locations for each stale annotation, both programmatically and in the CLI `report` output.
- Improve error handling for edge cases such as permission-denied directories by making traversal utilities more resilient and surfacing issues via the CLI in a controlled way.
- Extend documentation in `user-docs/` and `README.md` to cover the maintenance CLI with examples and safety notes (dry-run, backups).

These changes will be implemented incrementally with dedicated tests and, where appropriate, additional ADRs or updates to this document.
