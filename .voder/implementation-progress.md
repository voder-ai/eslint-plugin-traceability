# Implementation Progress Assessment

**Generated:** 2025-12-18T15:10:48.464Z

![Progress Chart](./progress-chart.png)

Projection: flat (no recent upward trend)

## IMPLEMENTATION STATUS: INCOMPLETE (93.6% ± 18% COMPLETE)

## OVERALL ASSESSMENT
Overall implementation quality is very high but not yet at the required completion threshold. Testing, execution, and dependency health are excellent, with comprehensive Jest coverage, strict CI-equivalent local checks, and clean, mature dependencies. Functionality is strong, with 21 of 22 stories passing traceability-based validation and Story 028.0 partially implemented (inside-brace placement currently enforced only for simple if blocks). Code quality, documentation, security, and version control are well above acceptable baselines but score slightly below the global 95% bar due to a few known, non-critical gaps: stricter ESLint thresholds occasionally driving targeted refactors, one incomplete story with open NEXT items, a README link that targets internal docs not shipped in the npm package, and minor opportunities to refine historical incident docs and observability for rare error paths. With these remaining items addressed—especially completing Story 028.0’s inside-placement semantics across all branch types and aligning user-facing docs—the project should reach full completion status.



## CODE_QUALITY ASSESSMENT (92% ± 19% COMPLETE)
- Code quality in this project is excellent. Linting, formatting, type-checking, duplication checks, and CI/CD quality gates are all well-configured, automated, and currently passing. Complexity and size limits are stricter than typical defaults and supported by explicit ratcheting ADRs. The only notable issues are a single un-justified @ts-ignore in tests, some small pockets of duplication (mostly tests, a bit in helper code), and minor divergence between current ESLint thresholds and the ratcheting documentation.
- Linting is robust and passing: `npm run lint -- --max-warnings=0` succeeds using ESLint 9 flat config (`eslint.config.js`) with `js.configs.recommended` and additional project-specific rules. Complexity (max 16), function length (max 45 lines), file length (max 450 lines), magic numbers, max-params (4), and security rules (`no-eval`, `no-implied-eval`, `no-new-func`, `no-new-wrappers`) are all enforced for source files.
- Formatting is consistent and enforced: Prettier is configured via `.prettierrc` and validated with `npm run format:check` (passes). Pre-commit runs `lint-staged`, which applies `prettier --write` and `eslint --fix` on staged files, ensuring consistent style before commits.
- Type-checking is strict and passing: `tsconfig.json` enables `strict: true` and includes both `src` and `tests`. `npm run type-check` (`tsc --noEmit`) completes with no errors, confirming sound typing across the codebase.
- Complexity and size constraints are strong: ESLint rules enforce `complexity: { max: 16 }`, `max-lines-per-function: 45`, `max-lines: 450`, and `max-params: 4`. Because lint passes, no function or file exceeds these limits. These thresholds are stricter than ESLint defaults and align with documented ratcheting plans, providing good maintainability guarantees.
- Duplication is low and monitored: `npm run duplication` (jscpd with a strict 3% threshold) passes. Overall duplicated lines are 2.92% and duplicated tokens 4.34% across 104 TS files. Most clones are in tests (perf and complex analyzer tests); a few small clones exist in production helpers (`require-story-visitors.ts`, `require-story-core.ts`) but are limited in scope.
- Disabled quality checks are essentially absent: searches for `eslint-disable`, `@ts-nocheck`, and `@ts-ignore` in `src`, `tests`, and `scripts` show no file-level disables and exactly one real `@ts-ignore` in `tests/maintenance/detect-isolated.test.ts`. There is a dedicated script (`scripts/report-eslint-suppressions.js`) that scans for suppressions and outputs a markdown report, demonstrating active monitoring.
- Production code is clean of test-only concerns: `grep -R -n jest src` finds no references, and imports of test frameworks are limited to `tests/`. Production modules (e.g., `src/maintenance/cli.ts`, `src/rules/helpers/*`) focus on plugin and CLI logic, with clear responsibilities and no test logic mixed in.
- Tooling and scripts follow strong conventions: All dev workflows are centralized in `package.json` scripts (lint, format, type-check, duplication, traceability, audits, security, etc.). Scripts in `scripts/` are non-empty and meaningful, enforced by `scripts/validate-scripts-nonempty.js`. There are no orphaned or placeholder scripts.
- Git hooks and CI/CD are well designed: `.husky/pre-commit` runs `lint-staged` (fast, staged-only checks). `.husky/pre-push` runs `npm run ci-verify:full` plus `npm run security:secrets`, mirroring CI quality gates per ADR. `.github/workflows/ci-cd.yml` defines a single unified pipeline that runs full quality checks and then semantic-release-based publishing on pushes to `main`, followed by a smoke test script against the published version.
- No AI slop or temp artefacts detected: The repository has meaningful comments tied to stories/requirements, no placeholder content, and `find` shows no `.tmp`, `.bak`, `.patch`, `.diff`, or editor backup files. Tests are numerous and behavior-focused (55 suites, 485 tests), not trivial "does not crash" checks.
- Documentation and decisions support quality: Multiple ADRs (e.g., `code-quality-ratcheting-plan.md`, `003-code-quality-ratcheting-plan.md`, `009-security-focused-lint-rules.accepted.md`) explicitly describe ratcheting strategies, security linting, and CI parity. These are largely implemented in the current ESLint config and CI workflow, though the ADRs are slightly behind the current stricter thresholds.

**Next Steps:**
- Remove or refine the lone `@ts-ignore` in `tests/maintenance/detect-isolated.test.ts`: ideally refactor the test so it type-checks without suppression. If a suppression is truly necessary, replace with `@ts-expect-error` plus a short justification comment (and optional ADR reference) so `scripts/report-eslint-suppressions.js` doesn’t flag it as un-justified debt.
- Refactor small duplicated blocks in production helpers identified by jscpd: specifically the clones in `src/rules/helpers/require-story-visitors.ts` and `src/rules/helpers/require-story-core.ts`. Extract shared logic into small helper functions within those modules to remove duplication while staying within existing complexity and size limits.
- Update ratcheting ADRs to match the current ESLint thresholds: adjust `docs/decisions/003-code-quality-ratcheting-plan.md` and `docs/decisions/code-quality-ratcheting-plan.md` so the documented sprint milestones reflect that complexity is at 16 and max-lines-per-function at 45. Clarify the remaining step where explicit overrides will eventually be removed in favor of ESLint defaults.
- (Optional) Promote suppression reporting into CI: once the existing `@ts-ignore` is either removed or properly justified, add a CI step (or extend `ci-verify:full`) to run `node scripts/report-eslint-suppressions.js` and fail on exit code 2. This will prevent new un-justified `eslint-disable` or TypeScript suppressions from entering the codebase.
- (Optional) Re-enable the plugin’s own traceability rule for this repo: uncomment the `traceability/valid-annotation-format` rule in `eslint.config.js` (behind the `plugin.rules` guard) and follow the incremental enable-with-suppressions-then-cleanup pattern. This would ensure your own annotations are linted by the plugin in the same way consumers’ code is.

## TESTING ASSESSMENT (96% ± 18% COMPLETE)
- Testing for this project is excellent. Jest + ts-jest are configured correctly, all 55 suites (485 tests) pass in non‑interactive mode, coverage is very high and above strict thresholds, tests are isolated and use OS temp directories safely, and there is strong story/requirement traceability. Only a few minor branch-coverage gaps and some complex perf tests keep this from a perfect score.
- Test framework and configuration:
- Uses Jest with ts-jest as the established test framework.
  - package.json → "test": "jest --ci --bail" (non‑interactive, CI‑friendly).
  - jest.config.js: preset "ts-jest", coverageProvider "v8", Node test environment, testMatch "tests/**/*.test.ts".
  - Global coverageThreshold: branches 80, functions 90, lines 90, statements 90.
- No bespoke or ad‑hoc framework; everything runs through Jest.

Test execution and pass rate (absolute requirement):
- `npm test -- --runInBand`:
  - All 55 test suites and 485 tests passed; 0 failures.
  - Jest invoked as `jest --ci --bail --runInBand` → no watch/interactive mode.
- `npm test -- --coverage --runInBand`:
  - Also passed with coverage enabled.
  - Confirms the suite is stable in both standard and coverage modes.

Coverage levels and thresholds:
- Coverage summary from `npm test -- --coverage --runInBand`:
  - All files: Statements 97.04%, Branches 86.79%, Functions 99.69%, Lines 97.04%.
  - Exceeds jest.config.js global thresholds (branches ≥80%, others ≥90%).
