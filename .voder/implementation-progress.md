# Implementation Progress Assessment

**Generated:** 2025-12-09T16:03:17.206Z

![Progress Chart](./progress-chart.png)

Projected completion (from current rate): cycle 313.8

## IMPLEMENTATION STATUS: COMPLETE (96% ± 18% COMPLETE)

## OVERALL ASSESSMENT
All assessed areas meet or exceed their required thresholds, so the overall implementation is COMPLETE. The eslint-plugin-traceability project has strong code quality with well-enforced linting, formatting, and type safety; an extensive, traceable test suite with high coverage; reliable execution characteristics validated via build, runtime, and smoke tests; and clear, accurate user and developer documentation. Dependencies and security posture are actively managed with no outstanding policy violations, and version control plus CI/CD follow a disciplined trunk-based, semantic-release-driven workflow. Functionality is also high, with 20 of 21 stories fully satisfied and the remaining story only missing minor documentation alignment, not core behavior.



## CODE_QUALITY ASSESSMENT (95% ± 18% COMPLETE)
- Code quality is high and well tooled. Linting, formatting, type-checking, and duplication checks are all configured, automated, and currently passing. Maintainability rules (complexity, function/file size, magic numbers, parameters) are stricter than typical defaults and backed by a clear ratcheting plan. There are small, acceptable pockets of duplication and a few narrowly scoped, well-justified suppressions in scripts, but no significant technical debt or hidden quality gaps.
- Linting: `npm run lint -- --max-warnings=0` passes. ESLint flat config uses `@eslint/js` recommended settings plus stricter rules for complexity (max 18), max-lines-per-function (55), max-lines (450), max-params (4), and no-magic-numbers. Lint config cleanly separates production, test, and config files and correctly loads the local plugin, failing in CI if the build is missing.
- Formatting: Prettier is configured via `format` and `format:check` scripts and enforced on staged files through `lint-staged` in the Husky pre-commit hook. `npm run format:check` passes, indicating consistent formatting across src and tests.
- Type checking: TypeScript is configured with `strict: true`, includes both `src` and `tests`, and uses appropriate type libs for Node, Jest, ESLint, and TS ESLint utils. `npm run type-check` (`tsc --noEmit`) passes with no errors, and there are no `@ts-nocheck`/`@ts-ignore` usages in source or tests.
- Complexity and maintainability: ESLint enforces `complexity: ["error", { max: 18 }]`, `max-lines-per-function: 55`, `max-lines: 450`, and `max-params: 4` for production code, which are stricter than the default guidance. Tests have these rules turned off, which is acceptable. ADRs document an incremental ratcheting plan for complexity and function size, and the current config matches the planned thresholds, showing active improvement.
- Duplication: `npm run duplication` (jscpd, 3% threshold) passes. Global duplicated lines are 2.45%, with 36 clones across 98 TS files. Most duplication is in tests and small structural patterns in helper modules (`src/rules/helpers/*`). No production file appears to approach 20% duplication, so there is no major DRY violation.
- Disabled checks and suppressions: Project-wide search shows no `@ts-nocheck`, `@ts-ignore`, or file-wide `/* eslint-disable */` in src/tests. A few `eslint-disable-next-line` comments exist in scripts, each with clear, ADR-linked justification (e.g., intentional console logging for CLI guards). Tests intentionally disable some maintainability rules, which is out of scope for penalties here.
- Scripts, hooks, and tooling: All files in `scripts/` are wired through `package.json` scripts (no orphaned scripts). Husky hooks are configured: pre-commit runs `lint-staged` (fast format + lint on staged files); pre-push runs `npm run ci-verify:full` plus `npm run security:secrets`, mirroring the full CI quality gate. There are no build-before-lint/format anti-patterns; tools operate directly on source files.
- Error handling and naming: Production code uses clear, domain-appropriate names (`runMaintenanceCli`, `createAddStoryFix`, `withSafeReporting`) and consistent error handling. The CLI wraps its dispatch in a try/catch with structured exit codes and clear messages; rule helpers use `withSafeReporting` to prevent ESLint crashes and optionally log diagnostics under a debug flag. There are no silent failures.
- AI slop and temporary files: Code is richly annotated with `@story`/`@supports` and `@req` tags tied to the markdown stories, as well as ADR references. Comments are specific and purposeful, not generic templates. Searches found no `.patch`, `.diff`, `.rej`, `.tmp`, or similar temporary artifacts, and no empty or placeholder implementation files.
- Ratcheting and future tightening: Two ADRs (003-code-quality-ratcheting-plan.md and code-quality-ratcheting-plan.md) define a clear, incremental plan to tighten `max-lines-per-function`, `max-lines`, and `complexity` over multiple sprints, with CI enforcement via `npm run lint -- --max-warnings=0`. The project is already operating at stricter-than-default thresholds, with room for further incremental reductions as planned.

**Next Steps:**
- Follow the existing ratcheting ADR to tighten complexity from 18 toward 16 (and eventually below) by temporarily running ESLint with the lower limit (e.g., `npm run lint -- --rule 'complexity:["error",{"max":16}]'`), identifying violating functions, refactoring them, then updating `eslint.config.js` and the ADR to the new threshold once violations are eliminated.
- Similarly, continue reducing `max-lines-per-function` in small steps per the ratcheting plan, each time identifying and refactoring only the functions that exceed the new limit to keep changes small and safe.
- Use `jscpd`’s detailed clone listings to target minor duplication hotspots in `src/rules/helpers/require-story-visitors.ts` and `src/rules/helpers/require-story-core.ts`; extract small shared utilities where it improves clarity without over-abstracting.
- Gradually enable any currently commented-out plugin-specific ESLint rules (e.g., traceability/valid-annotation-format) using the documented “enable with suppressions” workflow: turn on a rule, add narrow `eslint-disable-next-line <rule>` with TODO + ADR/issue references where necessary, ensure `npm run lint` and CI stay green, then clean up suppressions in subsequent iterations.
- Keep ADR references and comments in sync with actual behavior in scripts (e.g., console logging justifications) so that the narrow `eslint-disable-next-line` usages remain clearly motivated and maintainable as the tooling evolves.

