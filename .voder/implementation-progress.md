# Implementation Progress Assessment

**Generated:** 2025-12-05T11:46:43.599Z

![Progress Chart](./progress-chart.png)

Projection: flat (no recent upward trend)

## IMPLEMENTATION STATUS: COMPLETE (96% ± 18% COMPLETE)

## OVERALL ASSESSMENT
All assessment dimensions meet or exceed their required thresholds, and the system is production-ready under the documented constraints and decisions. Functionality is strong with 15 of 16 stories fully satisfied and the remaining one only having minor auto-fix edge nuances left, not core behavior gaps. Code quality, testing, and execution are in excellent condition: strict linting, formatting, and type-checking are enforced locally and in CI; tests cover rules, CLI behavior, performance, and smoke scenarios with high traceability back to stories and requirements. Documentation is extensive and accurate for both end users and maintainers, while dependencies, security posture, and version control/CI-CD practices are consistently aligned with the ADRs and story requirements, including true continuous deployment via semantic-release. Any remaining work items are polish-level only, not blockers.

## NEXT PRIORITY
Focus on closing the remaining minor auto-fix edge cases and polishing any small duplication or overly defensive error-handling paths so that the last story and code quality findings are fully resolved.



## CODE_QUALITY ASSESSMENT (94% ± 18% COMPLETE)
- Code quality in this project is excellent. Linting, formatting, type-checking, duplication checks and security tools are all configured, wired through npm scripts, enforced via Husky hooks and CI, and currently passing. Complexity and size limits are stricter than common defaults, duplication is very low, and there are no broad quality-check suppressions in production code. Remaining issues are minor (small duplications and a few conservative error-swallowing spots) rather than structural problems.
- Tooling is comprehensive and passing:
- `npm run lint -- --max-warnings=0` passes for `src` and `tests` using ESLint v9 flat config with `@eslint/js` and `@typescript-eslint/parser`.
- `npm run type-check` (`tsc --noEmit -p tsconfig.json`) passes with `strict: true` and coverage of `src` and `tests`.
- `npm run format:check` passes; Prettier is consistently applied to TS source and tests.
- `npm run duplication` passes with jscpd showing ~1.04% duplicated lines and ~1.89% duplicated tokens across 80 TS/MD/JSON files, well under the configured 3% threshold.
- Jest tests run correctly (spot check: `tests/plugin-setup.test.ts` passes under `npm test`).
- Quality gates and workflow are well integrated:
- `package.json` defines strong quality scripts: `lint`, `format`, `type-check`, `duplication`, `check:traceability`, `ci-verify`, `ci-verify:full`, `security:secrets`, audits, etc.
- `.husky/pre-commit` runs `lint-staged` (Prettier + ESLint on staged files), meeting the fast pre-commit quality requirement.
- `.husky/pre-push` runs `npm run ci-verify:full` plus `npm run security:secrets`, mirroring CI checks locally.
- `.github/workflows/ci-cd.yml` defines a single CI/CD pipeline that on push to `main` runs full quality verification and then semantic-release, followed by a smoke test of the published package. This implements true continuous deployment with no manual gates.
- Complexity, file/function size, and magic numbers are tightly controlled:
- ESLint rules for production JS/TS: `complexity: ["error", { max: 18 }]`, `max-lines-per-function: ["error", { max: 55 }]`, `max-lines: ["error", { max: 300 }]`, `no-magic-numbers` enforced with sane exceptions, and `max-params: ["error", { max: 4 }]`.
- Lint passes under these strict thresholds, which are tighter than the default complexity=20 and more aggressive than the ratcheting ADR originally specified.
- Tests have a separate override that disables complexity/size/magic-number rules; this is scoped to test files only and is a deliberate, reasonable relaxation.
- Code structure and clarity in key slices are strong:
- Core rule helpers (`src/rules/helpers/require-story-core.ts`, `require-story-visitors.ts`, `valid-annotation-format-validators.ts`) are decomposed into small, focused functions with clear naming and responsibilities, and make good use of dependency injection.
- Maintenance CLI (`src/maintenance/cli.ts`) has clean control flow, clear separation of argument parsing, command dispatch, and error handling, and meaningful exit codes.
- No “god objects”, no excessively long functions, and no deeply nested conditionals were observed in these modules; they all pass the configured ESLint thresholds.
- Production code does not import test frameworks or contain mock/test logic.
- Naming and comments are domain-specific and intent-revealing, with systematic traceability annotations (`@story`, `@req`, `@supports`).
- Disabled checks, AI slop, and temporary artifacts:
- No `@ts-nocheck`, `@ts-ignore`, or file-wide `/* eslint-disable */` comments were found in the inspected production helpers; ESLint passes with `max-warnings=0`, indicating no pervasive suppressions.
- Test-specific relaxations are confined to the test override in `eslint.config.js`, not applied to production code.
- jscpd-reported clones are mostly in tests; remaining clones in production helpers are small intra-file repetitions rather than large copy-paste blocks.
- No `.patch`, `.diff`, `.rej`, `.bak`, `.tmp`, or `*~` files are present; `scripts/` contents are all referenced from `package.json` and/or CI, with a `validate-scripts-nonempty.js` guard.
- Comments and documentation are specific and accurate; there is no evidence of generic AI-generated boilerplate or placeholder code.

**Next Steps:**
- Refactor small duplicated patterns in rule helpers where practical:
- Use the jscpd report to target minor intra-file clones in `src/rules/helpers/require-story-visitors.ts` and `src/rules/helpers/require-story-core.ts`.
- Extract tiny shared helpers for repeated reporting/visitor wiring logic, while staying within current `max-lines-per-function` and `complexity` limits.
- This is an incremental improvement; current duplication levels are already low.
- Improve observability for swallowed rule-helper errors:
- In `coreReportMissing` and `coreReportMethod` (`require-story-core.ts`), consider replacing `catch { /* noop */ }` with either:
  - A debug-only log behind an env flag (e.g. `TRACEABILITY_DEBUG`), or
  - A short comment making the intentional error swallowing explicit and explaining when to instrument for debugging.
- This preserves safety in normal lint runs while easing diagnosis of unexpected failures.
- Optionally ratchet duplication thresholds once refactors land:
- After reducing the few remaining production duplicates, lower the `jscpd` threshold from 3% to 2% in the `duplication` script and confirm `npm run duplication` passes.
- If still comfortably below threshold, consider a final target around 1–1.5% to align the tool’s configured expectations with the project’s actual (low) duplication.
- Perform a quick repo-wide scan for targeted suppressions:
- Run a search over `src` and `tests` for `eslint-disable`, `@ts-nocheck`, and `@ts-ignore`.
- For any occurrences:
  - Ensure they are minimal and tightly scoped.
  - Add or verify explanatory comments documenting why they are necessary.
  - Where feasible, refactor code or types to remove the need for suppression.