- Core logic (rules, helpers, utils) is very well covered:
  - src/rules/** and src/rules/helpers/** are generally ≥95% statements and ≥80% branches.
  - src/utils/** similarly ≥95% with strong branch coverage.
- A few non‑critical branches (e.g. in src/index.ts and some helper edge paths) are less covered but do not undermine overall adequacy.

Test isolation, filesystem behavior, and cleanliness:
- Tests avoid writing to repository files; all file operations in tests target temp directories under the OS temp root:
  - Shared helper `tests/utils/temp-dir-helpers.ts`:
    - Uses `fs.mkdtempSync(path.join(os.tmpdir(), prefix))` to create unique temp dirs.
    - Provides `cleanup()` using `fs.rmSync(dir, { recursive: true, force: true })`.
  - Maintenance and perf tests (`tests/maintenance/*.test.ts`, `tests/perf/*.test.ts`) similarly call mkdtempSync under os.tmpdir, and clean up via try/finally.
- `grep -R writeFileSync tests` shows writes only to paths derived from temp dirs, not the project root.
- Working directory changes are restored:
  - e.g. `tests/maintenance/cli.test.ts` stores `originalCwd` in beforeAll and restores it in afterAll; each test cleans its own temp dir.
- This fully satisfies the requirements for test isolation, temporary directory usage, and avoiding repo modification.

Non‑interactive behavior:
- `npm test` uses `jest --ci --bail`, which is explicitly non‑interactive.
- Our runs with additional flags (`--runInBand`, `--coverage`) finished cleanly with no prompts or watch mode.

Breadth of test types and behavior coverage:
- Unit tests for ESLint rules (`tests/rules/*.test.ts`):
  - Use `RuleTester` and shared utilities to assert on messages, suggestions, and auto-fix output.
  - Cover function annotations, branch annotations, valid/invalid references, redundant annotations, and test-traceability rules.
- Helper and utility tests (`tests/utils/*.test.ts`):
  - Cover annotation parsing, branch helper behavior, TS-specific detection, and req-detection heuristics.
- Integration tests (`tests/integration/*.test.ts`):
  - `cli-integration.test.ts` spawns the real ESLint CLI, asserting rule enforcement and exit codes.
  - Prettier/else-if/annotation placement integration tests exercise interactions across tools.
- Maintenance and CLI tests (`tests/maintenance/*.test.ts`, `tests/config/*.test.ts`):
  - Validate maintenance commands: detect, report, verify, update.
  - Cover JSON/text outputs, exit codes, invalid options, dry-run semantics, missing roots, and permission errors.
- Performance/stress tests (`tests/perf/*.test.ts`):
  - Create large synthetic workspaces and large nested-branch sources.
  - Use `performance.now()` with generous 5s budgets, asserting both that work completes in time and that outputs (diagnostics, reports, stale lists) make sense.

Error handling and edge-case testing:
- Maintenance CLI tests cover:
  - No stale annotations → exit 0 with “No stale @story annotations found.”
  - Stale annotations present → non‑zero exit, clear guidance to run detect/report.
  - Invalid `--format` → exit 2, detailed error about allowed formats.
  - `update` without required flags → exit 2 with usage/help messaging.
  - `--dry-run` semantics → no file changes.
  - Permission errors simulated by mocking `fs.statSync` to throw EACCES → exit 2 with a prefixed error message.
- Rule tests cover many edge cases:
  - Various function forms (declarations, expressions, methods, TS declarations/method signatures, named/anonymous arrows).
  - Nested functions and nested branches, switches with grouped fallthrough, try/catch/finally blocks, and complex annotation placement configs.
- Config validation tests (`tests/config/eslint-config-validation.test.ts`, `flat-config-presets-integration.test.ts`) ensure invalid options trigger schema errors and flat configs wire rules correctly.

Test structure and readability:
- Descriptive test names clearly express behavior:
  - Examples: "[REQ-SWITCH-FALLTHROUGH] intermediate fall-through case should not be the only annotated case", "[REQ-MAINT-VERIFY] verify exits with code 1 and prints guidance when annotations are stale or invalid".
- Tests follow a clear Arrange–Act–Assert pattern without excessive logic:
  - Setup temp dir / RuleTester config → run rule/CLI → assert on output/exit/status.
  - Loops and conditionals in tests are limited to data generation in perf helpers, not core assertions.
- File names match the functionality under test (e.g., `require-branch-annotation.test.ts` tests the `require-branch-annotation` rule). "branch" appears only in branch-related features, not as coverage jargon.
- Each test generally focuses on a single behavior or closely related set of expectations.

Behavior-focused, decoupled tests:
- Rule tests assert on observable outcomes: reported messages, suggestion descriptions, and auto-fix outputs, not on private helpers.
- CLI tests work via public interfaces (binary or exported functions like `runMaintenanceCli`), not internal internals.
- This makes the tests robust against internal refactoring as long as visible behavior is preserved.

Test independence and determinism:
- Each test sets up its own data and does not depend on previous tests:
  - Temp dirs are uniquely prefixed and cleaned up.
  - Any change to process env (`NODE_PATH`) or cwd is reversed in afterAll/finally.
- No randomness without control; perf budgets are generous and based on operations that are CPU/IO-bounded but predictable.
- Running the suite multiple times (with and without coverage, with `--runInBand`) produced consistent all‑pass results, suggesting non‑flaky tests.

Use of test doubles:
- Limited, targeted mocking via `jest.spyOn`:
  - `console.log`/`console.error` to capture output and keep test logs clean.
  - `fs.statSync` in one test to simulate permission errors.
- No heavy mocking of third‑party libraries; `eslint` itself is exercised directly in many tests.
- This supports behavior‑focused testing without over‑mocking.

Test data builders and helpers:
- Reusable utilities simplify complex test setups:
  - `runAnnotationCheckerTests` in `tests/utils/annotation-checker.test.ts` centralizes TS RuleTester setups for TS declarations.
  - `ts-language-options` helpers (imported across rule tests) provide consistent parserOptions for TS cases.
  - `createTempDir` standardizes temp directory creation/cleanup.
- These act as lightweight test data/environment builders and improve clarity and maintainability.

Traceability in tests (critical requirement):
- Test files consistently include traceability annotations:
  - File-level `@supports` and/or `@story`+`@req` JSDoc headers referencing specific story markdown and requirement IDs.
  - Describe blocks include story identifiers, e.g., `"(Story 003.0-DEV-FUNCTION-ANNOTATIONS)"`.
  - Individual tests are prefixed with `[REQ-...]` identifiers tied to those story requirements.
- Example: `tests/rules/require-test-traceability.test.ts` maps to stories 020.0 and 021.0 via `@supports` and encodes REQ IDs in names, directly validating the test‑traceability rule.
- This ensures excellent requirement‑to‑test traceability and aligns strongly with the project’s traceability mandate.

Minor gaps / reasons not to score 100:
- Some branch coverage remains lower in non‑critical areas (e.g., src/index.ts and select helper branches) despite overall high coverage.
- Perf tests, while deterministic and generous in budgets, inherently depend on timing assumptions; though they appear robust now, they introduce a slight theoretical risk of flakiness on extremely slow environments.
- One CLI error-handling test contains comments referring to a more elaborate simulation than is currently implemented, though the actual assertions still verify meaningful behavior and pass.

**Next Steps:**
- Add a few targeted tests to raise branch coverage in the remaining hotspots (e.g., specific conditional branches in src/index.ts and selected helper functions listed in the coverage report) so that branch coverage approaches or exceeds 90% everywhere, not just globally.
- For performance tests, keep the generous 5s budgets but consider clearly tagging or documenting them as perf/stress tests in Jest configuration, so they can be run separately if needed without changing behavior, and to make their role explicit to contributors.
- Clarify and, if desired, refine `tests/cli-error-handling.test.ts`: either tighten the comments to reflect the current behavior under test or extend the setup to explicitly simulate the originally intended missing‑module scenario via a controlled temp copy of the plugin or config; this would align implementation, comments, and expectations more closely.
- As new features are added, follow existing patterns: ESLint rules tested via RuleTester with explicit valid/invalid cases and auto-fix outputs; CLI and maintenance functionality tested through OS tempdirs and `runMaintenanceCli`; and ensure each new test file includes proper `@supports` annotations plus `[REQ-...]`-prefixed test names tied to the relevant stories.

## EXECUTION ASSESSMENT (96% ± 18% COMPLETE)
- Execution quality is excellent. The TypeScript build, Jest tests, linting, formatting, duplication checks, and custom CI-style verification all pass locally. The ESLint plugin and its `traceability-maint` CLI are thoroughly validated at runtime via integration, performance, and smoke tests (including pack-and-install in a fresh project). Runtime behavior, input validation, and error handling are robust, with only minor room for improved observability of swallowed errors.
- Build process is solid and reproducible:
- `npm run build` (tsc -p tsconfig.json) succeeds with no errors.
- `npm run type-check` (tsc --noEmit) passes, confirming type soundness without emitting code.
- Packaging and consumability are validated by `npm run smoke-test`, which:
  - Packs the plugin into a tarball
  - Initializes a fresh npm project in a temp dir
  - Installs the tarball
  - Loads the plugin and runs the `traceability-maint` CLI (both success and error paths)
  - Cleans up the temp directory.

- Local execution environment and quality checks are well-supported:
- `npm test -- --runInBand` runs Jest with `--ci --bail` and passes:
  - 55 test suites, 485 tests, 0 failures.
  - Coverage spans integration (`tests/integration`), rules (`tests/rules`), maintenance tools (`tests/maintenance`), configuration (`tests/config`), perf (`tests/perf`), and utilities (`tests/utils`).
- `npm run lint` (ESLint 9 with `eslint.config.js`, `--max-warnings=0`) passes over `src` and `tests`.
- `npm run format:check` (Prettier) passes for `src/**/*.ts` and `tests/**/*.ts`.
- `npm run ci-verify:fast` passes, chaining:
  - `type-check` → `check:traceability` (runtime story/requirement validation) → `duplication` (jscpd) → focused Jest (`tests/(rules|maintenance)`).
- Application runtime behavior (plugin and CLI) is well-exercised:
- Maintenance CLI `traceability-maint` (`src/maintenance/cli.ts`):
  - Supports `detect`, `verify`, `report`, `update` subcommands.
  - Handles `-h/--help` and no-command cases by printing detailed usage and exiting with success.
  - Handles unknown commands with clear error messages plus help, returning usage exit code.
  - Wraps command dispatch in try/catch, logging `traceability-maint failed: ...` and returning a non-zero exit on unexpected errors.
  - Behavior is validated by unit (`tests/maintenance/cli.test.ts`), integration (`tests/integration/cli-integration.test.ts`), and smoke tests.
- Maintenance functions:
  - `detectStaleAnnotations` (`src/maintenance/detect.ts`):
    - Validates workspace root existence/type.
    - Scans files once, reads each file once, uses regex to find `@story` annotations.
    - Uses `isUnsafeStoryPath` and `enforceProjectBoundary` to reject traversal/absolute-unsafe or out-of-project paths before filesystem checks.
    - Returns deduplicated list of stale paths.
    - Validated by `tests/maintenance/detect*.test.ts` and large-workspace perf tests.
  - `updateAnnotationReferences` (`src/maintenance/update.ts`):
    - Validates codebase path; returns 0 if invalid.
    - Escapes `oldPath` safely into regex; replaces references and writes only changed files.
    - Returns the count of updated annotations.
    - Validated by `tests/maintenance/update*.test.ts` and perf tests.
  - Batch and report operations are exercised via `tests/maintenance/*` and perf tests, ensuring correct behavior for `verifyAnnotations`, `batchUpdateAnnotations`, and `generateMaintenanceReport`.
- Input validation and error handling are robust:
- CLI:
  - Argument parsing (`normalizeCliArgs`) enforces known subcommands and options; unknown commands are rejected with clear diagnostics and non-zero exit codes.
  - Help output describes commands and options explicitly, aiding correct usage.
- Maintenance utilities:
  - Validate paths (existence and directory type) before scanning or writing.
  - Use `isUnsafeStoryPath` and `enforceProjectBoundary` to prevent path traversal or cross-project lookups.
  - IO and boundary-check errors are handled defensively:
    - File read failures and boundary enforcement exceptions are caught and treated as safe skips, preventing crashes.
- ESLint plugin rules:
  - Rule behavior and error reporting across many edge cases are tested in `tests/rules/*`, ensuring invalid annotations result in surfaced lint errors rather than silent failures.
- Performance and resource management are explicitly tested and appropriate:
- No databases or network calls; work is CPU + filesystem based.
- Algorithms avoid pathological N+1 patterns:
  - `detectStaleAnnotations` performs a single traversal of files; each `@story` triggers a bounded number of checks (at most a couple of candidate paths).
  - `updateAnnotationReferences` performs at most one read and one conditional write per file.
- Performance tests:
  - `tests/perf/maintenance-large-workspace.test.ts` creates a synthetic large workspace (10 modules × 50 files each, with mixed valid/stale stories) and verifies:
    - `detectStaleAnnotations` finds stale entries and completes under a 5s budget.
    - `verifyAnnotations` and `generateMaintenanceReport` complete under the same budget while returning sensible results.
    - `updateAnnotationReferences` and `batchUpdateAnnotations` both update entries and remain well under the budget.
  - Additional perf tests for rules and CLI (`tests/perf/*`) ensure plugin usage remains tractable on large inputs.
- Resource cleanup is carefully handled:
  - Perf tests and smoke test create temp directories via `fs.mkdtempSync` and always clean them up using `fs.rmSync(..., { recursive: true, force: true })` inside `finally` blocks.
  - No long-lived event listeners, sockets, or DB connections to leak; CLI runs to completion and exits.
- jscpd duplication report shows modest duplication (<5% tokens) and exits successfully, used as a guardrail without breaking execution.
- End-to-end workflows are well validated locally:
- Plugin integration:
  - `tests/config/eslint-config-validation.test.ts` and `tests/config/flat-config-presets-integration.test.ts` validate that the plugin works with realistic ESLint configuration setups.
  - `tests/plugin-*.test.ts` verify plugin setup, default export, configs, and error paths.
- CLI workflows:
  - `tests/integration/cli-integration.test.ts` runs the real CLI commands on fixture projects, asserting exit codes and output.
  - `tests/integration/*` validate rule behavior when used via ESLint in realistic scenarios.
- Traceability checks:
  - `npm run check:traceability` runs `scripts/traceability-check.js`, validating story/requirement annotations at runtime and generating `scripts/traceability-report.md`.
  - Extensive `@story` and `@supports` annotations in core maintenance files (e.g., `cli.ts`, `detect.ts`, `update.ts`) tie runtime behavior directly to documented requirements, and tests reference those requirements explicitly.

- Minor weaknesses / improvement areas:
- Certain IO and boundary enforcement errors in maintenance utilities are intentionally swallowed to keep scanning resilient; this is safe but reduces visibility into which files or paths were skipped. Adding optional debug logging (e.g., behind an env flag) could improve diagnosability without affecting default behavior.
- While CLI behavior is well-tested, user-facing documentation could more explicitly describe exit-code semantics and typical CI usage patterns for `traceability-maint`, further aligning runtime behavior with user expectations.

**Next Steps:**
- Introduce optional debug-level logging for swallowed errors in maintenance helpers (e.g., in `processFileForStaleAnnotations` and `getInProjectCandidates`), controlled by an environment variable like `TRACEABILITY_DEBUG`, so advanced users can see which files or paths were skipped without altering default safe behavior.
- Expand user-facing documentation (e.g., in `README.md` or `user-docs/`) with a short section on `traceability-maint` CLI runtime behavior: commands, options, exit codes, and example CI integrations that rely on those exit codes.
- Optionally add a focused integration test for CLI JSON output (where supported) that runs `traceability-maint` with `--json` and asserts on the JSON schema, further hardening machine-consumable runtime contracts.
- As the codebase evolves, periodically extend the synthetic large-workspace tests (e.g., more files or modules) to ensure performance remains within acceptable bounds and to catch regressions early.

## DOCUMENTATION ASSESSMENT (88% ± 17% COMPLETE)
- User-facing documentation for this project is comprehensive, accurate, and closely aligned with the implemented functionality. The only significant issue is a README link into internal `docs/` that is not shipped in the npm package, which violates the separation and link-integrity rules. License declarations and traceability-related docs are exemplary.
- User-facing documentation structure is clear and correctly separated from project docs:
- Root user docs: `README.md`, `CHANGELOG.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`.
- Additional user docs under `user-docs/` (api-reference, examples, migration guide, ESLint 9 setup, traceability overview).
- Internal, development docs live under `docs/` and are not included in `package.json` `files`, so they are not shipped in the npm package, satisfying the project-docs separation requirement.
- README attribution requirement is fully met:
- `README.md` has a dedicated `## Attribution` section with the exact text `Created autonomously by [voder.ai](https://voder.ai).`
- Feature/requirements documentation matches implementation:
- All rules described in README and `user-docs/api-reference.md` (`require-traceability`, `require-story-annotation`, `require-req-annotation`, `require-branch-annotation`, `valid-annotation-format`, `valid-story-reference`, `valid-req-reference`, `require-test-traceability`, `no-redundant-annotation`, `prefer-supports-annotation`/`prefer-implements-annotation`) have corresponding implementations under `src/rules/`.
- Behavior documented for `require-traceability` (composing story/req rules) matches `src/rules/require-traceability.ts`.
- Behavior and options for `valid-story-reference` (default story directories, extension rules, project-boundary checks) match `src/rules/valid-story-reference.ts`.
- Maintenance API and CLI functions documented in `user-docs/api-reference.md` (`detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport` and `traceability-maint` commands) correspond to actual code in `src/maintenance/*.ts` and are exercised by tests in `tests/maintenance/cli.test.ts` in exactly the ways described.
- Technical setup and usage documentation is accurate and complete:
- README and `user-docs/eslint-9-setup-guide.md` give correct ESLint v9 flat-config guidance and show working `eslint.config.js` snippets using `import traceability from "eslint-plugin-traceability";` and `...traceability.configs.recommended/strict`, which matches the plugin’s default export (`src/index.ts`).
- README and `CONTRIBUTING.md` document npm scripts (`test`, `lint`, `format:check`, `duplication`, `ci-verify`, `ci-verify:fast`, `ci-verify:full`) that all exist in `package.json` with matching names and roles.
- Node and ESLint version requirements in docs align with `package.json` (`engines.node` and `peerDependencies.eslint`).
- Decision and versioning documentation is consistent with the configured release strategy:
- `.releaserc.json` configures semantic-release for branch `main` with changelog, npm, and GitHub plugins.
- `CHANGELOG.md` clearly states that semantic-release is used and that users should consult GitHub Releases for current versions, while preserving a historical manual changelog.
- README repeats the semantic-release strategy and links to GitHub Releases as the authoritative source of version info.
- `package.json` version `1.0.5` matches the last historical entry in `CHANGELOG.md`, which is acceptable because semantic-release intentionally decouples the runtime version from this field; documentation correctly explains this, so there’s no stale-version inconsistency.
- Link formatting and publication are almost perfect but have one high-impact issue:
- All user-facing documentation references other published user-facing docs using proper Markdown links (e.g. `[ESLint v9 Setup Guide](user-docs/eslint-9-setup-guide.md)`, `[API Reference](user-docs/api-reference.md)`, `[Examples](user-docs/examples.md)`, `[SECURITY.md](SECURITY.md)`, `[CHANGELOG.md](CHANGELOG.md)`).
- `package.json` `files` ensures all linked user docs are shipped with the npm package: `README.md`, `LICENSE`, `SECURITY.md`, `CHANGELOG.md`, and the entire `user-docs/` directory.
- Code references (filenames like `eslint.config.js`, commands like `npm run lint`, and test file names) are correctly formatted as code spans with backticks instead of Markdown links.
- **Violation:** `README.md` contains `[Verification Workflow Guide](docs/verification-workflow-guide.md)`, which points into the internal `docs/` tree. `docs/` is not included in `files`, so this link is broken in the published npm package and also breaches the rule that user-facing docs must not link to internal project docs (`docs/`, `prompts/`, `.voder/`). This is the main reason the score is not higher.
- License consistency is excellent:
- `package.json` uses the SPDX-compliant identifier `"MIT"`.
- The root `LICENSE` file contains the standard MIT license text and names `voder.ai` as the copyright holder.
- There is only one `package.json` and one LICENSE file; no conflicting license files or differing license declarations exist, so license information is unambiguous and consistent across the project.
- User-facing API documentation quality is high:
- `user-docs/api-reference.md` documents each ESLint rule and the maintenance API with:
  - Clear descriptions of purpose and behavior.
  - Parameters, options (names, allowed values, defaults), and default severities.
  - Runnable configuration examples and code snippets for annotations (`@supports`, `@story`, `@req`).
- `user-docs/examples.md` provides concrete, runnable examples for:
  - Flat ESLint configs (recommended and strict presets).
  - CLI invocation with and without configs.
  - Test traceability examples matching the `traceability/require-test-traceability` rule.
  - Branch-annotation patterns before and after Prettier formatting.
- `user-docs/migration-guide.md` and `user-docs/traceability-overview.md` give clear guidance on when to use `@supports` vs legacy `@story`/`@req`, and how to migrate, consistent with rule behavior and the codebase.
- Traceability and code-story alignment are documented and implemented coherently:
- README and user docs explain `@supports`, `@story`, and `@req` usage and how they relate to the rules.
- Code samples in docs mirror real patterns in the code (e.g. `@supports docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md REQ-ANNOTATION-REQUIRED ...`).
- Source files (`src/index.ts`, `src/maintenance/*.ts`, `src/rules/helpers/*.ts`) show consistent use of `@story`/`@req` and `@supports` annotations on named functions and significant branches, satisfying the required traceability format.
- Tests (e.g. `tests/maintenance/cli.test.ts`) include file-level `@story`/`@supports` and `[REQ-...]` prefixes in test names, exactly as described in the documentation and as enforced by `traceability/require-test-traceability`. This makes the documentation’s traceability guidance demonstrably accurate and current.
- Accessibility and organization of documentation are strong:
- Users can start from `README.md` and quickly find:
  - Installation and minimal setup.
  - Rule overview and canonical configuration patterns.
  - Links to deeper guides in `user-docs/` for configuration, migration, examples, and troubleshooting.
- `SECURITY.md` clearly targets end users, explicitly notes that deeper security details live in internal docs, and exposes a clear vulnerability reporting process.
- `CONTRIBUTING.md` explains the CI/CD and semantic-release workflow, mapping well to the scripts and configuration in the repo, without leaking internal-only file paths into user-focused areas. Overall, the docs are easy to navigate and understand for both users and contributors.

**Next Steps:**
- Fix the README link that points into internal project documentation:
- Replace `[Verification Workflow Guide](docs/verification-workflow-guide.md)` with a link to a user-facing doc that is shipped in the npm package, for example:
  - Create `user-docs/verification-workflow.md` by adapting the existing internal guide for end users, add it to the repo (no change needed to `files` since `user-docs` is already published), and update the README link to `user-docs/verification-workflow.md`; or
  - Change the link to an external URL (e.g., a hosted documentation site) that is intended for end users.
- Ensure there are no remaining user-facing links into `docs/`, `prompts/`, or `.voder/`.
- Do a quick grep-based sweep to confirm there are no other user-facing references to internal docs:
- Search `README.md` and `user-docs/` for patterns like `](docs/`, ` docs/`, `prompts/`, or `.voder/`.
- For any hits that represent guidance for end users, either:
  - Move the referenced content into `user-docs/` and link there; or
  - Rephrase them to describe *consumer project* structures (e.g., “your project’s `docs/stories/` directory”) rather than this plugin’s own `docs/`.
- Current evidence suggests only the single README link is problematic; this step is to validate and keep the state clean.
- (Optional) Tweak README wording for Node version support for perfect clarity:
- Consider changing the prerequisites line to something like: `Node.js 18.18.x+, 20.x, 22.x, or 24.x+ and ESLint v9+` to better mirror `"engines": { "node": "^18.18.0 || ^20.0.0 || ^22.0.0 || >=24.0.0" }`.
- This is not strictly required (current wording is not misleading in practice), but it would make the documentation and `package.json` constraints visually aligned.
- (Optional) Add a short "Documentation" or "Further Reading" section near the top or bottom of README that consolidates links to:
- `user-docs/traceability-overview.md` – conceptual overview and FAQ.
- `user-docs/api-reference.md` – detailed rule and maintenance API documentation.
- `user-docs/examples.md` – runnable configuration and code examples.
- `user-docs/migration-guide.md` – 0.x → 1.x migration guide.
- `user-docs/eslint-9-setup-guide.md` – ESLint 9 flat-config setup.
This doesn’t change content, but it makes the documentation entry points more discoverable for end users.

## DEPENDENCIES ASSESSMENT (98% ± 19% COMPLETE)
- Dependencies are in excellent condition: everything installs cleanly, there are no security or deprecation issues reported, the lockfile is correctly tracked in git, and `dry-aged-deps` confirms there are currently no safe, mature updates to apply. Tooling is modern and coherent, and tests pass against the current dependency set.
- `npx dry-aged-deps --format=xml` shows 7 outdated packages but **all** have `<filtered>true</filtered>` (filtered by age), and the summary reports `<safe-updates>0</safe-updates>`, meaning there are **no safe, mature upgrades** available and no action is required under the maturity policy.
- Outdated-but-filtered packages are: `@eslint/js` (9.39.1 → 9.39.2, age 5 days), `@semantic-release/npm` (13.1.2 → 13.1.3, age 5), `@types/node` (24.10.1 → 25.0.3, age 1), `@typescript-eslint/parser` (8.46.4 → 8.50.0, age 2), `@typescript-eslint/utils` (8.46.4 → 8.50.0, age 2), `dry-aged-deps` (2.3.1 → 2.5.1, age 3), and `eslint` (9.39.1 → 9.39.2, age 5). None are eligible for upgrade yet because they haven’t passed the 7‑day threshold.
- `npm install` completes successfully with no `npm WARN deprecated` messages and reports `found 0 vulnerabilities`, confirming that the dependency set is installable, non-deprecated, and free of known vulnerabilities.
- `npm audit` exits with code 0 and also reports `found 0 vulnerabilities`, reinforcing that there are no current security advisories affecting the in-use dependency tree.
- `package-lock.json` exists and `git ls-files package-lock.json` returns the filename, verifying that the lockfile is **committed to git** for reproducible installs (a key best practice).
- `npm ls` exits with code 0 and lists a consistent set of dev dependencies (ESLint 9, TypeScript 5.9, Jest 30, Prettier 3, semantic-release 25, Husky 9, Secretlint, dry-aged-deps, etc.) with no unmet peer dependencies or tree errors, indicating a healthy and compatible dependency graph.
- `peerDependencies` specify `eslint@^9.0.0` while `devDependencies` use `eslint@9.39.1`, which is within that range and appropriate for an ESLint plugin, avoiding version conflicts with consuming projects.
- The `overrides` section in `package.json` forces patched versions of important transitive packages (`glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`), demonstrating proactive management of transitive security and compatibility without breaking installs.
- Project scripts centralize dependency health checks (`deps:maturity`, `safety:deps`, `audit:ci`, etc.) and CI scripts (`ci-verify`, `ci-verify:full`) wire these into the quality gates, reflecting mature and automated dependency management.
- `npm test` runs 55 suites and 485 tests with all passing, confirming that the current dependency versions are not only installable but also functionally compatible with the implementation and test suite.

**Next Steps:**
- Do not upgrade any of the currently flagged packages until `dry-aged-deps` reports them with `<filtered>false</filtered>`; once they pass the 7‑day maturity threshold, update so that `current` matches `latest` for each unfiltered package.
- When you next change dependencies (e.g., add tooling or accept new major versions), re-run `npx dry-aged-deps --format=xml` (or `npm run deps:maturity`) and ensure there are still no unfiltered packages with `current < latest` before considering the dependency state optimal.
- Continue to keep `package-lock.json` under version control and run `npm install`, `npm test`, and the CI dependency safety scripts (`ci-verify` or `ci-verify:full`) after any dependency change to confirm there are no new deprecations or security findings.
- Periodically review the `overrides` section when upgrading major dependencies to confirm each override is still necessary; remove individual overrides once upstream packages reliably include secure, patched versions by default, while ensuring `dry-aged-deps` and `npm audit` remain clean after each adjustment.

## SECURITY ASSESSMENT (94% ± 18% COMPLETE)
- Security posture is strong and actively managed. Current dependency scans (prod and dev) are clean for moderate+ vulnerabilities, dependency maturity is enforced via dry-aged-deps, secrets are handled correctly, CI/CD is a single secure pipeline with release gating on security checks, and historical dev-only vulnerabilities are fully remediated and well-documented. Remaining work is minor status/metadata cleanup in historical incident docs, not risk mitigation.
- Dependency security and dry-aged-deps
- Evidence: `npx dry-aged-deps` → "No outdated packages with mature versions found (prod >= 7 days, dev >= 7 days)."
- Evidence: `npm audit --omit=dev --audit-level=high` → `found 0 vulnerabilities`.
- Evidence: `npm audit --include=dev --audit-level=high` → `found 0 vulnerabilities`.
- Evidence: `npm audit --include=dev --audit-level=moderate` → `found 0 vulnerabilities`.
- CI script `scripts/ci-safety-deps.js` runs `npm run deps:maturity -- --format=json` and writes `ci/dry-aged-deps.json` (always exits 0; advisory evidence of maturity/risk).
- CI script `scripts/ci-audit.js` runs `npm audit --json` and writes `ci/npm-audit.json` (always exits 0; advisory snapshot of full tree).
- CI script `scripts/generate-dev-deps-audit.js` runs `npm audit --include=dev --audit-level=high --json` and writes `ci/npm-audit.json` (always 0; dev-only high-severity tracking).
- `package.json` `overrides` enforce safe versions of historically risky transitive deps: `glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`.
- Conclusion: As of this assessment there are **no known vulnerabilities of moderate or higher severity** in either production or dev dependencies, and there are no missing mature upgrades. Fail-fast criteria are not triggered.
- Security incidents and historical vulnerabilities
- Evidence: `docs/security-incidents/` contains detailed historical incident docs:
  - `2025-11-17-glob-cli-incident.md` – glob CLI command injection (GHSA-5j98-mcp5-4vw2, dev-only).
  - `2025-11-18-brace-expansion-redos.md` – brace-expansion ReDoS (GHSA-v6h2-p8h4-qcjw, dev-only).
  - `2025-11-18-bundled-dev-deps-accepted-risk.md` – bundled dev dependencies residual risk (now superseded).
  - `2025-11-18-tar-race-condition.md` – tar race condition (GHSA-29xp-372q-xqph), clearly marked resolved.
  - `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` – comprehensive known-error record for the semantic-release/npm bundled npm/glob/brace-expansion risk.
- That known-error record states the dev toolchain has been upgraded to `semantic-release@25.x` with `@semantic-release/npm@13.1.2` and explicitly notes that both `npm audit --omit=dev --audit-level=high` and `npm audit --include=dev --audit-level=high` now report 0 vulnerabilities and dry-aged-deps shows no outstanding safe updates.
- `docs/security-incidents/dev-deps-high.json` is a preserved `npm audit` snapshot from the incident period, matching the vulnerabilities described in the docs; it is historical evidence, not current state.
- There are **no `*.disputed.md`, `*.proposed.md`, or additional active `*.known-error.md`** records; all noted issues are historical and marked resolved/ superseded.
- Conclusion: Dev-only vulnerabilities around the old semantic-release/npm stack have been fully remediated. Current risk from those packages no longer exists; the files now serve as historical records and demonstrate good incident hygiene.
- Audit filtering for disputed vulnerabilities
- Evidence: No `.nsprc`, `audit-ci.json`, or `audit-resolve.json` are present; audit-related scripts use custom Node wrappers rather than audit filters.
- Evidence: There are **no `*.disputed.md` incident files** under `docs/security-incidents/`.
- Conclusion: Because there are no disputed vulnerabilities, missing audit-filter configuration is acceptable and does not reduce the security score. If disputed incidents are added later, filters will be required then.
- Hardcoded secrets and .env handling
- `.gitignore` correctly ignores `.env`, `.env.local`, `.env.*.local` variants and **explicitly allows** `.env.example`.
- `git ls-files .env` → empty; `.env` is not tracked.
- `git log --all --full-history -- .env` → empty; `.env` has never been committed.
- `.env.example` contains only comments and an optional `DEBUG=eslint-plugin-traceability:*` example, no credentials.
- `npm run security:secrets` (secretlint with `@secretlint/secretlint-rule-preset-recommend`) ran and exited 0 during this assessment, scanning `"**/*"` while ignoring standard generated/binary dirs.
- No evidence of embedded API keys, tokens, or passwords in source or scripts beyond what secretlint would catch.
- Conclusion: Secrets are handled correctly via local `.env` files that are never tracked, and automated secret scanning is enforced. No rotation or remediation is necessary.
- Code security review (runtime behavior, command execution, input surfaces)
- The shipped package is an ESLint plugin plus a small CLI; there is **no database, HTTP server, or browser UI** in the runtime surface.
- SQL injection: no SQL/DB libraries or query-building code appear in `src/`; SQL controls are not applicable for current functionality.
- XSS: no HTML rendering, templating, or HTTP endpoints are implemented, so XSS controls are not applicable.
- `child_process` usage is confined to internal tools under `scripts/` (not the shipped plugin):
  - `scripts/ci-audit.js`, `scripts/ci-safety-deps.js`, `scripts/generate-dev-deps-audit.js` use `spawnSync("npm", [...])` with constant arguments, no `shell: true`.
  - `scripts/lint-plugin-guard.js` uses `spawnSync(process.execPath, [scriptPath, ...])` to run another Node script.
  - `scripts/check-no-tracked-ci-artifacts.js` uses `execFileSync("git", ["ls-files"])` to inspect tracked files.
  - `scripts/cli-debug.js` shells into ESLint via `spawnSync(process.execPath, [eslintCliPath, ...])` with controlled flags.