## TESTING ASSESSMENT (98% ± 19% COMPLETE)
- Testing for this project is excellent: it uses Jest + ts-jest and ESLint RuleTester appropriately, all 54 suites (467 tests) pass in non-interactive mode, coverage is very high and enforced via thresholds, tests are isolated via OS temp dirs, and there is strong story/requirement traceability throughout. Only minor nits (some complex helper logic in perf tests and a few brittle message-text assertions) keep this from a perfect score.
- Test framework: The project uses Jest with ts-jest as the primary testing framework, configured in jest.config.js with TypeScript support, node environment, and proper test file patterns (tests/**/*.test.ts). Rule behavior is tested using ESLint's RuleTester, which is the standard, well-supported approach for ESLint plugins.
- Execution and pass rate: Running `npm test -- --runInBand` succeeds with `Test Suites: 54 passed, 54 total` and `Tests: 467 passed, 467 total`, confirming a 100% pass rate. The default script `npm test` runs `jest --ci --bail`, which is non-interactive and CI-friendly.
- Coverage: Running `npm test -- --coverage --runInBand` passes and yields very high coverage (≈96.98% statements, 86.54% branches, 99.67% functions, 96.98% lines). These exceed the configured global thresholds in jest.config.js (branches ≥80, functions/lines/statements ≥90), demonstrating both breadth and depth of test coverage across src/index.ts, src/rules/**, src/rules/helpers/**, src/utils/**, and src/maintenance/**.
- Temp directory usage & repo safety: Filesystem-writing tests create directories under OS temp paths using fs.mkdtempSync + os.tmpdir() or shared `createTempDir` in tests/utils/temp-dir-helpers.ts, and clean them up with fs.rmSync or `cleanup()` in afterAll/finally blocks. Grep for writeFileSync shows writes only into these temp/workspace directories; no tests modify tracked repository files, satisfying the isolation and cleanliness requirements.
- Non-interactive behavior: The primary test command `npm test` invokes `jest --ci --bail` (no watch mode, no prompts). CI (`.github/workflows/ci-cd.yml`) calls `npm run ci-verify:full`, which includes `npm run test -- --coverage` and other checks, all non-interactive and suitable for automated pipelines.
- Isolation and independence: Tests that alter global process state (cwd, env, console) restore it via beforeAll/afterAll or finally blocks. Maintenance CLI and perf tests frequently change process.cwd() but always reset it. Temp dirs are per-test or per-suite. There are no detected inter-test dependencies, and Jest’s default per-file process isolation further enforces independence.
- Test structure and naming: Test files and suites are clearly named by feature (e.g., require-story-annotation.test.ts, maintenance/cli.test.ts, perf/require-branch-annotation-large-file.test.ts). Individual test names describe behavior and often encode requirement IDs (e.g., "[REQ-MAINT-SAFE] dry-run does not modify files and exits 0"). Most tests follow an Arrange–Act–Assert pattern. Files with "branch" or "branches" in the name refer to real branch-annotation functionality, not coverage concepts, so naming is appropriate.
- Traceability: Every test file checked contains at least one `@supports` annotation (verified via `grep -L @supports tests --include=*.test.ts` returning no files). Headers typically include @story and @req tags mapping tests to concrete stories in docs/stories/*.story.md and requirement IDs ([REQ-*]). Describe block names reference stories (e.g., "(Story 009.0-DEV-MAINTENANCE-TOOLS)"), and many `it` names embed REQ IDs, satisfying strong test traceability requirements.
- Error handling and edge cases: Tests cover numerous negative and edge scenarios—missing annotations, invalid paths (path traversal and absolute paths), non-existent roots, missing CLI flags, invalid formats, and filesystem permission errors simulated via fs.statSync mocks. Maintenance tests verify exit codes 0/1/2 and user-facing error/help messages, and rule tests exhaustively exercise edge cases via dedicated *edgecases*.test.ts files.
- Performance and determinism: Performance-focused tests in tests/perf/** construct large synthetic workspaces and assert that key operations complete within generous 5-second budgets on CI hardware while producing expected outputs. Overall test runs complete in seconds, and there is no use of randomness, making the suite fast and deterministic. Any loops/logic in tests are confined to data generation helpers for perf scenarios and do not introduce flakiness.
- Test doubles and helpers: The suite uses jest.spyOn for console and fs behaviors, and shared helpers (fsTestHelpers.ts, temp-dir-helpers.ts, ts-language-options.ts, runAnnotationCheckerTests) to avoid duplication and keep tests readable. These helpers centralize behavior like TS RuleTester configuration, temp-dir lifecycle, and fs mocking, improving maintainability and consistency across tests.

**Next Steps:**
- Remove minor duplication and noise in some test headers (e.g., multiple overlapping JSDoc blocks with @story/@supports in cli-integration.test.ts) to keep traceability concise and unambiguous.
- Factor shared performance budgets (e.g., the 5000 ms thresholds repeated across several perf tests) into a small shared constant or perf helper module so that timing assumptions can be updated in one place if CI characteristics change.
- Review tests that assert on long, exact human-readable message strings (especially ESLint rule suggestion text); where possible, narrow assertions to key phrases or message IDs instead of entire strings to improve resilience to benign wording changes.
- Optionally introduce a `test:fast` or similar script (e.g., using the existing `ci-verify:fast` pattern) that runs a representative subset of tests for ultra-quick local feedback, while keeping `npm test` as the authoritative full suite for CI and pre-push checks.
- Document the testing strategy for contributors (frameworks used, how to run full vs. fast tests, requirements around using OS temp dirs and restoring global state) in CONTRIBUTING.md or a dedicated docs/testing.md so future tests maintain the same high standard.

## EXECUTION ASSESSMENT (94% ± 18% COMPLETE)
- Runtime execution for this project is excellent. The plugin builds cleanly, installs without issues, passes an extensive test suite (unit, integration, and performance), and its published artefact and CLI are validated via a dedicated smoke test. Error handling and input validation behave correctly at runtime, and there are no observed critical runtime defects; remaining opportunities are mostly around broader environment coverage and additional performance characterization.
- npm-based setup works end-to-end: `npm install` completes successfully, runs the Husky prepare hook, and `npm audit` reports 0 vulnerabilities for 981 packages, confirming a healthy local dependency environment.
- Build and type system are sound: `npm run build` (tsc -p tsconfig.json) and `npm run type-check` (tsc --noEmit) both exit with code 0, demonstrating that the TypeScript codebase compiles and type-checks without errors.
- The full Jest test suite passes in CI mode: `npm test -- --runInBand` runs 54 test suites and 467 tests covering rules, plugin setup, maintenance tools, integrations, and performance, all passing with no flakiness observed.
- A CI-style fast verification passes: `npm run ci-verify:fast` executes type-checking, a traceability consistency script, duplication detection (jscpd), and a focused subset of Jest tests for rules and maintenance; everything exits successfully, providing a strong runtime smoke for core functionality.
- Linting is clean: `npm run lint` (ESLint with the project’s flat config over src and tests, with `--max-warnings=0`) passes, indicating consistent and non-broken runtime rule configurations and code style.
- The library’s dynamic rule loading is robust: `src/index.ts` requires rule modules by name inside a try/catch, logs clear errors to stderr on failure, and installs a fallback rule that reports the load error at lint time, avoiding silent failures at runtime.
- Plugin metadata resolution is defensive: `pluginMeta` attempts multiple `package.json` locations for both built (`lib`) and source (`src`) usage and gracefully falls back to default name/version, preventing plugin loading from failing due to metadata issues.
- Rule aliasing and deprecation are handled at runtime: the plugin unifies `require-traceability` with legacy rule names and exposes `prefer-supports-annotation` as the primary rule while marking `prefer-implements-annotation` deprecated, preserving backward compatibility without breaking existing configurations.
- ESLint CLI integration is verified end-to-end: `tests/integration/cli-integration.test.ts` spawns the real ESLint CLI, configures this plugin, feeds code via stdin, and asserts exit statuses for both error and success scenarios, confirming correct behavior in realistic CLI usage.
- The maintenance CLI (`traceability-maint`) has well-defined runtime behavior: it parses arguments, provides help when needed, dispatches to detect/verify/report/update handlers, handles unknown commands with diagnostics and usage, and uses a catch-all to log `traceability-maint failed: ...` instead of crashing, returning appropriate exit codes (EXIT_OK/EXIT_USAGE).
- Maintenance CLI and reporting logic are thoroughly tested: `tests/maintenance/*.test.ts` and `tests/perf/maintenance-*.test.ts` cover normal operation, error paths, and large-workspace scenarios, all passing in the full test run and the fast CI verify task.
- The published artefact and CLI are validated via a smoke test: `npm run smoke-test` packs the plugin, installs it into a fresh temp project, verifies it can be required, configures ESLint with it, and runs `traceability-maint` in both success and error paths, concluding with “Smoke test passed! Plugin and CLI verified successfully.”
- Additional CLI debug behavior is confirmed: running `node scripts/cli-debug.js --help` executes ESLint with this plugin on small samples and shows clear error messages and non-zero exit codes when annotations are missing, demonstrating user-facing diagnostics are correct at runtime.
- Input validation is strong: rules enforce annotation presence, format, and reference validity (including rejecting path traversal and absolute paths), and tests confirm these validations appear as ESLint errors rather than being silently ignored.
- No N+1 or resource-leak risks are evident: the project doesn’t use a database or long-lived network resources; it performs static analysis and short-lived CLI operations, with child processes spawned synchronously in tests and no observable unclosed handles or persistent listeners.
- Performance is explicitly exercised: tests under `tests/perf/` validate the behavior of rules and maintenance tools on large files and large workspaces, all passing, which indicates acceptable performance under heavier but realistic conditions.

**Next Steps:**
- Run the existing smoke test (`npm run smoke-test`) and a subset of core tests under multiple Node versions declared in `engines` (e.g., via nvm for 18, 20, 22) to validate that runtime behavior is consistent across all supported environments.
- Optionally extend performance validation with a simple benchmark script that runs key maintenance commands (`traceability-maint detect/verify/report/update`) on a very large synthetic workspace and records timings, to catch regressions beyond what the current Jest-based perf tests assert.
- Document key runtime guarantees explicitly in user-facing docs—for example, how rule-load failures are reported, expected exit codes and help behavior for `traceability-maint`, and typical error messages for invalid annotations—so consumers can confidently automate around these behaviors.

## DOCUMENTATION ASSESSMENT (96% ± 18% COMPLETE)
- User-facing documentation for eslint-plugin-traceability is comprehensive, accurate, and well-aligned with the actual implementation. README, user-docs, CHANGELOG, LICENSE, and SECURITY are all consistent and properly published. Links are correct, internal docs are not exposed, license data is coherent, and code traceability annotations are thorough. Remaining improvements are minor usability/polish items.
- README.md is present, clear, and accurate:
- Describes the plugin’s purpose (ESLint plugin enforcing traceability annotations) and supported environments (Node 18.18/20/22.14/24 and ESLint v9+) in line with package.json `engines.node` and `peerDependencies.eslint`.
- Contains a dedicated Attribution section: “Created autonomously by [voder.ai](https://voder.ai).” satisfying the mandatory attribution requirement.
- Explains installation, flat-config setup (`eslint.config.js`), and highlights the canonical rule `traceability/require-traceability` with legacy aliases, all matching actual rule modules in `src/rules/` and the wiring in `src/index.ts`.
- Documents the maintenance CLI (`traceability-maint`) commands (detect, verify, report, update) and usage exactly as implemented in `src/maintenance/cli.ts`, `commands.ts`, `detect.ts`, and `update.ts`.
- Shows how to run tests, lint, formatting, and duplication checks, all of which correspond to real npm scripts in package.json.
- User-facing docs are correctly separated and comprehensive:
- `user-docs/` exists and is included in the npm package via `files` in package.json. It contains:
  - `api-reference.md`: Detailed rule-by-rule API description, options, defaults, and examples consistent with the implementations (e.g., `valid-story-reference` options match `src/rules/valid-story-reference.ts` and helper utilities; `prefer-supports-annotation` behavior aligns with alias wiring and rule intent).
  - `examples.md`: Runnable ESLint config, CLI, test, and branch-annotation examples that match the behavior of rules such as `require-traceability`, `require-test-traceability`, and `require-branch-annotation`.
  - `migration-guide.md`: Accurate guidance for migrating from 0.x to 1.x, reflecting real behavior (stricter `.story.md` enforcement, path traversal rejection, opt-in `prefer-supports-annotation`, and `no-redundant-annotation` as a warning-level cleanup rule).
  - `traceability-overview.md`: High-level FAQ guiding users on when to use `@supports` vs `@story`/`@req`, and which rules/presets to enable, consistent with README and the code.
  - `eslint-9-setup-guide.md`: Correct flat-config patterns for ESLint 9, including JS/TS/monorepo setups and plugin registration, consistent with how ESLint 9 works and how this project is configured.
- Each of these docs includes the required attribution line referencing voder.ai.
- Links, references, and publishing rules are correctly implemented:
- All user-facing documentation references use proper Markdown links; there are no plain-text file-path references where links are expected.
  - README links to `user-docs/eslint-9-setup-guide.md`, `user-docs/api-reference.md`, `user-docs/examples.md`, `user-docs/traceability-overview.md`, `user-docs/migration-guide.md`, `CHANGELOG.md`, and `SECURITY.md`, all of which exist and are part of the published package.
  - Inside user-docs, cross-links such as `[API Reference](api-reference.md)`, `[Examples](examples.md)`, `[Migration Guide](migration-guide.md)`, and `[README](../README.md#quick-start)` all point to existing documents.
- Code references (e.g., `eslint.config.js`, CLI commands, test files) are presented as code (backticks or fenced blocks), not Markdown links, avoiding incorrect linking of non-published files.
- User-facing docs do not link to internal project docs under `docs/`, `prompts/`, or `.voder/`. Occurrences of `docs/stories/...` are within code examples as generic, illustrative story paths, not as clickable documentation links.
- `package.json.files` includes only user-facing docs (`README.md`, `LICENSE`, `SECURITY.md`, `user-docs`, `CHANGELOG.md`) and build output (`lib`); internal `docs/`, `prompts/`, and configuration files are correctly excluded from published artifacts.
- Versioning and changelog documentation align with semantic-release usage:
- `.releaserc.json` and devDependencies show `semantic-release` is used for automated releases; README and CHANGELOG both explicitly state that semantic-release drives versioning.
- `CHANGELOG.md` explains that detailed release notes live on GitHub Releases, providing a link to `https://github.com/voder-ai/eslint-plugin-traceability/releases` and explicitly marking the subsequent entries as “Historical Changelog (Prior to Automated Releases)”.
- package.json `version` is `1.0.5`, matching the last manual changelog entry; this is fine for a semantic-release project, and docs correctly direct users to GitHub Releases as the authoritative source.
- User docs typically refer to “1.x” rather than hard-coded exact versions, minimizing risk of staleness under automated versioning.
- License information is consistent and valid:
- Root `LICENSE` contains a standard MIT license with 2025 voder.ai copyright.
- `package.json` has `"license": "MIT"` (valid SPDX identifier) and there is only one package in the repository, so no cross-package inconsistencies.
- No additional LICENSE/LICENCE files were found; license declarations and text are therefore consistent project-wide.
- Security, support, and contribution docs are accurate and user-appropriate:
- `SECURITY.md` clearly documents:
  - How to report vulnerabilities (via GitHub Security Advisories),
  - That only the latest published version is supported,
  - Production dependency guarantees enforced by `npm audit --omit=dev --audit-level=high`,
  - Use of `dry-aged-deps` for dependency maturity, and
  - A resolved, historical dev-only semantic-release/npm tooling risk, firmly scoped as non-impacting for end users.
- `CONTRIBUTING.md` explains trunk-based development, semantic-release, Conventional Commits, and local quality gates (`ci-verify:fast`, `ci-verify:full`) that match actual npm scripts and tooling. It refrains from linking into internal docs and correctly positions deeper rationale as internal-only, keeping user-facing guidance focused and accurate.
- Code documentation and traceability are strong and aligned with documented behavior:
- The public programmatic API (`maintenance` export) described in `user-docs/api-reference.md` matches the code:
  - `maintenance` is assembled in `src/index.ts` from functions exported by `src/maintenance/index.ts`.
  - Each maintenance function (`detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`) has clear, behavior-focused JSDoc with parameters and return values spelled out.
- Named functions and significant branches across maintenance and rule files contain `@story`/`@req` or `@supports` annotations referencing specific story files and requirement IDs, in the expected parseable formats.
  - Examples: `detectStaleAnnotations`, `processFileForStaleAnnotations`, `handleStoryMatch`, `getInProjectCandidates`, `runMaintenanceCli`, `handleDetect`, `handleVerify`, `handleReport`, `handleUpdate`, and helpers in `valid-story-reference.ts`.
- These annotations conform to the formats that the plugin enforces (`@supports story-path REQ-...` or legacy `@story`/`@req` pairs), satisfying the traceability requirements and aligning code behavior with the documented stories and requirements.
- TypeScript types and rule metadata (schemas, messages) are consistent with the descriptions in API docs, providing a secondary source of accurate, machine-checked documentation.
- No major issues or violations of the documentation rules were found:
- README attribution requirement is fully satisfied.
- No user-facing docs link into `docs/`, `prompts/`, or `.voder/` directories; all such references are in code examples only.
- No broken links or references to non-existent Markdown files were observed.
- No code files that are not published are incorrectly linked as documentation.
- License identifiers are standard and consistent.
- Documentation for implemented functionality (rules, presets, maintenance API/CLI) matches the actual code; there are no obvious claims about features or options that do not exist.

**Next Steps:**
- Add a small “Getting Started Paths” section near the top of README that explicitly points new users to:
  - Traceability Overview (`user-docs/traceability-overview.md`) for conceptual orientation,
  - ESLint 9 Setup Guide (`user-docs/eslint-9-setup-guide.md`) for configuration,
  - API Reference (`user-docs/api-reference.md`) for detailed rule and CLI options.
This makes the excellent existing documentation even more discoverable.
- Optionally add a concise summary table of `traceability-maint` CLI commands and exit codes in README (alongside or above the current CLI description) so users can quickly see behavior without reading the full narrative section or API reference.
- Consider lightly restructuring the longest sections in `user-docs/api-reference.md` (for example, by adding per-rule summary tables or brief “At a glance” subsections) to improve scanability while preserving technical depth. This is a usability enhancement rather than a correctness fix.
- Add an explicit note early in the Overview or API Reference clarifying that `docs/stories/...` paths shown in examples are **illustrative of a typical consumer project’s story layout**, not links to this plugin’s internal docs. While the current usage is safe and correct, this clarification could further reduce any potential ambiguity for readers.

## DEPENDENCIES ASSESSMENT (98% ± 19% COMPLETE)
- Dependencies are in excellent health. All installed packages are consistent and reproducible, the lockfile is committed, there are no deprecations or security issues reported, and `dry-aged-deps` confirms there are currently no safe mature updates to apply under the 7‑day policy.
- `npx dry-aged-deps --format=xml` output shows 5 outdated packages but **all** have `<filtered>true</filtered>` with `<filter-reason>age</filter-reason>` and ages 0–6 days; `<safe-updates>0</safe-updates>` indicates **no safe mature updates** are available according to the 7‑day threshold, so no upgrades are required or permitted now.
- No package appears with `<filtered>false</filtered>` where `<current>` is less than `<latest>`, so there are no mandatory upgrades under the dependency policy.
- `package.json` is well-structured: tooling and build-time packages are in `devDependencies` (eslint, @typescript-eslint/*, jest, ts-jest, typescript, prettier, dry-aged-deps, semantic-release, etc.), and `eslint` is correctly listed as a `peerDependency` for this ESLint plugin.
- `package-lock.json` exists and `git ls-files package-lock.json` returns `package-lock.json`, confirming the lockfile is tracked in git and ensuring reproducible installs across environments.
- `npm install` completes successfully with no `npm WARN deprecated` messages and reports `found 0 vulnerabilities`, showing that dependencies install cleanly and are free from known security issues at install time.
- `npm audit --audit-level=low` exits with code 0 and `found 0 vulnerabilities`, confirming there are no known vulnerabilities in the current dependency tree even at low severity.
- `npm ls --depth=0` exits with code 0 and lists all top-level dependencies at concrete versions with no warnings about unmet peer dependencies or version conflicts, indicating a healthy, consistent dependency tree at the top level.
- `package.json` includes dependency-related safety mechanisms such as `overrides` for known-risk transitive packages (`glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`) and scripts like `deps:maturity`, `audit:ci`, and `safety:deps`, showing that dependency health is actively managed and integrated into CI workflows.

**Next Steps:**
- No immediate dependency changes are needed; the project is already in the optimal state defined by the 7‑day maturity policy (`<safe-updates>0</safe-updates>`).
- Continue to use `npx dry-aged-deps --format=xml` (e.g., via `npm run deps:maturity`) as the sole authority for safe upgrades; when future runs show any package with `<filtered>false</filtered>` and `<current>` < `<latest>`, upgrade that package to the `<latest>` version reported by the tool, ignoring semver ranges.
- After any future dependency upgrade, re-run `npm install` and commit the updated `package-lock.json`, then run the existing CI verification scripts (such as `npm run ci-verify` or `npm run ci-verify:full`) to ensure the codebase remains compatible with the new versions.

## SECURITY ASSESSMENT (96% ± 19% COMPLETE)
- Security posture is strong and well-implemented. Current audits show zero known vulnerabilities (prod and dev), dependency maturity checks report no outstanding safe updates, historical dev-only issues are resolved and documented, secrets handling is robust, and CI/CD enforces meaningful security gates before automatic releases. No moderate-or-higher vulnerabilities violating the project’s security policy are present, so the project is not blocked by security.
- Dependency security is clean as of this assessment:
- `npm install` reported `found 0 vulnerabilities`.
- `npm audit --omit=dev --audit-level=high` → 0 vulnerabilities (production dependency tree clean).
- `npm audit --include=dev --audit-level=high` → 0 vulnerabilities (no outstanding high-severity dev issues).
- `npm audit --json` shows an empty `vulnerabilities` object and all severity counts at 0.
- `npx dry-aged-deps --format=json --check` output shows `packages: []`, `totalOutdated: 0`, `safeUpdates: 0`, confirming there are no safe, mature upgrades currently recommended under the configured policy.
- Existing security incidents are well-documented and currently resolved:
- Historical dev-only vulnerabilities in bundled `npm/glob/brace-expansion` within `@semantic-release/npm@10.0.6` are captured in `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md`, `dev-deps-high.json`, and related incident files.
- The incident’s Resolution section and today’s audits confirm that with the current toolchain (`semantic-release@25.x`, `@semantic-release/npm@13.1.2`), both production and dev audits report 0 vulnerabilities and `dry-aged-deps` finds no pending safe updates.
- No `*.disputed.md` incident files exist, so there are no disputed vulnerabilities and no need for audit-filter exceptions.
- Manual overrides are controlled and documented:
- `package.json` has `overrides` for `glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`.
- `docs/security-incidents/dependency-override-rationale.md` explains each override with advisory links, scope (dev-only, transitive), and risk assessment.
- Documentation ties overrides to historical audits (`dev-deps-high.json`) and to `dry-aged-deps` output, aligning with the stated override/incident process.
- Security policy and implementation are clearly documented and consistent:
- Root `SECURITY.md` provides a clear user-facing policy: how to report vulnerabilities, what is supported, and guarantees for production dependencies (no known high-severity vulns in runtime deps at release time).
- `docs/security-overview.md` describes exactly how security tooling (`audit:ci`, `audit:dev-high`, `safety:deps`, `security:secrets`) and CI hooks enforce these guarantees, including which checks are gating vs advisory.
- Additional docs in `docs/security-incidents/` and `docs/dependency-health.md` align with observed tool behavior and logs.
- CI/CD pipeline enforces strong security gates with true continuous deployment:
- Single workflow `.github/workflows/ci-cd.yml` triggers on `push` to `main`, PRs, and a nightly schedule.
- `quality-and-deploy` job uses `npm ci` then runs `npm run ci-verify:full`, which includes:
  - Build, type-check, lint, tests, duplication, formatting, traceability, and artifact hygiene.
  - `npm audit --omit=dev --audit-level=high` as a **release-blocking** production security gate.
  - `npm run audit:ci`, `npm run audit:dev-high`, `npm run safety:deps` as advisory signals.
- `npm run security:secrets` (secretlint with a restrictive config) is executed as a **gating** check in CI and in the local pre-push hook.
- Only after all gates pass does `npx semantic-release` run (push to `main`, specific Node version), then a smoke test installs and validates the just-published package, fulfilling the continuous deployment requirement.
- Secrets handling and `.env` hygiene are correct and verifiable:
- `.gitignore` ignores `.env*` files while explicitly allowing `.env.example`.
- `.env.example` contains no real secrets, only a commented optional `DEBUG` example.
- `git ls-files .env` → empty; `git log --all --full-history -- .env` → empty. `.env` has never been tracked or committed.
- Secret scanning uses secretlint with `@secretlint/secretlint-rule-preset-recommend` and focused ignores (node_modules, lib, coverage, ci, .voder, .git, images). Any detected secret in source or config will fail CI and pre-push.
- Source and tooling code show no obvious secret exposure or dangerous dynamic execution:
- Project-wide grep for `API_KEY|SECRET|PASSWORD|TOKEN` only finds symbolic identifiers related to the plugin’s traceability tokens, not credentials.
- No tracked `.env` files; no hardcoded API tokens, passwords, or keys in `src`, `tests`, or `scripts`.
- Use of `child_process` is limited to tooling scripts (`ci-audit.js`, `ci-safety-deps.js`, `generate-dev-deps-audit.js`, `check-no-tracked-ci-artifacts.js`) that call `npm` or `git` with **fixed argument arrays** and no `shell: true`, reducing command injection risk.
- No evidence of `eval` or `new Function` usage in inspected code; the ESLint plugin and CLI work by static analysis and argument parsing, not dynamic code execution.
- Application-layer attack surfaces are minimal for this project type:
- The codebase is an ESLint plugin plus a Node CLI (`traceability-maint`), not a networked service.
- No database drivers, SQL, ORM, or HTTP servers are present, so typical SQL injection and HTTP-based vulnerabilities do not apply.
- The CLI (`src/maintenance/cli.ts`) parses arguments into a normalized structure and dispatches to handlers without shelling out; errors are handled via try/catch with explicit, safe exit codes.
- The plugin operates via ESLint’s AST traversal, not by executing user-provided code strings.
- No conflicting dependency automation tools are present:
- No `.github/dependabot.yml` or `.github/dependabot.yaml` found.
- No `renovate.json` in the repo.
- Grep across `.github/workflows` shows no mentions of Dependabot or Renovate.
- Dependency management is handled via manual updates, semantic-release, and `dry-aged-deps`, avoiding conflicting automation tools.

**Next Steps:**
- Continue to use the existing gates as-is when changing dependencies:
- Rely on `npm audit --omit=dev --audit-level=high` (already integrated into `ci-verify:full`) as the mandatory production security gate.
- Keep `npm run audit:ci`, `npm run audit:dev-high`, and `npm run safety:deps` as advisory checks and reference their JSON outputs in any new or updated incident documentation.
- Keep incident and override documentation in sync with dependency changes:
- When you add, update, or remove overrides in `package.json`, update `docs/security-incidents/dependency-override-rationale.md` and any relevant incident files to reflect the new risk profile and justification.
- If new dev-only vulnerabilities arise that must be accepted as residual risk (and meet your policy conditions), document them using `SECURITY-INCIDENT-TEMPLATE.md` and link them from override rationale and dependency-health docs.
- Preserve and respect existing secret scanning and `.env` practices:
- When adding new file types or directories (e.g., binary assets, generated code), ensure `.secretlintrc.json` ignores are updated only where appropriate so that sensitive source/config files remain fully scanned.
- Keep `.env` files untracked and use `.env.example` patterns for any new environment-variable guidance.

## VERSION_CONTROL ASSESSMENT (97% ± 19% COMPLETE)
- Version control and CI/CD for this repo are implemented at a very high standard. The project uses trunk-based development on main with strict Conventional Commits, a single unified CI/CD workflow that runs comprehensive quality checks and semantic‑release, modern Husky hooks that mirror CI checks locally, and a clean repository structure without built artifacts or CI outputs in git. All critical VERSION_CONTROL requirements are met; only very minor, non-blocking deviations remain.
- CI/CD workflow configuration & continuous deployment
- - Single unified workflow: .github/workflows/ci-cd.yml is the only workflow and is explicitly documented in ADR 014 as the canonical CI/CD pipeline. It runs all quality checks and, when appropriate, semantic-release and a smoke test in the same job, avoiding duplicate/fragmented workflows.
- - Triggers: The workflow runs on push to main, pull_request to main, and a nightly schedule for dependency health. The release step is strictly guarded to run only on push events to refs/heads/main and only for the Node 22.14.0 matrix entry, so releases never occur on PRs or schedules.
- - Modern, non-deprecated actions: Uses actions/checkout@v4, actions/setup-node@v4, and actions/upload-artifact@v4. There are no usages of older deprecated major versions or deprecated workflow syntax, and recent logs for run 20069429342 contain no deprecation warnings.
- - Quality gates: npm run ci-verify:full (build, type-check, lint-plugin-check, lint --max-warnings=0, tests with coverage, duplication check, traceability check, formatting check, multiple npm audit layers, CI-artifact checks, custom safety scripts) plus npm run security:secrets (secretlint). This provides comprehensive automated quality, security, and build verification.
- - Automated publishing via semantic-release: .releaserc.json and devDependencies include semantic-release and plugins. The workflow’s “Release with semantic-release” step runs npx semantic-release on successful pushes to main, with guards for missing/invalid NPM_TOKEN or OTP (skips publish without failing CI, but fails on other errors). This is fully automated, tag-free releasing from CI based on Conventional Commits.
- - Post-deployment verification: If semantic-release publishes a new version, the workflow immediately runs scripts/smoke-test.sh against that version (using the parsed version output), providing automated post-publish smoke testing in the same run.
- - Pipeline stability: get_github_pipeline_status shows the last 10 “CI/CD Pipeline” runs on main as successful on 2025‑12‑09. Detailed run 20069429342 (commit 8078745) shows all matrix jobs and the semantic-release + smoke test path completing successfully, confirming the pipeline works end-to-end.
- Repository status, structure & ignoring of generated artifacts
- - Branch and sync: git branch --show-current returns main. git status -sb shows main...origin/main with only .voder/history.md and .voder/last-action.md modified; there are no unpushed commits and no non‑.voder local changes, satisfying the “clean working directory (excluding .voder)” and “all commits pushed” criteria.
- - Trunk-based development & commit quality: git log --oneline -n 10 shows small, focused commits directly on main, all using strict Conventional Commits (e.g., feat, fix, docs, test, ci). ADR 014 documents trunk-based development on main, Conventional Commits semantics, and semantic-release usage, and the observed history matches this policy.
- - .gitignore correctness: .gitignore ignores node_modules, logs, coverage outputs, numerous caches, and build directories lib/, build/, dist/. It also ignores CI artifacts (ci/, jscpd-report/, Jest JSON outputs, scripts/*-report files) and Voder transient outputs (.voder/traceability/ and several .voder-* JSON files) while not ignoring .voder/ itself. This aligns exactly with the specified .voder rules.
- - Tracked .voder files: git ls-files shows .voder/history.md, .voder/implementation-progress.md, .voder/last-action.md, .voder/plan.md, and progress logs all tracked. .voder/traceability/ is not tracked (and is ignored), correctly following the requirement to persist assessment history but ignore transient outputs.
- - Built artifacts and generated files: git ls-files contains no lib/, build/, dist/, or out/ directories, and no .d.ts files or compiled bundles are tracked. Although package.json’s main and types point into lib/src, that directory is intentionally not under version control (it’s a build output ignored by .gitignore).
- - CI artifacts and reports: From the full ls-files listing, there are no tracked files that match the forbidden patterns (*-report.md/html/json/xml, *-output.md/txt/log, *-results.json/xml/txt, scripts/*.md|*.log|*.txt). The only files under scripts/ are .js scripts and smoke-test.sh, which are implementation scripts referenced from package.json scripts, not CI artifacts.
- Pre-commit and pre-push hooks & parity with CI
- - Husky setup (modern): package.json has devDependency "husky": "^9.1.7" and a "prepare": "husky" script, which is the current Husky v9+ pattern. The .husky/ directory is tracked with pre-commit and pre-push hook scripts; no deprecated Husky v4 config files (.huskyrc, husky.config.js) are present and no deprecated install commands are used.
- - Pre-commit hook: .husky/pre-commit runs npx lint-staged. lint-staged is configured in package.json to run prettier --write and eslint --fix on staged files under src/ and tests/. This provides automatic formatting plus linting on just the changed files, typically completing in well under 10 seconds. It satisfies the requirements: fast, auto-fix formatting, and at least linting (type-checking is handled later). It does not run heavy checks like build or tests, in line with the guidance to keep pre-commit lightweight.
- - Pre-push hook: .husky/pre-push runs npm run ci-verify:full followed by npm run security:secrets, with set -e and a final success message. ci-verify:full encapsulates build, tests, type-checking, linting, formatting check, duplication, traceability, and multiple audits. security:secrets adds secret scanning. This is exactly the same command set used by the CI workflow’s quality-and-deploy job, so local pre-push checks have full parity with CI quality gates.
- - Hook/CI parity and behavior: Because CI’s quality-and-deploy job runs the same two commands (ci-verify:full + security:secrets) for each Node version, developers get the same set of checks before pushing as will run in CI. This adheres strictly to the “hooks must run the same checks as CI” requirement and ensures pushes are blocked if any CI-equivalent quality gate fails.
- - Performance: CI runs complete in roughly 1.5–2 minutes per Node version including artifact upload; locally, running the same checks without matrix duplication and artifact uploads is reasonable within the <2 minute target, especially on typical developer hardware. This is an acceptable trade-off for maintaining full parity between hooks and CI.
- Versioning strategy & documentation alignment
- - Semantic-release strategy: .releaserc.json exists and devDependencies include semantic-release, @semantic-release/npm, @semantic-release/github, and @semantic-release/changelog/git. ADR 006/007/014 document that semantic-release is the sole release orchestrator; package.json’s version field (1.0.5) is intentionally not kept in sync with each release, with Git tags and GitHub Releases as the real source of truth. This is the expected pattern for semantic-release and should not be treated as a stale version error.
- - ADR 014 (Version Control and Release Strategy): Clearly states trunk-based development on main, Conventional Commits as the commit standard, a single unified CI/CD workflow for quality + releases, semantic-release-based automated publishing from CI on pushes to main, and local pre-push parity with CI. The observed configuration of .github/workflows/ci-cd.yml, package.json scripts, and Husky hooks exactly matches this ADR, demonstrating strong alignment between documentation and implementation.
- Minor/non-blocking observations
- - PR quality runs: The CI workflow also runs on pull_request to main to provide early feedback, while semantic-release is correctly disabled on PR events. The instructions emphasize push-to-main as the trigger for releases, but do not explicitly forbid PR quality runs; this is a reasonable enhancement that does not affect automated deployment behavior.
- - No evidence of deprecated tools or warnings: Recent run logs and dependency versions (e.g., actions v4, Husky v9, ESLint 9, Node >=18.18) indicate that the stack is modern and not relying on known-deprecated components.

**Next Steps:**
- Keep docs and pipeline configuration in sync: when adjusting the CI matrix, ci-verify:full script contents, or security tooling, update docs/ci-cd-pipeline.md and (if materially changed) docs/decisions/014-version-control-and-release-strategy.accepted.md so contributors and automated assessments continue to have a single accurate reference.
- Optionally clarify PR behavior in ADR 014: add a brief note that the CI workflow also runs on pull_request to main for quality feedback only and never runs semantic-release on PR events. This will help new contributors understand why PRs trigger the pipeline without producing releases.
- Optionally monitor pre-push performance on typical contributor machines: if contributors find pre-push checks consistently slow, consider targeted optimizations inside ci-verify:full (e.g., avoiding redundant work or tuning duplication thresholds) while preserving full parity with CI so that pre-push remains a reliable gate.

## FUNCTIONALITY ASSESSMENT (95% ± 95% COMPLETE)
- 1 of 21 stories incomplete. Earliest failed: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
- Total stories assessed: 21 (0 non-spec files excluded)
- Stories passed: 20
- Stories failed: 1
- Earliest incomplete story: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
- Failure reason: Most technical aspects of Story 003.0-DEV-FUNCTION-ANNOTATIONS are thoroughly implemented and validated by passing tests: core unified rule and aliases, function detection across JS/TS constructs, advanced @req detection heuristics, configurable scope and exportPriority, precise error locations, robust error handling, documentation-backed behavior, and extensive test framework callback exclusion logic (with ADR 013 accepted).

However, the story’s explicit requirement REQ-ISSUE-5-RESOLUTION and its corresponding acceptance-criteria/DoD items are not met. The story still marks the issue-closure checkbox as unchecked, and git history shows no evidence that `gh issue close 5 --comment "<message>"` has been run with a version-referencing comment. Because at least this acceptance criterion remains unmet, the story cannot be considered fully implemented, so the assessment status is FAILED.

**Next Steps:**
- Complete story: docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md
- Most technical aspects of Story 003.0-DEV-FUNCTION-ANNOTATIONS are thoroughly implemented and validated by passing tests: core unified rule and aliases, function detection across JS/TS constructs, advanced @req detection heuristics, configurable scope and exportPriority, precise error locations, robust error handling, documentation-backed behavior, and extensive test framework callback exclusion logic (with ADR 013 accepted).

However, the story’s explicit requirement REQ-ISSUE-5-RESOLUTION and its corresponding acceptance-criteria/DoD items are not met. The story still marks the issue-closure checkbox as unchecked, and git history shows no evidence that `gh issue close 5 --comment "<message>"` has been run with a version-referencing comment. Because at least this acceptance criterion remains unmet, the story cannot be considered fully implemented, so the assessment status is FAILED.
- Evidence: [
  {
    "type": "story-file",
    "details": "Story file docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md exists and matches the provided specification, including acceptance criteria and requirements such as REQ-FUNCTION-DETECTION, REQ-ANNOTATION-REQ-DETECTION, REQ-TEST-CALLBACK-EXCLUSION, and REQ-ISSUE-5-RESOLUTION. The acceptance-criteria checkbox for Issue #5 Resolution remains unchecked.",
    "path": "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"
  },
  {
    "type": "tests",
    "details": "All Jest tests pass: `npm test -- --runInBand --verbose` -> 54 test suites, 467 tests, 0 failures. Multiple suites explicitly reference Story 003.0 and its requirements (e.g., tests/rules/require-story-annotation.test.ts, tests/rules/require-req-annotation.test.ts, tests/utils/req-annotation-detection.test.ts, tests/rules/require-story-helpers*.test.ts, tests/rules/require-story-core*.test.ts, tests/rules/require-story-utils.test.ts).",
    "command": "npm test -- --runInBand --verbose"
  },
  {
    "type": "core-rule-implementation",
    "details": "The unified function-level rule and aliases are implemented. tests/integration/require-traceability-aliases.integration.test.ts (referenced in the Jest output) verifies that 'traceability/require-traceability' and the alias rule keys 'traceability/require-story-annotation' and 'traceability/require-req-annotation' share the same behavior for missing traceability and for @supports/@story+@req, satisfying REQ-ANNOTATION-REQUIRED.",
    "path": "tests/integration/require-traceability-aliases.integration.test.ts"
  },
  {
    "type": "function-detection",
    "details": "tests/rules/require-story-annotation.test.ts and tests/rules/require-req-annotation.test.ts contain passing cases tagged [REQ-FUNCTION-DETECTION]. They cover FunctionDeclaration, FunctionExpression, MethodDefinition, TSDeclareFunction, TSMethodSignature, anonymous arrow callbacks in higher-order functions (excluded), and named arrow functions (required), satisfying REQ-FUNCTION-DETECTION.",
    "path": "tests/rules/require-story-annotation.test.ts"
  },
  {
    "type": "advanced-req-detection",
    "details": "tests/utils/req-annotation-detection.test.ts is tied to Story 003.0 and [REQ-ANNOTATION-REQ-DETECTION]. It exercises linesBeforeHasReq, parentChainHasReq, fallbackTextBeforeHasReq, hasReqInAdvancedHeuristics, and hasReqAnnotation for both positive and negative paths. All these tests pass, fulfilling REQ-ANNOTATION-REQ-DETECTION and its requirement for dedicated unit tests.",
    "path": "tests/utils/req-annotation-detection.test.ts"
  },
  {
    "type": "configurable-scope-and-export-priority",
    "details": "tests/rules/require-story-annotation.test.ts and tests/rules/require-req-annotation.test.ts include ruleTester runs for scope and exportPriority options. They demonstrate behavior for exported-only enforcement, non-exported enforcement, and restricting scope to specific node types. All tests pass, satisfying REQ-CONFIGURABLE-SCOPE and REQ-EXPORT-PRIORITY.",
    "path": "tests/rules/require-story-annotation.test.ts"
  },
  {
    "type": "typescript-support",
    "details": "TypeScript-specific constructs are covered by passing tests tagged [REQ-TYPESCRIPT-SUPPORT] in tests/rules/require-story-annotation.test.ts, tests/rules/require-req-annotation.test.ts, and tests/utils/annotation-checker.test.ts. These validate TSDeclareFunction, TSMethodSignature, and TS function expressions, satisfying REQ-TYPESCRIPT-SUPPORT and the Integration acceptance criterion for JS/TS/mixed codebases.",
    "paths": [
      "tests/rules/require-story-annotation.test.ts",
      "tests/rules/require-req-annotation.test.ts",
      "tests/utils/annotation-checker.test.ts"
    ]
  },
  {
    "type": "error-location-and-handling",
    "details": "helpers in src/rules/helpers/require-story-helpers.ts (getReportedFunctionName, getNameNodeForReport, resolveAnnotationTargetNode, reportMissing, reportMethod) are thoroughly tested in tests/rules/require-story-helpers.test.ts, tests/rules/require-story-core.test.ts, and tests/rules/require-story-core.autofix.test.ts. Tests confirm correct error anchoring at function names, safe handling when JSDoc is malformed or missing, and non-crashing behavior when dependencies fail. This supports REQ-ERROR-LOCATION, Quality Standards, User Experience, and Error Handling acceptance criteria.",
    "paths": [
      "src/rules/helpers/require-story-helpers.ts",
      "tests/rules/require-story-helpers.test.ts",
      "tests/rules/require-story-core.test.ts",
      "tests/rules/require-story-core.autofix.test.ts"
    ]
  },
  {
    "type": "test-callback-exclusion-implementation",
    "details": "REQ-TEST-CALLBACK-EXCLUSION is largely implemented:\n- src/rules/helpers/require-story-helpers.ts defines TEST_FUNCTION_NAMES including Jest/Mocha/Vitest names and lifecycle hooks: it, test, describe, suite, fit, ftest, fdescribe, fsuite, xit, xtest, xdescribe, xsuite, context, specify, before, after, beforeEach, afterEach, beforeAll, afterAll. Member-expression `.concurrent` variants are supported via TEST_FUNCTION_CONCURRENT_PROP = 'concurrent'.\n- isTestFrameworkCallback() returns true for anonymous arrow callbacks to these functions (unless excludeTestCallbacks is false).\n- requiresOwnFunctionAnnotation() uses isTestFrameworkCallback(), nested function detection, and anonymity to decide whether a given function must carry its own annotation.\n- shouldProcessNode() integrates requiresOwnFunctionAnnotation with scope/exportPriority and the excludeTestCallbacks option.\n- tests/rules/require-story-helpers.test.ts includes numerous tests tagged [REQ-TEST-CALLBACK-EXCLUSION] verifying default exclusion for it, beforeEach, afterEach, beforeAll, afterAll, suite, context, specify, and explicit re-enabling when excludeTestCallbacks: false; bench is intentionally always checked.\n- tests/rules/require-story-annotation.test.ts has a large valid case that demonstrates default exclusion working across Jest/Mocha/Vitest (including bench nested inside describe) and an additional ruleTester run explicitly for the excludeTestCallbacks option.\nAll these tests pass, showing comprehensive coverage of test frameworks per the ADR and most of the story’s REQ-TEST-CALLBACK-EXCLUSION details.",
    "paths": [
      "src/rules/helpers/require-story-helpers.ts",
      "tests/rules/require-story-helpers.test.ts",
      "tests/rules/require-story-annotation.test.ts"
    ]
  },
  {
    "type": "adr-013-status",
    "details": "docs/decisions/013-exclude-test-framework-callbacks.proposed.md has been updated to status: accepted (2025-12-09). It documents the excludeTestCallbacks decision and explicitly lists covered frameworks and functions. It also clarifies that Vitest's `bench` callbacks are intentionally NOT globally excluded (only nested anonymous bench callbacks benefit indirectly via nested-anonymous exclusion), which matches the current implementation and tests.",
    "path": "docs/decisions/013-exclude-test-framework-callbacks.proposed.md"
  },
  {
    "type": "issue-5-requirement",
    "details": "The story encodes REQ-ISSUE-5-RESOLUTION and an acceptance criterion requiring that after the release containing excludeTestCallbacks, GitHub issue #5 is closed via `gh issue close 5 --comment \"<message>\"` with a version reference. In docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md, both the Acceptance Criteria item and the Definition of Done checkbox for this action remain unchecked, indicating this step is not yet done.",
    "path": "docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md"
  },
  {
    "type": "git-history-issue-5",
    "details": "Recent git history mentioning issue #5 only shows documentation and ADR work, not actual closure of the GitHub issue via gh CLI:\n\n`git log --oneline -n 50 --grep \"issue #5\"`:\n- b98b04b docs(stories): move issue #5 resolution to story 003.0 and expand test framework coverage\n- 821812e docs(stories): specify gh command for closing issue #5\n- 1af1191 docs(stories): clarify external tracking for issue #5 resolution in branch annotations story\n- c9c888b docs(stories): clarify issue #5 resolution requires closing issue\n- dce7b93 docs(decisions): add bench and concurrent test framework variants to ADR 013\n- 2d026ad docs: document test callback exclusion proposal for issue #5\n\nThere is no commit showing `gh issue close 5 --comment ...` being executed or any other evidence in-repo that GitHub issue #5 has actually been closed with the required comment. Combined with the still-unchecked checkboxes in the story, this indicates REQ-ISSUE-5-RESOLUTION is not satisfied.",
    "command": "git log --oneline -n 50 --grep \"issue #5\""
  }
]