- This keeps technical debt from accumulating in hidden pockets.

## TESTING ASSESSMENT (97% ± 19% COMPLETE)
- Testing for this project is excellent: it uses established frameworks (Jest + ts-jest and ESLint RuleTester), all tests pass, coverage is high and enforced by thresholds, tests are isolated and clean with strong traceability back to stories and requirements. Remaining gaps are minor: a few complex helper branches are not fully covered, and some tests are a bit implementation-aware or verbose.
- Framework & configuration: Jest is used via the canonical npm script (`npm test` → `jest --ci --bail`), with ts-jest for TypeScript. ESLint’s RuleTester is used extensively for rule tests. The Jest config (jest.config.js) is clear, non-interactive, and sets explicit coverage thresholds (branches ≥80%, others ≥90%).
- Execution & pass rate: Running `npm test` completes successfully: 38 suites, 292 tests, all passed. `npm test -- --coverage` also passes. The default test command is non-interactive (no watch mode) and finishes in seconds, satisfying the 100% pass and non-interactive requirements.
- Coverage quality: Coverage is high and above thresholds: overall ~96.7% statements, ~84% branches, ~99.6% functions, ~96.7% lines. Jest enforces global thresholds and they are met. Most submodules (rules, maintenance tools, utils) are very well covered; a few helper modules have lower branch coverage (e.g., `require-story-utils.ts`, `reqAnnotationDetection.ts`, `require-test-traceability-helpers.ts`) but are still reasonably exercised.
- Isolation, temp directories & repo cleanliness: Tests never write into tracked project directories. Filesystem operations use OS temp dirs (os.tmpdir + mkdtemp) and clean up with rmSync in finally/afterAll or via a dedicated helper. Examples include maintenance and perf tests, plus `tests/utils/temp-dir-helpers.ts`. No tests modify repository files; all temporary state is isolated and cleaned up, satisfying the strict isolation requirements.
- CLI & integration behavior: Integration tests spawn ESLint’s CLI and the maintenance CLI via `child_process.spawnSync`, always with explicit arguments and stdin, and no interactive prompts. This validates real-world behavior (exit codes, messages) while remaining non-interactive and deterministic.
- Structure, readability, and naming: Test files are well-organized by domain (`rules`, `maintenance`, `config`, `integration`, `perf`, `utils`). File names match content (e.g., `require-story-annotation.test.ts`, `maintenance/cli.test.ts`, `perft/maintenance-large-workspace.test.ts`). Test names describe behavior clearly and often include requirement IDs (e.g., `[REQ-MAINT-SAFE] dry-run does not modify files and exits 0`). Tests follow a clear arrange–act–assert flow, typically testing one coherent behavior per case.
- Traceability in tests: Almost every test file carries story-level JSDoc headers with `@supports` (and often `@story`/`@req`) pointing directly to `docs/stories/*.story.md` and requirement IDs. Describe blocks mention the corresponding story (e.g., "Story 009.0-DEV-MAINTENANCE-TOOLS"), and many test names include `[REQ-...]` prefixes. The `require-test-traceability` rule is itself tested to enforce this structure, so traceability is excellent and machine-parseable.
- Error handling, edge cases, and performance: Tests cover both happy paths and failures: CLI error behavior, invalid flags, missing arguments, invalid formats, dry-run safety, non-existent roots, invalid annotations/paths, malformed prefixes, etc. There are dedicated *edgecases* suites for several rules. Performance tests build large synthetic workspaces in temp dirs and assert upper time bounds, ensuring the maintenance tools remain fast and scalable while keeping generous thresholds (<5s) to avoid flakiness.
- Test helpers & reuse: Shared helpers improve testability: temp dir creation/cleanup, shared TypeScript RuleTester options, and a reusable annotation-checker test runner. These keep tests DRY, readable, and focused on behavior instead of plumbing.
- Behavior vs implementation: Most tests assert observable outcomes (exit codes, console output, ESLint diagnostics, autofix results). Some rule tests (especially error-reporting) are more implementation-aware (checking exact message templates and meta fields). Given this is an ESLint plugin, that level of detail is largely appropriate, though it modestly tightens coupling to internal structures.
- Minor improvement areas: (1) Add targeted tests for currently uncovered helper branches (e.g., rare configuration or error paths) to push branch coverage for utilities like `require-story-utils.ts` and `reqAnnotationDetection.ts` closer to the rest of the codebase; (2) factor out some of the more complex test setup (e.g., large-workspace generators, synthetic AST scaffolding) into additional helpers to make individual tests even more declarative; (3) tidy a few stale comments (e.g., in `cli-error-handling.test.ts`) so they accurately describe what the tests now do.

**Next Steps:**
- Add small, focused tests for specific uncovered branches reported by Jest (e.g., lines in `src/rules/helpers/require-story-utils.ts`, `src/utils/reqAnnotationDetection.ts`, and `src/rules/helpers/require-test-traceability-helpers.ts`). Aim to cover unusual input and configuration combinations rather than increasing test file size in existing suites.
- Refactor heavy setup logic in performance and error-reporting tests into additional helper utilities under `tests/utils/` (e.g., a shared large-workspace factory, or a helper to create synthetic ESLint contexts/ASTs), so each test reads more like a scenario and less like plumbing code.
- Review and update misleading or outdated comments (such as the placeholder-style comment in `tests/cli-error-handling.test.ts`) so they reflect the actual behavior under test and don’t confuse future contributors.
- Where auto-fix expectations are very detailed, double-check that they correspond to explicit requirements (e.g., exact message wording or fix layout). If not required by the stories, consider loosening tests slightly (e.g., checking key phrases rather than full strings) to reduce unnecessary coupling while still validating behavior.
- As new features or rules are added, continue to apply the existing testing patterns: Jest + RuleTester, OS tempdirs with cleanup, non-interactive CLI spawning, high coverage with threshold enforcement, and full traceability via `@supports` annotations and story/REQ-referenced test names. This will maintain the current high level of test quality.