- `grep` over `src` and `scripts` shows no `eval(` usage and no generic `exec(` calls; dynamic-code or shell-injection risk is minimal.
- Conclusion: For the functionality that actually exists (ESLint plugin + internal scripts), there are no obvious code-level security anti-patterns; potentially dangerous primitives (child_process) are used in controlled, non-user-facing ways.
- Configuration, CI/CD, and deployment security
- CI workflow: `.github/workflows/ci-cd.yml` defines a **single unified pipeline**:
  - Triggers on `push` to `main`, `pull_request` to `main`, and a nightly `schedule` for dependency health.
  - Top-level permissions: `contents: read`; job-level overrides grant `contents/issues/pull-requests/id-token: write` only where needed for releases.
  - `quality-and-deploy` job runs on a Node version matrix (18.18, 20.0, 22.14, 24.0) and performs:
    1. `node scripts/validate-scripts-nonempty.js` (sanity check for scripts).
    2. `npm ci` (locked dependency install).
    3. `npm run ci-verify:full`, which includes:
       - Build & type-check, lint with `--max-warnings=0`, duplicate-code checks, Jest tests with coverage, Prettier format check.
       - `npm run check:traceability` (quality gate).
       - **`npm audit --omit=dev --audit-level=high` as a **gating** production audit (fails CI on any high-severity runtime vulnerability).**
       - Advisory checks: `npm run audit:ci`, `npm run audit:dev-high`, `npm run safety:deps` (they generate artifacts but always exit 0 by design).
    4. `npm run security:secrets` (secretlint) as a separate **gating** step; any secrets found will fail the job.
    5. Upload artifacts: `ci/dry-aged-deps.json`, `ci/npm-audit.json`, and `scripts/traceability-report.md`, plus broader `ci/` artifacts.
    6. On `push` to `main` for Node 22.14.0, and only if all previous gates succeed, run `npx semantic-release` to publish. If `NPM_TOKEN` is missing, invalid, or OTP-gated, the workflow logs the condition, sets `new_release_published=false`, and exits 0 (no publish, but CI stays green).
    7. If a new version was published, run `scripts/smoke-test.sh` to install that specific version into a temp project and run a minimal ESLint invocation as a smoke test.
