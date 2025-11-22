# ADR-0001: Console Usage for CLI Guards, Helpers, and Plugin Bootstrap

## Status

Accepted

## Date

2025-11-22

## Context

This project includes:

- Command-line interface (CLI) entry points
- Helper scripts invoked in CI (e.g., validation, formatting, pre-publish checks)
- Plugin/bootstrap code that wires rules, schemas, and configuration into host environments

These components sometimes need to communicate directly with users or CI logs. At the same time, the core rule logic and runtime validation paths must remain deterministic, testable, and free of incidental logging side effects.

Unrestricted use of `console.*` makes it harder to:

- Keep CI logs focused and readable
- Distinguish genuine errors from noisy diagnostics
- Treat the library/rules as embeddable components in other tools
- Assert on behavior without having to mock or suppress console output
- Maintain a clear and intentional debugging story

We therefore need a clear policy on where and how console logging is allowed.

## Decision

### 1. Allowed: `console.error` and `console.warn` in CLI/CI/helper/bootstrapping layers

It is acceptable and encouraged to use `console.error` and `console.warn` **only** in the following layers:

1. **CLI entry points / top-level commands**
   - Example: `bin/*`, `cli.ts`, or similar top-level command handlers.
   - Purpose:
     - Report user-facing failures (e.g., invalid flags, failed file operations, configuration errors).
     - Surface deprecation notices that must be visible to users.
     - Provide actionable messages when the process will exit with a failing code.

2. **CI/helper scripts**
   - Example: scripts run in CI pipelines, pre-commit, or release workflows.
   - Purpose:
     - Report errors and warnings that should be visible in CI logs.
     - Indicate misconfiguration, missing environment variables, or unexpected states that require human attention.

3. **Plugin bootstrap / initialization code**
   - Example: modules that register rules, schemas, or integrations with other tools.
   - Purpose:
     - Report misconfiguration, incompatibility, or missing peer dependencies.
     - Warn about deprecated configuration patterns or features at startup.

Within these layers:

- Prefer `console.error` for conditions that are expected to cause failure or require immediate action.
- Prefer `console.warn` for non-fatal, but noteworthy, conditions.
- Ensure messages are:
  - Concise and actionable.
  - Clearly identify the originating tool/plugin where possible.
  - Avoid leaking sensitive information (tokens, file contents, etc.).

### 2. Disallowed by default: Incidental logging in core rule logic and runtime validation

The **core rule logic** and **runtime validation paths** must **not** emit incidental console output:

- **Disallowed by default (unless gated, see §3):**
  - `console.debug`
  - `console.info`
  - `console.log`
  - `console.warn`
  - `console.error`

These paths include, but are not limited to:

- Rule implementations and their helpers.
- Core validation pipelines and evaluators.
- Schema or configuration validation logic that runs during normal tool operation.
- Any code intended to be reusable as a library, imported by other tools, or executed repeatedly as part of analysis passes.

Rationale:

- These components are expected to be:
  - Pure (or side-effect minimal) in normal execution.
  - Suitable for use in environments where console output is tightly controlled (CI, IDE integrations, language servers, etc.).
  - Testable without requiring suppression or mocking of the console.

If a rule or validation component must report an exceptional condition, it should do so by:

- Returning structured error objects, diagnostics, or result codes to the caller.
- Throwing well-typed errors (where appropriate) that are handled and surfaced at higher layers (e.g., CLI, plugin bootstrap), which then decide whether to log via `console.error`/`console.warn`.

### 3. Optional: Debug logging behind an explicit, documented debug flag

Debug logging inside rule logic or validation paths is allowed **only** when all of the following conditions are met:

1. **Explicit opt-in flag**
   - There is a documented configuration option or environment variable (e.g., `MY_TOOL_DEBUG=true`, `--debug-rules`) that clearly indicates the user is opting into verbose debug output.

2. **Single, centralized control**
   - Debug logging behavior is routed through a small, centralized abstraction (e.g., `debugLogger.debug(...)`) that:
     - Checks the flag.
     - Decides whether to call `console.debug`/`console.info` (or similar).
   - Rule and validation code must not call `console.*` directly; they call the abstraction instead.

3. **Documented behavior**
   - The debug option is documented in:
     - User-facing CLI help (e.g., `--help` output) and/or
     - Project documentation / README.
   - The documentation explains:
     - How to enable it.
     - What kind of additional output to expect.
     - That it is intended for development/troubleshooting, not regular operation.

4. **No change to functional semantics**
   - Enabling or disabling debug logging must not alter:
     - Rule evaluation semantics.
     - Validation results.
     - Exit codes.
     - Data returned from public APIs.
   - Only side-effect should be additional console output.

If these requirements cannot be satisfied, then debug logging must **not** be added to core rule or validation logic.

### 4. Current state of the codebase

As of this ADR:

- The **current codebase has no debug logging** (`console.debug`/`console.info`/`console.log`) inside:
  - Rule implementations.
  - Core validation logic.
  - Normal runtime evaluation paths.

Existing console usage is limited to acceptable locations (e.g., CLI helpers, CI scripts, bootstrap code), or will be refactored to conform to this ADR as needed.

### 5. Requirements for future changes

Any future additions or modifications must follow these rules:

1. **New CLI or CI helper behavior**
   - May use `console.error` and `console.warn` to report user-/operator-facing issues.
   - Must keep messages focused and actionable.

2. **New plugin/bootstrap code**
   - May use `console.error` and `console.warn` to report misconfiguration, deprecation, or failure to initialize.
   - Must not emit continuous noisy logs during normal operation.

3. **New rule or validation logic**
   - Must **not** introduce direct `console.*` calls.
   - Any need for surfaced messages must be handled via return values, errors, or diagnostics passed upward.

4. **New debug-logging needs**
   - Must implement or reuse a centrally controlled debug abstraction, gated behind a documented flag (see §3).
   - Must keep debug logging off by default.
   - Must ensure tests remain stable regardless of debug flag state (except tests explicitly verifying debug behavior).

5. **Code review expectations**
   - Any use of `console.*` in PRs must be reviewed against this ADR.
   - Reviewers should:
     - Confirm that console usage is in an allowed layer (CLI/CI/helper/bootstrap) or behind a proper debug abstraction.
     - Request refactoring if console usage appears in rule logic or runtime validation not gated as per §3.

## Consequences

- **Positive**
  - Clear separation between user-visible errors/warnings and internal debugging.
  - Cleaner CI logs and more predictable tool integration behavior.
  - Easier testing and reasoning about core logic, without noise from incidental console output.
  - A consistent, documented approach to opt-in debug logging.

- **Negative / Trade-offs**
  - Slightly more effort to add debug logging, due to the need for a central abstraction and debug flag.
  - Contributors must understand and respect the separation between CLI/bootstrapping and core logic.

## Alternatives Considered

- **Allow unrestricted `console.*` usage everywhere**
  - Rejected: leads to noisy logs, poor embeddability, and harder testing.

- **Disallow `console.*` entirely**
  - Rejected: unhelpful for CLI/CI/bootstrapping components, where direct console output is appropriate and expected.

- **Use a third-party logging framework everywhere**
  - Rejected for now: adds dependency and complexity; current needs are satisfied by disciplined use of console and an optional light abstraction for debug logging.

## Notes

This ADR governs only JavaScript/TypeScript-style `console.*` usage. Other languages or runtimes used in this project should follow analogous principles (i.e., restrict incidental stdout/stderr usage in core logic; allow explicit logging in top-level tooling and bootstrap code; gate debug logging behind an explicit debug configuration).