## EXECUTION ASSESSMENT (96% ± 18% COMPLETE)
- Execution quality is excellent. The TypeScript ESLint plugin and its maintenance CLI build cleanly, all tests (including integration, performance, and smoke tests) pass locally, and the packaged plugin/CLI behave correctly when installed into a fresh project. Runtime error handling, input validation, and performance characteristics are well thought out and thoroughly exercised by tests.
- Build & type-checking are solid: `npm run build` (tsc) and `npm run type-check` both succeed, with tsconfig correctly targeting Node/CommonJS and emitting to `lib` as expected by package.json.
- The Jest test suite is comprehensive: `npm test` runs 38 suites and 292 tests, all passing under strict coverage thresholds (branches 80%, functions/lines/statements 90%), indicating broad behavioral coverage.
- Static quality gates pass: `npm run lint` (ESLint with max-warnings=0) and `npm run format:check` (Prettier) both succeed, suggesting no obvious code smells that would translate into runtime issues.
- Plugin runtime behavior is well validated: `src/index.ts` dynamically loads rule modules with robust error handling and fallback rules, and integration tests (including ESLint CLI spawning) confirm that rules register and enforce traceability as intended.
- The maintenance CLI behaves correctly at runtime: `runMaintenanceCli` dispatches to subcommands (`detect`,`verify`,`report`,`update`), enforces argument validation, and uses explicit exit codes; Jest tests and perf tests confirm correct outputs, exit codes, and timing under synthetic large workspaces.
- The end-to-end smoke test is particularly strong evidence: `npm run smoke-test` packs the library, installs it into a fresh temp project, verifies the plugin loads, checks ESLint config integration, and runs `traceability-maint` on both success and error paths (including invalid `--format`), all passing.
- Runtime input validation and error handling are explicit and tested: flag parsing rejects invalid `--format` values with clear errors and exit status, rule loading errors are logged and converted into ESLint diagnostics, and filesystem errors in story resolution are caught and surfaced via status objects rather than crashing.
- Performance and resource management are appropriate for a CLI/plugin: synchronous filesystem traversal with caching (`fileExistStatusCache`) avoids N+1-style repeated IO; perf tests assert detect/report complete within 5 seconds on a moderate workspace, and test/smoke infrastructure cleans up temporary directories and tarballs reliably.
- Additional CI-style local check `npm run ci-verify:fast` (type-check, traceability check, duplication scan, focused Jest runs) passes, showing that more stringent runtime-related quality checks also succeed in this environment.

**Next Steps:**
- Add a convenience script (e.g., `"verify:local": "npm run build && npm test && npm run lint && npm run format:check && npm run smoke-test"`) so contributors can easily rerun the full runtime-validation chain in one command.
- Extend the smoke test or add an auxiliary one to also exercise `traceability-maint verify` and `traceability-maint update --dry-run` in a freshly installed project, mirroring how `detect` and `report` are already validated.
- Document expected performance characteristics and recommended CLI usage patterns (e.g., typical `--root` values, approximate runtime on large repos) in user docs so end users understand runtime behavior on real-world codebases.