- Nightly `dependency-health` job (schedule-only): installs deps and runs `npm run audit:dev-high` to continuously track dev-only, high-severity vulnerabilities without publishing.
- Local hooks: `.husky/pre-push` runs `npm run ci-verify:full` and `npm run security:secrets` to mirror CI gating locally.
- CI artifact hygiene: `.gitignore` excludes `ci/` and various report files; `scripts/check-no-tracked-ci-artifacts.js` scans `git ls-files` for tracked `ci/` artifacts (excluding `.voder/ci/`) and fails with exit code 2 if any are present.
- Conclusion: CI/CD aligns with the security policy: one unified pipeline, automatic release on passing `main` builds, clear separation between gating and advisory checks, least-privilege permissions, and automated post-release verification.
- Conflicting dependency automation tools
- No `.github/dependabot.yml` / `.github/dependabot.yaml` found.
- No `renovate.json` or Renovate/Dependabot-related entries in `.github/workflows/ci-cd.yml`.
- Dependency management is handled manually via npm plus `dry-aged-deps` and semantic-release; there are no competing update bots.
- Conclusion: This avoids the operational and security confusion caused by multiple automated updaters, in line with project policy.
- Policy alignment and documentation
- `SECURITY.md` (root) clearly states:
  - How to report vulnerabilities (GitHub Security Advisories).
  - Supported versions (semantic-release; latest release line supported).
  - Guarantee: releases do not ship with known high-severity vulnerabilities in **production** deps at release time, enforced via `npm audit --omit=dev --audit-level=high`.
  - Separation between end-user guarantees and dev-only toolchain risk, with explicit mention of `dry-aged-deps` and the ≥7-day maturity window.