## DOCUMENTATION ASSESSMENT (97% ± 18% COMPLETE)
- User-facing documentation for `eslint-plugin-traceability` is extensive, accurate, and closely aligned with the implemented functionality and release process. Links, packaging, and licensing are all consistent and correctly configured. Traceability annotations and their user documentation are especially strong, with only minor opportunities to further streamline navigation and clarify that example story paths are consumer-side, not internal docs.
- README.md is present, well-structured, and user-focused. It covers installation (Node >=18.18.0, ESLint v9+), configuration, available rules, the maintenance CLI, testing, and security posture. The instructions match implementation details in src/ and package.json (e.g., rule names, CLI subcommands, npm scripts).
- README includes the required Attribution section: “Created autonomously by voder.ai” with a correct link to https://voder.ai.
- User-facing documentation is clearly separated into root-level files and user-docs/: README.md, CHANGELOG.md, SECURITY.md, and user-docs/ (api-reference, ESLint 9 setup guide, examples, migration guide). Internal project docs in docs/ and docs/decisions/ are not linked from user-facing docs and are excluded from the npm package via package.json.files, preserving the boundary between user and project documentation.
- All documentation links use proper Markdown syntax and point only to published files. README links to user-docs/*.md and CHANGELOG.md; user-docs/api-reference.md links to migration-guide.md; CHANGELOG.md links back to user-docs paths. All referenced targets exist and are included in package.json.files ("README.md", "LICENSE", "SECURITY.md", "user-docs", "CHANGELOG.md"). No plain-text doc paths are used where links are appropriate, and code/config references correctly use backticks rather than links.
- User-facing docs do not link to internal project docs or prompts. Searches of README.md, user-docs/*.md, and CHANGELOG.md show no Markdown links into docs/ or prompts/. Example story paths like `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` appear only inside code examples (backticked or in fenced code blocks) and are clearly presented as consumer project paths, not as links into this repository’s internal documentation.
- Versioning and changelog strategy is correctly documented and implemented. The project uses semantic-release (confirmed by .releaserc.json and devDependencies), and CHANGELOG.md explicitly tells users to consult GitHub Releases for current versions. Historical manual entries up to 1.0.5 match package.json.version, and README reiterates that GitHub Releases is authoritative, avoiding stale hard-coded version numbers in the docs.
- API documentation in user-docs/api-reference.md is detailed and aligned with code. For each rule, it documents description, options, defaults, severity, and examples. Spot checks against src/rules (e.g., require-story-annotation, require-req-annotation, valid-annotation-format, require-test-traceability) show that option names, allowed values, defaults, and behaviors match the actual implementation and schema definitions.
- The ESLint 9 Setup Guide (user-docs/eslint-9-setup-guide.md) accurately reflects modern ESLint flat-config usage and shows working examples for JavaScript, TypeScript, mixed projects, tests, and monorepos. These examples are consistent with how the plugin is exported in src/index.ts (default export with configs.recommended/strict) and with peer dependency constraints in package.json.
- Examples (user-docs/examples.md) provide runnable snippets that match the documented behavior: flat-config setups using traceability.configs.recommended/strict, direct ESLint CLI usage with rule flags, and a test traceability example that aligns with the require-test-traceability rule’s expectations (file-level @supports, story reference in describe, [REQ-...] prefixes).
- The migration guide (user-docs/migration-guide.md) accurately documents changes from 0.x to 1.x: strict .story.md extension enforcement, expanded validation rules, introduction of @supports for multi-story code, and the optional prefer-implements-annotation helper. These features exist in code (valid-story-reference.ts, valid-annotation-format.ts, prefer-implements-annotation.ts) and match the described behavior.
- SECURITY.md is a user-facing security policy that clearly explains how to report vulnerabilities, supported versions (tied to latest releases via semantic-release), and guarantees for production dependency security. It correctly states that the published package currently has no runtime dependencies and describes the use of npm audit and dry-aged-deps, consistent with package.json scripts and README’s security section.
- License consistency is clean: LICENSE contains a standard MIT license; package.json declares "license": "MIT" using a valid SPDX identifier; there are no conflicting license files or package.json files. This satisfies project-wide licensing requirements.
- Code traceability annotations are pervasive and correctly formatted. Named functions and significant logic branches in src/index.ts, src/rules/*.ts, and src/maintenance/cli.ts are annotated with @story/@req and @supports tags referencing docs/stories paths and requirement IDs. The dedicated npm script npm run check:traceability executes scripts/traceability-check.js and currently passes, indicating that annotations are present, parseable, and consistent across the codebase.
- Public API behavior and configuration are well-documented, including the maintenance API and the traceability-maint CLI. The user-docs/api-reference.md “Maintenance API and CLI” section documents functions like detectStaleAnnotations, updateAnnotationReferences, batchUpdateAnnotations, verifyAnnotations, generateMaintenanceReport, and the CLI commands detect/verify/report/update with parameters, behavior, JSON/text output and exit codes. This matches the exported maintenance API in src/index.ts and implementation under src/maintenance/*.ts.
- User-facing decision documentation is clear for end users where it matters: the adoption of semantic-release and GitHub Releases (CHANGELOG.md), and the multi-style annotation strategy (@story/@req vs @supports) with an optional migration rule (migration-guide and API reference). Breaking changes and migration paths for consumers are explained; deprecated patterns are not abruptly removed but guided through optional tooling like prefer-implements-annotation.

**Next Steps:**
- Enhance navigation by linking each rule listed in the README “Available Rules” section directly to the corresponding heading anchor in user-docs/api-reference.md (for example, linking traceability/require-story-annotation to the relevant section). This will make it easier for users to jump from the overview to detailed configuration docs.
- Add a short clarifying note (once, in README or the top of user-docs/api-reference.md) explicitly stating that example paths like `docs/stories/003.0-DEV-FUNCTION-ANNOTATIONS.story.md` represent story files in the *consumer’s* project documentation tree and are not part of the published eslint-plugin-traceability package. This will avoid any potential confusion about internal vs external docs.
- Optionally add a brief “Documentation Overview” subsection near the top of README that summarizes when to use each user-docs file (ESLint 9 Setup Guide, API Reference, Examples, Migration Guide) and links to them. This would further improve discoverability for new users without changing any existing content or structure.

## DEPENDENCIES ASSESSMENT (98% ± 19% COMPLETE)
- Dependencies are in excellent health: all used packages install cleanly, are compatible, have no known high‑severity production vulnerabilities, the lockfile is tracked, and dry-aged-deps reports no safe mature upgrade candidates under the 7‑day policy. No immediate dependency changes are required.
- package.json is well-structured for an ESLint plugin: runtime dependency is expressed via peerDependencies (eslint^9), all other tooling is in devDependencies, and a comprehensive set of npm scripts (build, test, lint, type-check, deps:maturity, audit:*, safety:deps, etc.) ensures tools are always run via a central contract.
- package-lock.json exists and is committed to git (`git ls-files package-lock.json` → `package-lock.json`), providing a single, canonical lockfile for reproducible installs. No other lockfiles (yarn.lock, pnpm-lock.yaml) are tracked, avoiding conflicts.
- `npm install --ignore-scripts` completed successfully and reported `up to date, audited 981 packages` with `found 0 vulnerabilities`, and produced no `npm WARN deprecated` messages, indicating that the current dependency set installs cleanly and does not rely on obviously deprecated packages.
- `npx dry-aged-deps --format=xml` shows 5 outdated dev dependencies (`@typescript-eslint/parser`, `@typescript-eslint/utils`, `dry-aged-deps`, `prettier`, `ts-jest`), but all of them are `<filtered>true</filtered>` due to age (<7 days) and the summary reports `<safe-updates>0</safe-updates>`. Under the configured thresholds (minAge 7 days, minSeverity "none" for both prod and dev), there are no safe, mature upgrade candidates, which is considered an optimal state by the assessment policy.
- `npm audit --omit=dev --audit-level=high` returns `found 0 vulnerabilities`, confirming there are currently no known high-severity vulnerabilities in the production dependency tree, matching the project’s documented security guarantees.
- `npm ls --all` succeeds without fatal errors, showing a coherent dependency tree. UNMET OPTIONAL DEPENDENCY entries (e.g., node-notifier, ts-node, platform-specific bindings) are optional extras of upstream tools and not required by this project’s own code, so they do not indicate broken or mismanaged dependencies here.
- The project uses explicit `overrides` for historically problematic transitive dependencies (glob, http-cache-semantics, ip, semver, socks, tar), and `npm ls` shows these as overridden, which is a proactive measure to keep the tree on safer versions.
- Internal documentation (`docs/dependency-health.md`) describes and matches the actual setup: dry-aged-deps is used in advisory mode with 7-day / "none" thresholds, npm audit is used to gate production dependencies, and dev-only risks are handled via dedicated audit scripts and CI artifacts. This alignment between documentation and observed tool output indicates a mature dependency management process.

**Next Steps:**
- No version upgrades are required right now because dry-aged-deps reports `<safe-updates>0</safe-updates>` and all newer versions are filtered by age; continue to treat any future dry-aged-deps recommendations (where `<filtered>false</filtered>` and `current < latest`) as mandatory upgrade candidates when they appear.
- When making any manual dependency changes (adding or updating tools), validate the new state using the existing scripts: at minimum `npm run deps:maturity -- --format=json --check` (project standard), `npm audit --omit=dev --audit-level=high`, and relevant `audit:*` / `safety:deps` scripts, to keep health consistent with current policies.
- If you ever modify or remove entries in the `overrides` block, re-run `npm audit --omit=dev --audit-level=high` and `npx dry-aged-deps --format=xml` to ensure you haven’t reintroduced vulnerable or immature transitive versions into the dependency tree.

## SECURITY ASSESSMENT (96% ± 18% COMPLETE)
- Security posture is excellent and production‑ready. Dependency vulnerabilities (prod and dev) are currently at 0 for high/critical severity, mature versions are enforced via dry‑aged-deps, secrets handling is robust with secretlint and correct .env practices, and CI/CD has strong, automated security gates before semantic‑release publishes. Historical bundled npm/glob/brace‑expansion issues are fully remediated and documented as historical incidents only. No blocking security issues were found.
- Existing incidents are well‑documented and resolved:
  - `docs/security-incidents/SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` plus related incident files record prior high‑severity issues in `@semantic-release/npm`’s bundled `npm/glob/brace-expansion`.
  - That known error is explicitly marked as resolved after upgrading to `semantic-release@25.0.2` and `@semantic-release/npm@13.1.2`.
  - The incident explains that vulnerabilities were dev‑only, isolated to CI release tooling, and never part of the published plugin’s runtime dependencies.
  - There are no `*.disputed.md` incidents; nothing needs audit filtering for disputed advisories.
- Dependency security and maturity are currently clean:
  - `npm install` reports `found 0 vulnerabilities`.
  - `npm audit --omit=dev --audit-level=high` → 0 vulnerabilities (production deps clean).
  - `npm audit --include=dev --audit-level=high` → 0 vulnerabilities (dev deps currently free of high‑severity issues as well).
  - `npx dry-aged-deps` output: `No outdated packages with mature versions found (prod >= 7 days, dev >= 7 days).` 
    → Under the 7‑day maturity policy, there are no pending safe upgrades; dependency set is as up‑to‑date and “dry‑aged” as policy permits.
  - `package.json` uses `overrides` for `glob`, `tar`, `http-cache-semantics`, `ip`, `semver`, `socks`; `docs/security-incidents/dependency-override-rationale.md` explains each override with advisory links and risk assessments, aligning them with mitigation of earlier advisories rather than introducing new risk.
- Security policy and procedures are explicit and match implementation:
  - `SECURITY.md` (user‑facing) states:
    - Only the latest published version is supported.
    - Releases must pass `npm audit --omit=dev --audit-level=high` (no known high‑severity vulnerabilities in production deps) before publishing.
    - Dev‑only tooling risks are separate from guarantees about the published plugin.
  - `docs/security-overview.md` details how these guarantees are enforced:
    - `npm run ci-verify:full` includes `npm audit --omit=dev --audit-level=high` as a **gating** step and `npm run audit:dev-high` + `npm run safety:deps` as **advisory**.
    - `npm run security:secrets` (secretlint) is also gating in CI and pre‑push.
  - `docs/security-incidents/handling-procedure.md` codifies how to document incidents, approve overrides, and reassess risk.
    → Policy, documentation, and actual scripts/CI are in alignment.
- CI/CD pipeline enforces strong security gates before automatic release:
  - `.github/workflows/ci-cd.yml` defines a single "CI/CD Pipeline" with `quality-and-deploy` and nightly `dependency-health` jobs.
  - For pushes and PRs to `main`, `quality-and-deploy`:
    - Runs `npm ci`.
    - Runs `npm run ci-verify:full`, which includes type-checking, linting, duplication checks, Jest tests with coverage, `npm audit --omit=dev --audit-level=high`, `npm run audit:dev-high`, `npm run safety:deps`, and traceability checks.
    - Runs `npm run security:secrets` (secretlint) as an extra gating step.
    - Uploads `ci/dry-aged-deps.json`, `ci/npm-audit.json`, and traceability reports as artifacts for incident and dependency-health analysis.
  - Only when all of the above succeed, `semantic-release` is run on `push` to `main` with proper guardrails (checks event type, branch, and matrix node version).
  - If a release is published, `scripts/smoke-test.sh` is executed to install and smoke‑test the new npm version.
  - Permissions are least‑privilege: workflow defaults to `contents: read`, job elevates just enough (`contents`, `issues`, `pull-requests`, `id-token`) for semantic-release.
  - This setup satisfies continuous deployment: every commit to `main` that passes these security and quality gates can be automatically published in the same workflow.
- Secret management is robust and correctly configured:
  - `.gitignore` ignores `.env` and related files but explicitly allows `.env.example`.
  - `.env.example` contains only commented, non‑sensitive sample values.
  - Local `.env` file exists and is 0 bytes (empty), which is fine for development and not a leak.
  - `git ls-files .env` → no output, and `git log --all --full-history -- .env` → no output:
    → `.env` is not tracked and has never been committed.
  - `npm run security:secrets` (secretlint with `@secretlint/secretlint-rule-preset-recommend`) runs successfully, scanning `"**/*"` but excluding typical generated/infra dirs. No hardcoded secrets were detected.
  - Spot checks in key source files show no embedded credentials or obvious sensitive strings.
- Code-level security aspects are appropriate for this project’s scope:
  - The project is an ESLint plugin and CLI, not a web server or database-backed application:
    - No HTTP server or HTML templating → classic XSS vectors do not apply here.
    - No database code or SQL generation → SQL injection is out of scope for current functionality.
  - CLI input handling (`src/maintenance/flags.ts`, `src/maintenance/cli.ts`) uses simple argument parsing with explicit checks and throws on invalid formats; it does not construct shell commands or call external programs based on untrusted input.
  - A scan of maintenance modules shows no use of `child_process.exec`/`spawn` exposed to user-controlled data; `child_process` is used only in CI helper scripts to run `npm audit`.
  - No use of `eval`, `Function` constructor, or other dangerous dynamic code evaluation patterns is apparent in the inspected core files.
- No conflicting dependency automation tools:
  - Searches for Dependabot and Renovate configs returned nothing:
    - No `.github/dependabot.yml` / `.github/dependabot.yaml`.
    - No `renovate.json` or `.github/renovate.json`.
    - `.github/workflows/ci-cd.yml` contains only the project’s own CI/CD pipeline; no external update bots.
  - Dependency management is handled via `npm`, `semantic-release`, `dry-aged-deps`, and manual overrides documented in `docs/security-incidents`, avoiding operational confusion from multiple automated tools.

**Next Steps:**
- Continue to use the existing **gating scripts** locally (`npm run ci-verify:full` and `npm run security:secrets`) before pushing changes, so that the same security gates enforced in CI catch issues early during development.
- When updating or adding dependencies, always:
  - Run `npx dry-aged-deps` to confirm new versions meet the 7‑day maturity and no‑known‑vulnerability criteria.
  - Re‑run `npm audit --omit=dev --audit-level=high` and `npm audit --include=dev --audit-level=high` to verify both production and dev dependencies remain free of high‑severity issues before merging.
- If a future vulnerability cannot be patched immediately (especially in dev‑only tooling), follow the existing process rigorously:
  - Document it via a new or updated `docs/security-incidents/SECURITY-INCIDENT-*.md` record.
  - If you explicitly dispute an advisory, add a matching `.disputed.md` file and configure an audit filtering tool (e.g., `better-npm-audit` with `.nsprc`) so CI’s audit output remains actionable while referencing that documentation.

## VERSION_CONTROL ASSESSMENT (98% ± 19% COMPLETE)
- Version control and CI/CD for this repo are in excellent shape. The project uses trunk-based development on main, has a single unified CI/CD workflow with semantic-release-driven continuous deployment, modern Actions, strong pre-commit and pre-push hooks with full parity to CI, and avoids tracking build artifacts or CI reports. Only very minor polish is possible, mostly around documentation of existing practices.
- Working directory & push status:
- `git status -sb` shows only modified files under `.voder/` (`.voder/history.md`, `.voder/last-action.md`); per rules these are ignored, so the working tree is effectively clean.
- `git log origin/main..HEAD --oneline` returns no commits → all local commits are pushed.
- Branch is `main` (`git branch --show-current`), and `HEAD`, `origin/main`, and `origin/HEAD` all point to the same commit (`0a050d4`).
- Trunk-based development & commit quality:
- Recent history (`git log -n 15`) shows direct commits to `main` with no recent merge commits or long-lived feature branches, consistent with trunk-based development.
- Commit messages strictly follow Conventional Commits: `test: ...`, `docs: ...`, `chore: ...`, `feat: ...`, `refactor: ...` and are descriptive.
- No evidence of sensitive data or accidental secrets in commit messages from the sampled log.
- CI/CD workflow configuration:
- Single main workflow: `.github/workflows/ci-cd.yml` named `CI/CD Pipeline`.
- Triggers:
  - `on.push.branches: [main]` → CI/CD runs on every commit to `main`.
  - `on.pull_request.branches: [main]` → quality checks on PRs.
  - `on.schedule` (daily cron) for dependency health.