- `docs/security-overview.md` provides a concrete mapping from policy to implementation (which scripts run where, which checks are gating vs advisory, how artifacts are used, and how incidents/ADRs relate to the checks).
- `docs/security-incidents/` and `docs/decisions` together show a disciplined process for detecting, documenting, accepting, and eventually resolving dev-only risks.
- Conclusion: The actual scripts, CI configuration, and dependency state match the documented policy, and the documentation is clear and current aside from minor suffix drift on one historical incident file.

**Next Steps:**
- Normalize the status suffix of the historical semantic-release/npm incident file to reflect its resolved state
- The file `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` now describes a fully remediated historical issue (current audits are clean; toolchain is upgraded).
- Rename it to use a `.resolved.md` suffix and adjust any internal links so that suffix-based classification matches reality while keeping the historical content intact.
- Add a concise maintainer note about when to configure audit filtering for disputed vulnerabilities
- There are currently no `*.disputed.md` incidents, so no filtering is required.
- In `docs/security-overview.md` or `docs/security-incidents/handling-procedure.md`, add a short explicit note: when a vulnerability is documented as `.disputed.md`, maintainers must configure audit filtering (e.g. `.nsprc`, `audit-ci.json`, or `audit-resolve.json`) and route CI’s audit commands through that tool. This improves clarity without changing any current behavior.
- Quickly re-verify secretlint ignore patterns against any newly-added directories
- `npm run security:secrets` currently passes and `.secretlintrc.json` already ignores generated and binary paths.
- As a small housekeeping step, skim `.secretlintrc.json` to ensure any recently introduced directories (if any) are either intentionally ignored or scanned. No issues are indicated now, so this is about keeping the config in sync with project structure.
- Optionally, add a fresh dependency-health note
- `docs/security-incidents/2025-12-03-dependency-health-review.md` (and related docs) describe historical dependency health; current audits and dry-aged-deps output show a fully clean state.
- Optionally record a short, date-stamped note (either updating that review or adding a new one) summarizing that both prod and dev trees currently have 0 moderate+ vulns and no pending mature upgrades, for future comparative assessments.