- Jobs:
  - `quality-and-deploy` (main CI/CD job).
  - `dependency-health` (runs only on scheduled events for dependency audits).
- No separate build vs publish workflows; all quality checks and releases happen in the `quality-and-deploy` job.
- CI quality gates (implemented checks):
- `quality-and-deploy` job steps:
  - `Checkout code` using `actions/checkout@v4`.
  - `Setup Node.js` using `actions/setup-node@v4` with `node-version: 22.14.0` and npm cache.
  - `Validate scripts non-empty` via `node scripts/validate-scripts-nonempty.js`.
  - `Install dependencies` via `npm ci`.
  - `Run full CI verification` via `npm run ci-verify:full`.
  - `Run secret scanning` via `npm run security:secrets`.
- `ci-verify:full` in `package.json` runs:
  - `npm run check:traceability` (internal traceability checks).
  - `npm run safety:deps` and `npm run audit:ci` (dependency safety and audit).
  - `npm run build` (TypeScript compile via `tsc -p tsconfig.json`).
  - `npm run type-check` (`tsc --noEmit`).
  - `npm run lint-plugin-check` and `npm run lint -- --max-warnings=0` (ESLint checks).
  - `npm run duplication` (jscpd duplication detection).
  - `npm run test -- --coverage` (Jest tests with coverage in CI mode).
  - `npm run format:check` (Prettier check on `src/**/*.ts`, `tests/**/*.ts`).
  - `npm audit --omit=dev --audit-level=high`.
  - `npm run audit:dev-high` (dev dependency audit).
- This provides broad coverage: build, tests, lint, type-check, formatting check, duplication, traceability, and multiple security scans.
- Continuous deployment & publishing (semantic-release):
- Semantic-release configuration present in `.releaserc.json`:
  - `branches: ["main"]`.
  - Plugins: `@semantic-release/commit-analyzer`, `@semantic-release/release-notes-generator`, `@semantic-release/changelog`, `@semantic-release/npm` (with `"npmPublish": true`), and `@semantic-release/github`.
- Workflow step `Release with semantic-release` in `ci-cd.yml`:
  - Runs only when: `github.event_name == 'push'`, `github.ref == 'refs/heads/main'`, `matrix['node-version'] == '22.14.0'`, and previous steps `success()`.
  - Uses `NPM_TOKEN` and `GITHUB_TOKEN` secrets.
  - Handles missing/invalid `NPM_TOKEN` or OTP (`EOTP`) gracefully: logs and marks `new_release_published=false` without failing CI.
  - Uses semantic-release output and a log file to determine if a new release was published and to extract the version for downstream steps.
- Post-release smoke test:
  - `Smoke test published package` runs when `steps.semantic-release.outputs.new_release_published == 'true'`.
  - Calls `scripts/smoke-test.sh` with the new version, validating the published npm package.
- No manual triggers or tag-based gating:
  - No `workflow_dispatch` for release.
  - No `on.push.tags` or conditions like `startsWith(github.ref, 'refs/tags/')` for publish.
  - Every qualifying push to `main` is automatically evaluated by semantic-release; user-facing changes (feat/fix with appropriate semantics) trigger automatic npm publish and GitHub Release creation.
- Latest workflow run inspected (`19961384160`) shows semantic-release running and correctly deciding that recent commits (tests/docs/chore/refactor only) do not warrant a release.
- Actions versions & deprecation status:
- `.github/workflows/ci-cd.yml` uses:
  - `actions/checkout@v4` (current).
  - `actions/setup-node@v4` (current).
  - `actions/upload-artifact@v4` (current).
- No use of deprecated `v1`/`v2` variants or deprecated Actions like `CodeQL v3`.
- Tail of workflow logs (run `19961384160`) shows no warnings about deprecated Actions or workflow syntax.
- `actionlint` is present in devDependencies, indicating the workflows are validated by tooling when changed.
- Post-deployment verification:
- After semantic-release successfully publishes a new version, `Smoke test published package` installs and runs tests via `scripts/smoke-test.sh` against that specific version.
- This provides automatic post-publish verification of the actual npm package, not just the repo source.
- If no new release is published (`new_release_published=false`), this step is skipped, which is correct behavior.
- Pre-commit hook (fast, basic checks):
- `.husky/pre-commit` contents:
  - Runs `npx lint-staged` with `set -e`.
- `lint-staged` configuration in `package.json`:
  - For `src/**/*.{js,jsx,ts,tsx,json,md}` and `tests/**/*.{js,jsx,ts,tsx,json,md}`:
    - `prettier --write` (auto-formatting).
    - `eslint --fix` (lint + auto-fix).
- Satisfies pre-commit requirements:
  - Includes **automatic formatting** (Prettier) on staged files.
  - Includes **linting** on staged files (ESLint) → fulfills “lint OR type-check” requirement.
  - Limited to changed files, so expected to run quickly (<10 seconds in typical cases).
  - Does not run slow checks (build/test), avoiding commit-time friction.
- Pre-push hook (comprehensive CI-equivalent checks):
- `.husky/pre-push` contents:
  - `set -e`.
  - `npm run ci-verify:full`.
  - `npm run security:secrets`.
  - Echoes completion message.
- This directly mirrors the CI pipeline:
  - CI runs `npm run ci-verify:full` followed by `npm run security:secrets` in `quality-and-deploy`.
  - Pre-push runs the exact same sequence, ensuring **full parity** between local checks and CI.
- Meets requirements for pre-push:
  - Runs build, tests, lint, type-check, format:check, audits, duplication, and traceability plus secret scan.
  - Heavy but appropriate for pre-push (not pre-commit), preventing pushes that would fail CI.
  - Uses only `npm run` scripts, respecting the centralization contract.
- Hook tooling & installation:
- Husky is configured using the modern approach:
  - `.husky/` directory with hook files tracked in git.
  - `package.json` includes `"prepare": "husky"` script so hooks are installed on `npm install`/`npm ci`.
- No deprecated Husky configs (e.g., `.huskyrc`, `husky.config.js`) or `husky install` warnings.
- Hooks execute `npm` scripts and `npx lint-staged`, all non-interactive.
- Satisfies the requirement that hooks are automatically installed and up to date with tooling.
- Repository structure & .gitignore hygiene:
- `.gitignore`:
  - Ignores typical dependencies and caches (`node_modules/`, coverage, `.npm`, `.eslintcache`, etc.).
  - Ignores build outputs: `lib/`, `build/`, `dist/`.
  - Ignores generated CI artifacts and reports: `ci/`, `jscpd-report/`, temporary Jest/ESLint output files, coverage temp dirs, and specific script report files.
  - Ignores Voder report artifacts (e.g., `.voder-*.json`, `.voder-jscpd-report/`) but **does not** ignore the `.voder/` directory itself.