## VERSION_CONTROL ASSESSMENT (90% ± 19% COMPLETE)
- Version control and CI/CD for this repository are in excellent shape. The project uses trunk-based development on main, has a single unified GitHub Actions workflow that runs comprehensive quality checks and security scans on every push to main, and performs fully automated publishing via semantic‑release with a post-publish smoke test. Pre-commit and pre-push hooks exist and mirror CI checks, there are no built artifacts or CI reports tracked in git, and `.voder/` is handled exactly as required. No high‑penalty violations were found under the defined scoring model.
- PENALTY CALCULATION:
- Baseline: 90%
- Total penalties: 0% → Final score: 90%

**Next Steps:**
- Keep GitHub Actions and semantic-release dependencies up to date, watching for any future deprecation warnings and upgrading actions (e.g., checkout, setup-node, upload-artifact) to the latest stable major versions as they are released.
- Ensure contributor documentation (e.g., CONTRIBUTING.md or docs/ci-cd-pipeline.md) clearly explains that Husky’s pre-commit and pre-push hooks must remain enabled and that pre-push runs the same checks as CI (ci-verify:full and security:secrets).
- When adding new CI-generated reports or artifacts, continue the current pattern: store them under ignored paths (like ci/ or .voder/traceability/), extend scripts/check-no-tracked-ci-artifacts.js if needed, and never commit those generated files to git.
- Maintain the correct .voder handling: keep .voder/traceability/ in .gitignore while continuing to track long-lived history/progress files in .voder/, avoiding any rule that ignores the entire .voder/ directory.

## FUNCTIONALITY ASSESSMENT (95% ± 95% COMPLETE)
- 1 of 22 stories incomplete. Earliest failed: docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
- Total stories assessed: 22 (0 non-spec files excluded)
- Stories passed: 21
- Stories failed: 1
- Earliest incomplete story: docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
- Failure reason: This file is a valid specification story, but its implementation is only partially complete, so the assessment is FAILED.

Key reasons:

1. **Placement rule not consistently applied to all block types (REQ-INSIDE-BRACE-PLACEMENT, REQ-ALL-BLOCK-TYPES)**
   - `annotationPlacement: "inside"` is effectively enforced only for **simple IfStatements**:
     - `gatherSimpleIfCommentText` and its tests ensure only inside-block annotations are considered in that mode.
     - Before-brace annotations under `annotationPlacement: 'inside'` for a simple if do trigger errors and an inside-block auto-fix, matching REQ-BEFORE-BRACE-ERROR for that one case.
   - Other branch types (else-if, catch, loops, switch, try/finally) still follow the older dual-position or before-brace semantics and **ignore** the placement configuration:
     - CatchClause: `gatherCatchClauseCommentText` accepts before-catch annotations first and only falls back inside when no before-text is present.
     - Else-if: `gatherElseIfCommentText` preserves Story 026.0’s multiple valid positions (before else, between condition & body, inside the block).
     - Loops: `gatherLoopCommentText` accepts both before-loop and inside-body annotations, with no use of `annotationPlacement`.
     - SwitchCase: still reads only preceding comments.
   - Therefore, the unified “first-line-inside-brace for all block types when configured” standard is **not met**.

2. **Auto-fix migration and indentation are only partially implemented (REQ-AUTO-FIX-MIGRATION, REQ-INDENTATION-CORRECT)**
   - For simple IfStatements with `annotationPlacement: 'inside'`, auto-fix now inserts annotations at the first line inside the block with correct indentation via `getIfStatementIndentAndInsertPos`, and tests confirm the behavior.
   - There is no parallel logic for other branch types (loops, switch, try/catch/finally). Their auto-fixes still use pre-028 positioning and do not consistently move annotations from before-brace into the block in `inside` mode.
   - So migration is only partially supported; the story requires a comprehensive migration capability across all branch types.

3. **Redundancy rule partially aligned but not fully validated (REQ-NON-REDUNDANT-INSIDE)**
   - `no-redundant-annotation`’s `getScopePairs` now explicitly uses `gatherBranchCommentText(..., "before")` for branch scopes, preventing inside-brace annotations from being folded into scope coverage. This aligns with treating those as non-redundant with respect to scope.
   - However, the rule does **not** expose an `annotationPlacement` option, and there are no tests referencing Story 028.0 to verify end-to-end behavior with inside placement. The implementation appears reasonable but falls short of the story’s testability and configurability expectations.

4. **Prettier compatibility for the new standard is not specifically tested (REQ-PRETTIER-STABLE, acceptance "Prettier Compatibility")**
   - Existing Prettier integration tests cover older stories:
     - Catch annotations (Story 025.0) in before/inside scenarios.
     - Else-if annotations (Story 026.0) in before/inside-between-condition scenarios.
   - None of these tests run ESLint with `annotationPlacement: 'inside'` to validate the new standardized inside-brace mode.
   - The story explicitly calls for verifying that the new inside-brace placement is stable under Prettier, which is currently untested.

5. **Documentation and migration guide are missing (Documentation, Migration Guide acceptance criteria)**
   - There is no mention of `annotationPlacement` in README.md or user-docs (including user-docs/migration-guide.md).
   - No rule docs or user-facing examples describe the new inside-brace standard, its configuration, or migration path.
   - This directly violates the story’s Documentation and Migration Guide acceptance criteria.

6. **External requirement: GitHub Issue #7 is still open (Issue #7 Resolution)**
   - `gh issue view 7 ...` shows the issue is **OPEN**.
   - The story requires that issue #7 be closed with a release reference. This has not been done.

7. **Other Definition of Done items not demonstrably met**
   - While all existing tests still pass (satisfying the "No Regression" criterion), there are no tests that:
     - confirm uniform behavior across all block types in inside mode;
     - directly check error messages specific to the new placement rule; or
     - exercise examples for all block types.
   - There is no evidence of updated user-facing rule docs, examples, or a dedicated migration guide as described in the Definition of Done.

In summary, Story 028.0 is **partially implemented**: the configuration option exists, simple-if inside placement works with auto-fix, and redundancy scope handling was adjusted. However, the core promise of a **unified, inside-brace standard across all block types**, complete documentation and migration support, Prettier-tested stability for the new mode, and closure of GitHub issue #7 has not been fulfilled. Therefore this story cannot be considered done.

**Next Steps:**
- Complete story: docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
- This file is a valid specification story, but its implementation is only partially complete, so the assessment is FAILED.

Key reasons:

1. **Placement rule not consistently applied to all block types (REQ-INSIDE-BRACE-PLACEMENT, REQ-ALL-BLOCK-TYPES)**
   - `annotationPlacement: "inside"` is effectively enforced only for **simple IfStatements**:
     - `gatherSimpleIfCommentText` and its tests ensure only inside-block annotations are considered in that mode.
     - Before-brace annotations under `annotationPlacement: 'inside'` for a simple if do trigger errors and an inside-block auto-fix, matching REQ-BEFORE-BRACE-ERROR for that one case.
   - Other branch types (else-if, catch, loops, switch, try/finally) still follow the older dual-position or before-brace semantics and **ignore** the placement configuration:
     - CatchClause: `gatherCatchClauseCommentText` accepts before-catch annotations first and only falls back inside when no before-text is present.
     - Else-if: `gatherElseIfCommentText` preserves Story 026.0’s multiple valid positions (before else, between condition & body, inside the block).
     - Loops: `gatherLoopCommentText` accepts both before-loop and inside-body annotations, with no use of `annotationPlacement`.
     - SwitchCase: still reads only preceding comments.
   - Therefore, the unified “first-line-inside-brace for all block types when configured” standard is **not met**.