- Tracked files via `git ls-files`:
  - Only `src/**/*.ts` (source), `tests/**/*.ts`/`.test.ts`, configs, scripts, docs.
  - No built JS or `.d.ts` in `lib/` or elsewhere; build artifacts are not committed.
  - No tracked `dist/`, `build/`, or `out/` directories.
  - No tracked `*-report.(md|html|json|xml)`, `*-output.(md|txt|log)`, or `*-results.(json|xml|txt)` except those explicitly ignored (CI artifacts) which are not tracked.
- `.voder/` directory:
  - Present and versioned; contains assessment history (`history.md`, `plan.md`, progress logs, and story XMLs).
  - Complies with the requirement that `.voder/` is **not** in `.gitignore` and is tracked, while separate top-level Voder report outputs are ignored.
- Overall structure is clean and well-organized: `src/`, `tests/`, `scripts/`, `docs/`, `user-docs/`, plus root configs and metadata.
- CI pipeline history & stability:
- `get_github_pipeline_status` last 10 runs for `CI/CD Pipeline (main)`:
  - 9 successes, 1 failure in the recent list, with subsequent runs succeeding.
  - Latest run (`19961384160` on commit `0a050d4`) succeeded, including all quality and release steps.
- Indicates a generally stable CI/CD pipeline with issues resolved promptly when they appear.
- Versioning strategy & documentation alignment:
- `package.json` version is `1.0.5` while git tags show `v1.11.0` as the latest release.
- ADRs `docs/decisions/004-automated-version-bumping-for-ci-cd.md`, `006-semantic-release-for-automated-publishing.accepted.md`, and `007-github-releases-over-changelog.accepted.md` confirm intentional use of semantic-release and GitHub Releases as the source of truth.
- CHANGELOG.md is maintained by semantic-release via the `@semantic-release/changelog` plugin.
- This is standard and correct semantic-release practice; the stale `package.json` version is expected and not an issue.
- No significant penalties found:
- No use of deprecated GitHub Actions or CI features; current versions are used.
- No manual approvals, tag-based release triggers, or external release automation; everything is driven from this CI.
- No generated build artifacts or CI reports committed to git.
- Pre-commit and pre-push hooks both exist, are properly scoped, and match CI exactly on critical checks.
- Repository follows trunk-based development with clean history and clear, conventional commit messages.

**Next Steps:**
- Document the **expected runtime** of `npm run ci-verify:full` and `npm run security:secrets` (used by the pre-push hook) in `CONTRIBUTING.md` or an existing contributor guide so new contributors understand that pushes run a comprehensive check and can plan accordingly.
- Optionally add a lighter, developer-invoked script (e.g., `npm run ci-verify` for a subset of checks such as build + unit tests + lint) for faster local feedback during iteration, while keeping Husky’s pre-push hook on `ci-verify:full` to preserve strict CI parity.
- When modifying GitHub workflows, run `actionlint` (already in devDependencies) as part of local validation to catch any future syntax or deprecation issues early; consider adding a `npm run ci:lint-workflows` script wired to `actionlint` for discoverability.

## FUNCTIONALITY ASSESSMENT (94% ± 95% COMPLETE)
- 1 of 16 stories incomplete. Earliest failed: docs/stories/008.0-DEV-AUTO-FIX.story.md
- Total stories assessed: 16 (0 non-spec files excluded)
- Stories passed: 15
- Stories failed: 1
- Earliest incomplete story: docs/stories/008.0-DEV-AUTO-FIX.story.md
- Failure reason: This story is very close to fully implemented: core auto-fix behavior for missing @story annotations and safe @story path suffix normalization is present, thoroughly tested, and well-documented. The require-story-annotation rule correctly supports configurable templates and a working autoFix toggle, and valid-annotation-format implements safe, minimal suffix-only fixes with a code path that honors an autoFix flag internally. However, REQ-AUTOFIX-SELECTIVE is not completely met because valid-annotation-format’s JSON schema does not declare an autoFix option and sets additionalProperties: false, so any ESLint configuration that tries to use `{ autoFix: false }` for this rule will be rejected as invalid. This means the auto-fix toggle for valid-annotation-format is not actually usable from normal ESLint configuration, contradicting both the story requirement and the user documentation. Due to this discrepancy, the overall story cannot be marked as fully PASSED.