2. **Auto-fix migration and indentation are only partially implemented (REQ-AUTO-FIX-MIGRATION, REQ-INDENTATION-CORRECT)**
   - For simple IfStatements with `annotationPlacement: 'inside'`, auto-fix now inserts annotations at the first line inside the block with correct indentation via `getIfStatementIndentAndInsertPos`, and tests confirm the behavior.
   - There is no parallel logic for other branch types (loops, switch, try/catch/finally). Their auto-fixes still use pre-028 positioning and do not consistently move annotations from before-brace into the block in `inside` mode.
   - So migration is only partially supported; the story requires a comprehensive migration capability across all branch types.

3. **Redundancy rule partially aligned but not fully validated (REQ-NON-REDUNDANT-INSIDE)**
   - `no-redundant-annotation`’s `getScopePairs` now explicitly uses `gatherBranchCommentText(..., "before")` for branch scopes, preventing inside-brace annotations from being folded into scope coverage. This aligns with treating those as non-redundant with respect to scope.
   - However, the rule does **not** expose an `annotationPlacement` option, and there are no tests referencing Story 028.0 to verify end-to-end behavior with inside placement. The implementation appears reasonable but falls short of the story’s testability and configurability expectations.

4. **Prettier compatibility for the new standard is not specifically tested (REQ-PRETTIER-STABLE, acceptance "Prettier Compatibility")**
   - Existing Prettier integration tests cover older stories:
     - Catch annotations (Story 025.0) in before/inside scenarios.
     - Else-if annotations (Story 026.0) in before/inside-between-condition scenarios.
   - None of these tests run ESLint with `annotationPlacement: 'inside'` to validate the new standardized inside-brace mode.
   - The story explicitly calls for verifying that the new inside-brace placement is stable under Prettier, which is currently untested.

5. **Documentation and migration guide are missing (Documentation, Migration Guide acceptance criteria)**
   - There is no mention of `annotationPlacement` in README.md or user-docs (including user-docs/migration-guide.md).
   - No rule docs or user-facing examples describe the new inside-brace standard, its configuration, or migration path.
   - This directly violates the story’s Documentation and Migration Guide acceptance criteria.

6. **External requirement: GitHub Issue #7 is still open (Issue #7 Resolution)**
   - `gh issue view 7 ...` shows the issue is **OPEN**.
   - The story requires that issue #7 be closed with a release reference. This has not been done.

7. **Other Definition of Done items not demonstrably met**
   - While all existing tests still pass (satisfying the "No Regression" criterion), there are no tests that:
     - confirm uniform behavior across all block types in inside mode;
     - directly check error messages specific to the new placement rule; or
     - exercise examples for all block types.
   - There is no evidence of updated user-facing rule docs, examples, or a dedicated migration guide as described in the Definition of Done.