**Next Steps:**
- Complete story: docs/stories/008.0-DEV-AUTO-FIX.story.md
- This story is very close to fully implemented: core auto-fix behavior for missing @story annotations and safe @story path suffix normalization is present, thoroughly tested, and well-documented. The require-story-annotation rule correctly supports configurable templates and a working autoFix toggle, and valid-annotation-format implements safe, minimal suffix-only fixes with a code path that honors an autoFix flag internally. However, REQ-AUTOFIX-SELECTIVE is not completely met because valid-annotation-format’s JSON schema does not declare an autoFix option and sets additionalProperties: false, so any ESLint configuration that tries to use `{ autoFix: false }` for this rule will be rejected as invalid. This means the auto-fix toggle for valid-annotation-format is not actually usable from normal ESLint configuration, contradicting both the story requirement and the user documentation. Due to this discrepancy, the overall story cannot be marked as fully PASSED.
- Evidence: Tests: `npm test -- --runInBand --verbose` passes all 38 suites including `tests/rules/auto-fix-behavior-008.test.ts` and `tests/rules/valid-annotation-format.test.ts`, confirming core auto-fix behavior for `require-story-annotation` and `valid-annotation-format` works as described.,REQ-AUTOFIX-MISSING / core auto-fix behavior:
  - `src/rules/require-story-annotation.ts` sets `meta.fixable: "code"` and wires options `annotationTemplate`, `methodAnnotationTemplate`, and `autoFix` into visitors via `buildVisitors`.
  - `src/rules/helpers/require-story-visitors.ts` passes `annotationTemplate` / `methodAnnotationTemplate` and `autoFix` to `reportMissing` / `reportMethod`.
  - `src/rules/helpers/require-story-helpers.ts` implements `getAnnotationTemplate`, `shouldApplyAutoFix`, `buildTemplateConfig`, and uses `createAddStoryFix` / `createMethodFix` from `require-story-core` to build actual ESLint fixes.
  - `src/rules/helpers/require-story-core.ts`’s `createAddStoryFix` and `createMethodFix` insert a JSDoc `@story` comment immediately before the target/function/method node without modifying executable code.
  - `tests/rules/auto-fix-behavior-008.test.ts` verifies auto-fix for missing `@story` on FunctionDeclaration, FunctionExpression, MethodDefinition, TSDeclareFunction, and TSMethodSignature, and confirms already-annotated code is unchanged.,REQ-AUTOFIX-FORMAT and safe suffix normalization:
  - `src/rules/valid-annotation-format.ts` has `meta.fixable: "code"` and delegates to helpers in `src/rules/helpers/valid-annotation-format-validators.ts` and `valid-annotation-utils.ts`.
  - `getFixedStoryPath` in `src/rules/helpers/valid-annotation-utils.ts` only adjusts `.story`/`.md` suffixes and explicitly bails out on dangerous paths (e.g., containing `".."`), returning `null` otherwise.
  - `reportInvalidStoryFormatWithFix` and `createStoryFix` in `valid-annotation-format-validators.ts` compute a precise text range for the `@story` value and replace only that range, leaving surrounding comment text and whitespace intact; they fall back to a non-fixing report when they cannot safely locate the value.
  - `validateStoryAnnotation` applies the suffix-only fix **only** when `fixed` is pattern-compliant and when `options.autoFix !== false`, otherwise it reports without fixing.
  - `tests/rules/auto-fix-behavior-008.test.ts` and `tests/rules/valid-annotation-format.test.ts` verify auto-fix for `.story` → `.story.md` and missing extension → `.story.md`, and verify no fix is applied for invalid/traversal cases.,REQ-AUTOFIX-TEMPLATE (configurable templates for require-story-annotation):
  - `src/rules/require-story-annotation.ts` options schema includes `annotationTemplate` and `methodAnnotationTemplate` and passes them into visitors.
  - `src/rules/helpers/require-story-visitors.ts` uses `methodAnnotationTemplate ?? annotationTemplate` for method-related nodes.
  - `src/rules/helpers/require-story-helpers.ts`’s `getAnnotationTemplate` returns either the trimmed override or the default `/** @story ${STORY_PATH} */` template.
  - `tests/rules/auto-fix-behavior-008.test.ts` case "[REQ-AUTOFIX-TEMPLATE] uses configured templates for functions and methods" asserts the output contains `/** @story CUSTOM-FN */` and `/** @story CUSTOM-METHOD */`, proving the templates are applied.,REQ-AUTOFIX-SELECTIVE for require-story-annotation:
  - `src/rules/require-story-annotation.ts` schema includes `autoFix: { type: "boolean" }` and `create` computes `const autoFix = typeof opts.autoFix === "boolean" ? opts.autoFix : true;`.
  - `src/rules/helpers/require-story-visitors.ts` passes `autoFix` down as `autoFixToggle`.
  - `src/rules/helpers/require-story-helpers.ts`’s `shouldApplyAutoFix` returns `false` only when explicitly `false`, and `buildTemplateConfig` propagates that to `allowFix`.
  - `coreReportMissing` / `coreReportMethod` in `require-story-core.ts` only set the `fix` property when `allowFix` is true; suggestions remain always available.
  - `tests/rules/auto-fix-behavior-008.test.ts` case "[REQ-AUTOFIX-SELECTIVE] does not insert annotations when autoFix is false" uses `options: [{ autoFix: false }]` and asserts `output: null` with `errors: 1`, proving diagnostics remain but fixes are disabled.,Documentation acceptance criterion:
  - `user-docs/api-reference.md` describes, under `traceability/require-story-annotation`, that when run with `--fix` the rule inserts a placeholder JSDoc `@story`, and that `annotationTemplate`, `methodAnnotationTemplate`, and `autoFix` options are available to control template content and whether fixes are applied.
  - Under `traceability/valid-annotation-format`, it explicitly describes the suffix-normalization behavior in terms of `.story`/`.md` fixes and mentions an `autoFix` option to disable these fixes, aligning with Story 008.0’s documentation requirement.,REQ-AUTOFIX-SELECTIVE for valid-annotation-format — **partially implemented / blocked by schema**:
  - Implementation wiring:
    - `src/rules/helpers/valid-annotation-options.ts` defines `AnnotationRuleOptions.autoFix?: boolean` and `ResolvedAnnotationOptions.autoFix: boolean`.
    - `resolveOptionsInternal` calls `resolveAutoFixFlag(user)` which returns `false` only when the user explicitly sets `autoFix: false`; this is stored in `resolvedDefaults.autoFix` and returned in `ResolvedAnnotationOptions`.
    - `validateStoryAnnotation` in `valid-annotation-format-validators.ts` uses `if (fixed && pathPattern.test(fixed)) { if (options.autoFix !== false) { reportInvalidStoryFormatWithFix(...); return; } reportInvalidStoryFormat(...); return; }`, meaning the auto-fix can be toggled off via `options.autoFix === false`.
  - **Schema problem (blocking external configuration):**
    - `src/rules/helpers/valid-annotation-options.ts::getRuleSchema()` returns a schema with `properties` limited to `story`, `req`, `storyPathPattern`, `storyPathExample`, `requirementIdPattern`, `requirementIdExample` and `additionalProperties: false`.
    - There is **no** `autoFix` property in this schema, even though `AnnotationRuleOptions` includes it and the logic expects it.
    - `src/rules/valid-annotation-format.ts` sets `meta.schema = getRuleSchema()`, so ESLint will reject configurations that include `autoFix` (e.g. `{ "traceability/valid-annotation-format": ["error", { autoFix: false }] }`) as invalid according to the rule schema.
    - There are no tests in `tests/rules/valid-annotation-format.test.ts` that use or validate an `autoFix` option, so this misalignment is not covered by tests.,Mismatch with story requirement and docs for valid-annotation-format autoFix option:
  - Story REQ-AUTOFIX-SELECTIVE states: "`valid-annotation-format` exposes an `autoFix` boolean option that, when set to `false`, disables suffix-normalization fixes while still reporting invalid `@story` formats."
  - `user-docs/api-reference.md` documents this `autoFix` option for `traceability/valid-annotation-format` and explains its behavior.
  - Because the rule schema does not allow `autoFix` and `additionalProperties` is `false`, users cannot actually configure this option without hitting a schema/ESLint configuration error. In practice, the `autoFix` toggle for `valid-annotation-format` is not truly exposed to users, even though internal code paths exist.,Story file under assessment:
  - `docs/stories/008.0-DEV-AUTO-FIX.story.md` is a concrete implementation story (not a map/ADR) with explicit requirements REQ-AUTOFIX-MISSING, REQ-AUTOFIX-FORMAT, REQ-AUTOFIX-SAFE, REQ-AUTOFIX-PRESERVE, REQ-AUTOFIX-TEMPLATE, and REQ-AUTOFIX-SELECTIVE. All but the last are fully satisfied; REQ-AUTOFIX-SELECTIVE is only fully satisfied for `require-story-annotation`, not for `valid-annotation-format` due to the schema issue described above.