In summary, Story 028.0 is **partially implemented**: the configuration option exists, simple-if inside placement works with auto-fix, and redundancy scope handling was adjusted. However, the core promise of a **unified, inside-brace standard across all block types**, complete documentation and migration support, Prettier-tested stability for the new mode, and closure of GitHub issue #7 has not been fulfilled. Therefore this story cannot be considered done.
- Evidence: [
  {
    "type": "spec_file",
    "description": "Story 028.0 requirements",
    "details": "docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md defines a new standard: annotations must be the first line inside the block braces for all block types, controlled by a new `annotationPlacement: \"inside\" | \"before\"` option (default \"before\"), with:\n- REQ-INSIDE-BRACE-PLACEMENT / REQ-BEFORE-BRACE-ERROR / REQ-ALL-BLOCK-TYPES / REQ-NON-REDUNDANT-INSIDE / REQ-AUTO-FIX-MIGRATION / REQ-PRETTIER-STABLE / REQ-INDENTATION-CORRECT.\n- Acceptance criteria include: config option, require-branch-annotation enforcing inside placement, no-redundant-annotation updated, auto-fix migration, Prettier compatibility tests, documentation + migration guide, all existing tests still pass, and GitHub issue #7 closed."
  },
  {
    "type": "implementation",
    "description": "annotationPlacement option added to require-branch-annotation schema and wired into helpers",
    "details": "File: src/rules/require-branch-annotation.ts\n- Adds AnnotationPlacement type import and schema option:\n  ```ts\n  import { validateBranchTypes, reportMissingAnnotations, AnnotationPlacement } from \"../utils/branch-annotation-helpers\";\n  ...\n  schema: [\n    {\n      type: \"object\",\n      properties: {\n        branchTypes: { ... },\n        /** @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-PLACEMENT-CONFIG REQ-DEFAULT-BACKWARD-COMPAT */\n        annotationPlacement: { enum: [\"before\", \"inside\"] },\n      },\n      additionalProperties: false,\n    },\n  ];\n  ```\n- In create(): resolves the option with a backward-compatible default:\n  ```ts\n  const rawOptions: any = context.options[0] || {};\n  const _annotationPlacement: AnnotationPlacement =\n    rawOptions.annotationPlacement === \"inside\" ||\n    rawOptions.annotationPlacement === \"before\"\n      ? rawOptions.annotationPlacement\n      : \"before\";\n  ```\n- However, `_annotationPlacement` is never passed into the handlers; `reportMissingAnnotations(context, node, storyFixCountRef)` re-reads `context.options[0]` internally. This is fine behaviorally, but shows placement is only used via report helpers, not at the rule level."
  },
  {
    "type": "implementation",
    "description": "Inside-vs-before behavior implemented only for simple IfStatements; other branch types still use old dual-position rules",
    "details": "File: src/utils/branch-annotation-helpers.ts\n- Defines `AnnotationPlacement = \"before\" | \"inside\"`.\n- New helper `gatherSimpleIfCommentText`:\n  ```ts\n  function gatherSimpleIfCommentText(sourceCode, node, annotationPlacement, beforeText): string {\n    if (annotationPlacement === \"before\") return beforeText;\n    if (annotationPlacement !== \"inside\") return beforeText;\n    if (!node.consequent || node.consequent.type !== \"BlockStatement\") return \"\";\n    // then scans comments inside the consequent block (first lines inside)\n  }\n  ```\n- `gatherBranchCommentText` now does:\n  ```ts\n  if (node.type === \"IfStatement\") {\n    if (isElseIfBranch(node, parent)) {\n      return gatherElseIfCommentText(sourceCode, node, parent, beforeText);\n    }\n    return gatherSimpleIfCommentText(sourceCode, node, annotationPlacement, beforeText);\n  }\n  ```\n  So for **simple if** with `annotationPlacement: \"inside\"`, only inside-block comments are considered; before-brace comments no longer satisfy the rule.\n- BUT for other branch types:\n  - `CatchClause` still uses `gatherCatchClauseCommentText`, which first returns any `beforeText` that matches @story/@req, preserving the dual before-or-inside behavior from Story 025.0.\n  - Else-if branches use `gatherElseIfCommentText`, which accepts before-else, between condition and body, and inside-block comments (Story 026.0 dual-position behavior) and ignores the `annotationPlacement` value.\n  - Loops call `gatherLoopCommentText` (see below) and ignore `annotationPlacement`.\n  - SwitchCase uses `gatherSwitchCaseCommentText` scanning preceding lines only.\n- There is **no enforcement** that for `annotationPlacement: \"inside\"` all branch types must use first-line-inside-brace only. REQ-ALL-BLOCK-TYPES and REQ-INSIDE-BRACE-PLACEMENT are only partially implemented (simple if)."
  },
  {
    "type": "implementation",
    "description": "Loop helpers still allow dual placement independent of annotationPlacement",
    "details": "File: src/utils/branch-annotation-loop-helpers.ts\n- `gatherLoopCommentText`:\n  ```ts\n  export function gatherLoopCommentText(sourceCode, node, beforeText): string {\n    if (/@story\\b|@req\\b|@supports\\b/.test(beforeText)) {\n      return beforeText; // before-loop annotations are accepted\n    }\n    const body = node.body;\n    if (body && body.type === \"BlockStatement\" && body.loc?.start && body.loc?.end) {\n      const lines = sourceCode.lines;\n      const startIndex = body.loc.start.line;     // first line inside block body\n      const endIndex = body.loc.end.line - 1;\n      const insideText = scanCommentLinesInRange(lines, startIndex, endIndex);\n      if (/@story\\b|@req\\b|@supports\\b/.test(insideText)) {\n        return insideText;  // first-line-inside also accepted\n      }\n    }\n    return beforeText;\n  }\n  ```\n- This explicitly supports **both** before-statement and inside-body annotations and does not consult `annotationPlacement` at all.\n- This contradicts Story 028.0’s requirement that with `annotationPlacement: \"inside\"` annotations must be on the first line inside the block for **all** block types."
  },
  {
    "type": "implementation",
    "description": "Auto-fix indentation/insert position partly updated, but only for IfStatements",
    "details": "File: src/utils/branch-annotation-report-helpers.ts\n- `getBranchMissingFlags` calls `gatherBranchCommentText(..., annotationPlacement)` so missing-story/missing-req detection respects `inside` for simple if.\n- `getBranchIndentAndInsertPos`:\n  ```ts\n  const { indent, insertPos } = getBaseBranchIndentAndInsertPos(sourceCode, node, annotationPlacement);\n  if (node.type === \"IfStatement\") {\n    const context = { indent, insertPos };\n    const updatedContext = getIfStatementIndentAndInsertPos(sourceCode, node, { parent, annotationPlacement }, context);\n    return { indent: updatedContext.indent, insertPos: updatedContext.insertPos };\n  }\n  return { indent, insertPos };\n  ```\n- `getIfStatementIndentAndInsertPos`:\n  ```ts\n  const hasBlockConsequent = node.consequent?.type === \"BlockStatement\" && node.consequent.loc?.start;\n  const isElseIf = isElseIfBranchForInsert(node, parent);\n  const isSimpleIfInsidePlacement = annotationPlacement === \"inside\" && !isElseIf;\n  if (isSimpleIfInsidePlacement || isElseIf) {\n    const commentLine = node.consequent.loc.start.line + 1;\n    const { indent, insertPos } = getIndentAndInsertPosForLine(sourceCode, commentLine, context.indent);\n    // use indent/insertPos for auto-fix\n  }\n  ```\n- So for simple `if` in `inside` mode, auto-fix inserts annotations on the first line inside the block with correct indentation (REQ-INDENTATION-CORRECT, REQ-AUTO-FIX-MIGRATION) — **but only for simple IfStatements**. Other branch types still use before-branch positions; there is no generalized inside-brace auto-fix for loops, switch, try, etc."
  },
  {
    "type": "implementation",
    "description": "no-redundant-annotation excludes inside-brace annotations from scope coverage, partially addressing REQ-NON-REDUNDANT-INSIDE",
    "details": "File: src/rules/no-redundant-annotation.ts\n- In `getScopePairs` for branch-type scopes:\n  ```ts\n  if (DEFAULT_BRANCH_TYPES.includes(scopeNode.type)) {\n    /** Inside-brace annotations used as branch-level indicators (inside placement\n     * mode) should not be folded into scopePairs for redundancy purposes; only\n     * before-brace annotations define the covering scope here.\n     * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-NON-REDUNDANT-INSIDE REQ-PLACEMENT-CONFIG\n     */\n    const text = gatherBranchCommentText(sourceCode as any, scopeNode, parent, \"before\");\n    return extractStoryReqPairsFromText(text);\n  }\n  ```\n- This ensures branch-level **scopePairs** are calculated only from before-brace comments; inside-brace annotations do not become scope coverage.\n- However, the rule has **no `annotationPlacement` option** in its schema and no tests referencing Story 028.0, so behavior is hardwired rather than truly configurable. Still, it does satisfy the narrow part of REQ-NON-REDUNDANT-INSIDE about not treating inside annotations as scope-level coverage."
  },
  {
    "type": "tests",
    "description": "Rule tests for inside placement only cover simple-if behavior; other block types not covered",
    "details": "File: tests/rules/require-branch-annotation.test.ts\n- Header references Story 028.0 and `REQ-PLACEMENT-CONFIG` / `REQ-DEFAULT-BACKWARD-COMPAT`.\n- Valid tests:\n  - Before-brace with annotationPlacement 'before':\n    ```ts\n    {\n      name: \"[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] if-statement with before-brace annotations using annotationPlacement: 'before'\",\n      code: `// @story ...\\n// @req REQ-PLACEMENT-CONFIG\\nif (condition) {}`,\n      options: [{ annotationPlacement: \"before\" }],\n    }\n    ```\n  - Inside-block with annotationPlacement 'inside':\n    ```ts\n    {\n      name: \"[REQ-INSIDE-BRACE-PLACEMENT][REQ-PLACEMENT-CONFIG] if-statement annotated inside block under annotationPlacement: 'inside' (Story 028.0)\",\n      code: `if (condition) {\\n  // @story docs/stories/028.0...\\n  // @req REQ-INSIDE-BRACE-PLACEMENT\\n  doSomething();\\n}`,\n      options: [{ annotationPlacement: \"inside\" }],\n    }\n    ```\n- Invalid test for before-brace under inside mode:\n  ```ts\n  {\n    name: \"[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR][REQ-PLACEMENT-CONFIG] before-brace annotations ignored when annotationPlacement: 'inside'\",\n    code: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md\\n// @req REQ-BEFORE-BRACE-ERROR\\nif (condition) {\\n  doSomething();\\n}`,\n    options: [{ annotationPlacement: \"inside\" }],\n    output: `// @story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md\\n// @req REQ-BEFORE-BRACE-ERROR\\nif (condition) {\\n  // @story <story-file>.story.md\\n  doSomething();\\n}`,\n    errors: makeMissingAnnotationErrors(\"@story\", \"@req\"),\n  }\n  ```\n  This confirms that **for simple if** in `inside` mode, before-brace annotations no longer satisfy the rule and an inside-block annotation is auto-inserted, satisfying REQ-BEFORE-BRACE-ERROR for that one branch type.\n- There are **no tests** exercising `annotationPlacement: 'inside'` for:\n  - else / else-if branches\n  - try/catch/finally\n  - loops (for/while/do-while/for-in/for-of)\n  - switch cases\nThus REQ-ALL-BLOCK-TYPES and \"Consistent Application\" are not tested or implemented."
  },
  {
    "type": "tests",
    "description": "Helper-level test verifies inside vs before behavior only for simple if-statements",
    "details": "File: tests/utils/branch-annotation-helpers.test.ts\n- Adds Story 028.0 block:\n  ```ts\n  describe(\"gatherBranchCommentText annotationPlacement wiring (Story 028.0...)\", () => {\n    it(\"[REQ-PLACEMENT-CONFIG][REQ-DEFAULT-BACKWARD-COMPAT] honors configured placement for simple if-statements\", () => {\n      // sourceCode.lines contain a simple if with comments before and inside\n      const beforeText = gatherBranchCommentText(sourceCode, ifNode, parent, \"before\");\n      expect(beforeText).toContain(\"@req REQ-BEFORE\");\n      const insideText = gatherBranchCommentText(sourceCode, ifNode, parent, \"inside\");\n      expect(insideText).toContain(\"@story docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md\");\n      expect(insideText).toContain(\"@req REQ-INSIDE\");\n      expect(insideText).not.toContain(\"@req REQ-BEFORE\");\n    });\n  });\n  ```\n- This confirms placement configuration works **only** for simple IfStatements. There are no analogous tests for other block types."
  },
  {
    "type": "tests",
    "description": "Prettier integration tests still target older dual-position stories, not the new inside standard",
    "details": "Files:\n- tests/integration/catch-annotation-prettier.integration.test.ts (Story 025.0)\n- tests/integration/else-if-annotation-prettier.integration.test.ts (Story 026.0)\nDetails:\n- Both integration suites run ESLint with `traceability/require-branch-annotation:error` but do **not** configure `annotationPlacement` at all, so they exercise the default (\"before\") or prior dual-position logic.\n- Catch tests validate that annotations before catch that are moved inside by Prettier remain accepted, and that inside-catch annotations are accepted — but they do **not** assert the new \"inside-only when configured\" standard.\n- Else-if tests validate that annotations before else-if or between condition and body are accepted, matching Story 026.0’s dual-position behavior, again without `annotationPlacement: 'inside'`.\n- There are **no integration tests** that:\n  - run Prettier on code with annotations intended as first-line-inside and then run ESLint with `annotationPlacement: 'inside'` to confirm stability (REQ-PRETTIER-STABLE / acceptance \"Prettier Compatibility\" under the new standard)."
  },
  {
    "type": "documentation",
    "description": "No user-facing documentation or migration guide for annotationPlacement or inside-brace standard",
    "details": "Searches:\n- README.md: `annotationPlacement` does not appear (search_file_content returned no matches).\n- user-docs/migration-guide.md: no `annotationPlacement` mention.\n- No files in user-docs/ reference Story 028.0 or the new placement rule.\nTherefore:\n- Acceptance criteria **Documentation** and **Migration Guide** are not met.\n- REQ-PLACEMENT-CONFIG and REQ-DEFAULT-BACKWARD-COMPAT lack user-facing explanation or examples."
  },
  {
    "type": "tests_run",
    "description": "All current tests pass, but they only validate partial 028.0 behavior and previous stories",
    "details": "Command (already executed in this session):\n- `npm test -- --verbose`\nResult:\n- Test Suites: 55 passed, 55 total\n- Tests: 485 passed, 485 total\nIncluded suites:\n- tests/rules/require-branch-annotation.test.ts (including new inside-placement tests for simple if).\n- tests/utils/branch-annotation-helpers.test.ts (placement wiring test for simple if).\n- Prettier integration tests for catch/else-if (Stories 025.0 and 026.0).\nThis confirms the codebase is internally consistent but does **not** by itself prove full compliance with the new story; the passing tests reflect partial implementation focused on Story 028.0 configuration wiring and simple if-statements."
  },
  {
    "type": "external_requirement",
    "description": "GitHub issue #7 is still open",
    "details": "Command executed:\n- `gh issue view 7 --json state,title --jq .state+\":\"+.title`\nOutput:\n- `OPEN:Inconsistent Annotation Placement Creates Visual Ambiguity`\nBut Story 028.0 acceptance criteria require: \"Issue #7 Resolution: GitHub issue #7 closed with comment referencing release version\".\nThis external requirement is not satisfied."
  }
]
