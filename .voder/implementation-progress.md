# Implementation Progress Assessment

**Generated:** 2025-12-18T22:10:29.036Z

![Progress Chart](./progress-chart.png)

Projection: flat (no recent upward trend)

## IMPLEMENTATION STATUS: INCOMPLETE (94% ± 18% COMPLETE)

## OVERALL ASSESSMENT
Overall implementation quality is very high across almost all dimensions, with strong code quality, testing, execution, dependency management, security posture, and version control practices. Functional behavior is also excellent, with only 1 of 22 traceable stories (028.0 annotation-placement standardization) still partially incomplete. However, the overall state is marked INCOMPLETE because the weighted average across areas is below the 95% threshold and at least one area (DOCUMENTATION) is significantly below that bar. The main remaining gaps are: user-facing documentation still linking into internal docs/ paths that are not shipped to npm (violating the required separation between user docs and internal project docs, though the content itself is accurate), SECURITY scoring slightly under the global 95% target despite being robust in practice, VERSION_CONTROL staying at the 90% baseline (no violations but not above-threshold), and the outstanding acceptance criteria for the annotation-placement story around function-level inside-brace placement and more explicit placement diagnostics. None of these are structural or architectural flaws, but they must be addressed before the project can be considered fully complete under the given standards.



## CODE_QUALITY ASSESSMENT (96% ± 18% COMPLETE)
- This project has excellent code quality. Linting, formatting, type-checking, duplication checks, and tests all pass using a modern and thoughtfully configured toolchain. Complexity, file length, and function length limits are enforced with reasonably strict thresholds. There are no broad suppressions, no test logic in production, and duplication is low and well-managed. Remaining issues are minor, mostly around fine‑grained refinements and making the few suppressions more explicit.
- All primary quality tools pass with current configuration:
- `npm run lint -- --max-warnings=0` exits 0 using ESLint v9 flat config with `@eslint/js` recommended base plus project-specific rules.
- `npm run format:check` (Prettier) exits 0 and reports all TS files in `src` and `tests` are properly formatted.
- `npm run type-check` (`tsc --noEmit -p tsconfig.json`) exits 0; `tsconfig.json` uses strict mode and includes both `src` and `tests`.
- `npm run duplication` (jscpd) exits 0 with duplicated lines at only 2.87% (below configured 3% threshold).
- `npm test -- --passWithNoTests` runs 56 Jest suites (504 tests) with all passing.
- ESLint configuration is robust and appropriately strict:
- Uses `eslint.config.js` flat config with `@typescript-eslint/parser` and `project: "./tsconfig.json"` for type-aware linting on `**/*.ts`.
- Production TS/JS rules include: `complexity: ["error", { max: 16 }]`, `max-lines-per-function: ["error", { max: 45, skipBlankLines: true, skipComments: true }]`, `max-lines: ["error", { max: 450, ... }]`, `no-magic-numbers` (with narrow exceptions), and `max-params: ["error", { max: 4 }]`.
- Tests have tailored overrides: complexity and size rules are explicitly turned off only for test files, which is a reasonable trade-off for readable tests.
- Linting passes with `--max-warnings=0`, showing the codebase complies with these constraints.
- TypeScript and type hygiene are strong:
- `tsconfig.json` uses `strict: true`, `forceConsistentCasingInFileNames: true`, and includes Node/Jest/ESLint typings.
- Both `src` and `tests` are within the TS `include` set, so production and tests are type-checked.
- No `@ts-nocheck` found in `src` or `tests`.
- Only one `@ts-ignore` is present and it appears in a test file (`tests/maintenance/detect-isolated.test.ts`), not in production code, minimizing hidden type issues.
- Duplication is well-controlled:
- jscpd report (from `npm run duplication`) shows:
  - 110 files analyzed (mostly TS, plus a few markdown/json).
  - 46 clone groups; duplicated lines 589 (2.87%), duplicated tokens 5233 (4.19%).
- The configured threshold is strict (3%), so the codebase is already below a low tolerance for duplication.
- Reported clones in `src` (e.g., `src/rules/helpers/require-story-core.ts`, `src/utils/branch-annotation-helpers.ts`) are small repeated patterns, not large repeated modules.
- Many clones are in test files and reflect intentionally similar scenarios and fixtures rather than structural design problems.
- File and function size/complexity are within healthy bounds:
- By configuration and passing lint, no non-test function exceeds 45 logical lines (excluding blank/comment lines), and no file exceeds 450 such lines.
- `complexity: ["error", { max: 16 }]` for production TS/JS is stricter than the usual default 20, indicating an intentional effort to keep functions simple.
- For test files, complexity and size limits are disabled via a dedicated override block, keeping production constraints tight while allowing expressive tests.
- Tooling and workflow quality are high:
- `package.json` defines a rich set of scripts: `build`, `lint`, `format`, `type-check`, `duplication`, `check:traceability`, `lint-plugin-check`, `safety:deps`, `audit:ci`, `check:ci-artifacts`, etc., all wired through a single script contract.
- Aggregated CI-equivalent scripts:
  - `ci-verify` and `ci-verify:full` run build, type-check, lint, duplication, traceability, tests (with coverage), dependency audits, and artifact checks in one go.
- No anti-patterns like `prelint`/`preformat` building before quality checks; tools operate directly on source files.
- Dev scripts in `scripts/` (e.g., `traceability-check.js`, `lint-plugin-check.js`, `ci-audit.js`, `smoke-test.sh`) are all referenced from `package.json`, so there are no obvious orphaned or dead scripts.
- Git hooks enforce local quality gates:
- `.husky/pre-commit` runs `npx lint-staged`, which applies Prettier and ESLint with `--fix` to staged files, satisfying the requirement for fast (<10s) auto-formatting and linting at commit.
- `.husky/pre-push` runs `npm run ci-verify:full` followed by `npm run security:secrets`, effectively mirroring the CI quality gate (build, type-check, lint, tests, duplication, audits, formatting, secret scanning) before allowing pushes.
- This setup strongly reduces the chance of CI breaks due to quality regressions.
- Production vs test code separation is clean:
- All plugin rules, utilities, and maintenance CLI logic reside under `src/` (e.g., `src/index.ts`, `src/utils/branch-annotation-helpers.ts`, `src/maintenance/cli.ts`).
- Tests reside under `tests/` (unit, integration, perf, maintenance), with Jest configured via `jest.config.js`.
- `grep -R jest src` yields no results, confirming that test tooling is not imported into production code.
- The CLI entrypoint (`src/maintenance/cli.ts`) is pure runtime code with a standard `if (require.main === module)` guard, not polluted with test hooks.
- Naming, clarity, and traceability are excellent:
- Functions and modules have clear, domain-specific names (`runMaintenanceCli`, `validateBranchTypes`, `gatherBranchCommentText`, `coreReportMissing`, `createAddStoryFix`).
- Rich JSDoc and inline comments explain **why** branches or helpers exist, not just what they do.
- Systematic traceability annotations (`@story`, `@req`, `@supports`) in production code link functions and branches directly to `docs/stories/*.story.md` and specific requirement IDs, enabling strong requirement–implementation linkage.
- Error handling is consistent and informative (`withSafeReporting`, clear CLI error messages, safe fallbacks when loading rules or reading package metadata).
- AI slop and temporary artifacts are effectively absent:
- No `.patch`, `.diff`, `.rej`, `.bak`, `.tmp`, or editor backup files appear in the tracked tree.
- No empty or near-empty implementation files; each inspected file has purposeful logic tied to requirements.
- Comments are specific, non-generic, and aligned with the plugin’s domain, with no obvious AI boilerplate or placeholder TODOs.
- Scripts are centralized through `package.json` and even include a `check:scripts` script, reinforcing the contract-for-scripts pattern. There is no sign of abandoned or one-off scripts hanging around.
- The only very minor quality concerns are:
- A single `// @ts-ignore` in a test file without an accompanying explanation; while low risk in tests, adding context or switching to `@ts-expect-error` would improve clarity.
- Some small, repeated patterns in helpers (`src/rules/helpers/require-story-core.ts`, `src/utils/branch-annotation-helpers.ts`) that could potentially be DRYed up further if they become a maintenance burden.
- A traceability-specific ESLint rule (`traceability/valid-annotation-format`) is present but commented out in config; enabling it incrementally with suppressions could further strengthen code/story alignment over time.

**Next Steps:**
- Clarify the lone type suppression in tests:
- Open `tests/maintenance/detect-isolated.test.ts` and locate the `// @ts-ignore` line.
- If the underlying type error is intentional (e.g., using invalid input to test error handling), switch to `// @ts-expect-error <short reason>` so that the expectation is explicit and fails if TS behavior changes.
- Otherwise, keep `@ts-ignore` but extend it with a brief justification comment (what condition is being tested and why the type system can be ignored here).
- Refine small duplicated patterns in production code when convenient:
- Use the jscpd report output as a guide to locate clones in `src`, especially:
  - `src/rules/helpers/require-story-core.ts` (similar missing-annotation reporting logic).
  - `src/utils/branch-annotation-helpers.ts` and its sibling helper modules (similar branch-type handling flows).
- Where two or more blocks represent the same conceptual operation, extract a small shared helper or parameterize the existing helper to eliminate duplication.
- Do this opportunistically when touching those modules for feature work or bug fixes, to keep refactors safely incremental.
- Optionally enable traceability-specific ESLint rules incrementally:
- In `eslint.config.js`, consider enabling one traceability rule at a time for TS/JS (e.g., `"traceability/valid-annotation-format": "error"`).
- Follow the prescribed incremental workflow:
  1. Enable the rule in config.
  2. Run `npm run lint` to detect violations.
  3. For each violation, add a targeted `// eslint-disable-next-line <rule>` with a `TODO` explaining what needs fixing.
  4. Commit with a message like `chore: enable traceability/valid-annotation-format with suppressions`.
- In later cycles, remove suppressions by fixing annotations, keeping the linter green at every step.
- If desired, very gradually tighten complexity/size thresholds further:
- Current production limits (`complexity` max 16, `max-lines-per-function` 45, `max-lines` 450) are already good.
- If you want even simpler functions, you could:
  - Lower complexity to 15 in one commit, run `npm run lint`, refactor only the offenders, and commit.
  - Similarly, consider reducing `max-lines-per-function` slightly (e.g., 45 → 40) once the codebase comfortably passes the current limit.
- Always use the ratcheting pattern (reduce → detect offenders → refactor → commit) to avoid large, risky refactors.
- Continue to rely on the existing scripts and hooks as the single contract:
- Maintain the `package.json` scripts as the only public interface to dev tooling (lint, test, build, quality checks).
- When introducing any new quality tool (e.g., additional security scans or specialized analyzers), add it as a script and, if it’s part of your core quality bar, integrate it into `ci-verify:full` and/or the pre-push hook.
- Keep quality checks green locally via `npm run ci-verify` or `npm run ci-verify:full` before pushing, preserving the strong CI parity already in place.

## TESTING ASSESSMENT (97% ± 19% COMPLETE)
- Testing for this project is excellent. It uses Jest + ts-jest and ESLint RuleTester appropriately, all 56 suites (504 tests) pass, coverage is very high and enforced via thresholds, tests are well-isolated with OS temp dirs and clean teardown, and there is strong story/requirement traceability throughout the test suite. Remaining issues are minor and mostly stylistic/readability-oriented.
- Test framework: Jest with ts-jest is configured in jest.config.js and package.json ("test": "jest --ci --bail"), and ESLint’s RuleTester/FlatESLint are used for rule/config tests—these are established, well-supported frameworks.
- Test execution: Running `npm test -- --runInBand --passWithNoTests=false` passes with 56/56 suites and 504/504 tests; Jest is invoked in `--ci` mode with no watch or interactivity.
- Coverage: `npm test -- --coverage --runInBand --passWithNoTests=false` reports ~96.8% statements, 86.8% branches, 99.7% functions, with Jest thresholds (80% branches, 90% others) configured and satisfied; coverage spans src/index.ts, all rules, maintenance tools, and util helpers.
- Isolation & filesystem safety: All tests that write files do so under OS temp directories (via `fs.mkdtempSync` or the shared `createTempDir` helper using `os.tmpdir()`), and they clean up using `fs.rmSync(..., { recursive: true, force: true })`. No tests write into tracked repo directories.
- Global state management: Tests that modify process state (cwd, env) and console/fs functions restore them via afterAll/afterEach and try/finally (e.g. `tests/maintenance/cli.test.ts`, `tests/cli-error-handling.test.ts`).
- Error & edge-case coverage: There are comprehensive tests for invalid configs, filesystem errors (EACCES/EIO), invalid paths and extensions, CLI error codes and messages, dry-run behavior, bad flags, and rule edge cases (e.g. complex branch annotation placement, misconfigurations).
- Test structure & readability: Test files are well-named by feature (rules, integration, maintenance, perf, config, utils) and individual tests have descriptive, behavior-focused names (often including requirement IDs). Some large RuleTester files are dense but still logically structured.
- Determinism & performance: Tests are deterministic, with synthetic data generation but no randomness; performance tests explicitly assert generous but bounded time budgets and still pass, and total suite time is ~10s, acceptable for CI.
- Traceability: Almost all test files include `@supports` headers referencing specific story markdown files and requirement IDs; describe blocks and test names reference stories (e.g. “Story 009.0-DEV-MAINTENANCE-TOOLS”) and `[REQ-...]` IDs, giving excellent requirement-to-test mapping.
- Minor issues: A few test files are very large and complex (especially some rule tests), and perf tests necessarily contain loops and more logic than typical unit tests; these are minor maintainability concerns rather than correctness problems.

**Next Steps:**
- Optionally split the largest RuleTester suites (e.g. for branch annotations) into smaller, scenario-focused test files to improve readability and make failures easier to localize without changing coverage.
- Use the Jest coverage report to target the few remaining uncovered branches in complex helpers (e.g. `branch-annotation-switch-helpers.ts`, some internal helper utilities) with small, focused tests, further increasing branch coverage.
- Standardize on `@supports` for new test files and, over time, migrate legacy `@story`/`@req` annotations in tests to the `@supports` format for even more consistent traceability tooling.
- When adding new rules or maintenance features, mirror the existing patterns: RuleTester-based unit tests, CLI-level integration tests, and OS-tempdir-based maintenance tests, plus performance tests for any work that could scale with project size.

## EXECUTION ASSESSMENT (96% ± 18% COMPLETE)
- Execution on this project is excellent. The team runs a mature, automated CI/CD pipeline with true continuous deployment to npm, strong local hooks, comprehensive quality gates (type-checking, linting, formatting, duplication, security, traceability), and extensive Jest tests with high coverage thresholds. Processes are well-documented and match the actual tooling and workflow behavior. The only minor issues are a small doc/config mismatch around Husky wiring and the fact that a `npm test -- --runInBand` invocation can hit a 60s timeout in this assessment environment, even though the project’s own CI-quality scripts run successfully and quickly.
- Dev workflows are centralized in package.json with rich scripts for build, type-check, lint, test, format, duplication, security, and traceability (e.g., `build`, `type-check`, `lint`, `test`, `format:check`, `duplication`, `check:traceability`, `audit:ci`, `safety:deps`, `ci-verify`, `ci-verify:full`, `ci-verify:fast`). This provides a clear, consistent contract for all execution paths.
- Running `npm run ci-verify -- --runInBand` in this environment completed successfully and ran the full quality chain: type-check, lint, format:check, duplication (jscpd), check:traceability, Jest tests, audit:ci, and safety:deps. All steps passed, confirming that the main local CI-equivalent gate is green and stable.
- Jest is configured with ts-jest, Node environment, and strict global coverage thresholds (branches 80%, functions/lines/statements 90%), and the full suite passes in CI: 56/56 suites and 504/504 tests passing, including integration, rules, maintenance, and perf tests.
- A direct `npm test -- --runInBand` call from this assessment environment timed out after 60 seconds, but logs show tests progressing and the same tests run successfully within `ci-verify` and in GitHub Actions; this indicates an external timeout constraint rather than a project-side execution failure.
- TypeScript is configured strictly (`strict: true`, `forceConsistentCasingInFileNames: true`) and includes both src and tests; `npm run type-check` (tsc --noEmit) runs as part of ci-verify/ci-verify:full and completes successfully, preventing type-level regressions.
- Linting uses ESLint 9 with a flat config and is enforced with `--max-warnings=0` across src and tests; formatting is enforced via Prettier (`format:check`), and both are integrated into CI gates and local hooks (lint-staged), ensuring consistently clean code.
- Duplication is actively controlled with jscpd (`duplication` script) and a 3% threshold; a recent ci-verify run reported ~2.87% duplicated lines and passed, showing that duplication control is not only configured but also currently satisfied.
- Traceability is treated as a first-class execution concern: source files (e.g., src/index.ts) are annotated with `@story`/`@supports` referencing docs/stories/*, and `npm run check:traceability` is part of ci-verify/ci-verify:full. A recent run wrote `scripts/traceability-report.md` and exited successfully, confirming enforcement of the project’s own traceability rules.
- Security and dependency health are integrated into execution: scripts like `audit:ci`, `audit:dev-high`, `safety:deps`, and `deps:maturity` run in CI; GitHub Action logs show artifacts such as `dry-aged-deps-*.zip` and `npm-audit-*.zip` uploaded from the latest main run, and README explicitly documents the security posture for consumers.
- CI/CD is implemented as a single unified workflow (`CI/CD Pipeline`) triggered on push to main (plus PR and nightly health checks); jobs `Quality and Deploy` (for Node 18.18, 20.0, 22.14, 24.0) all run `npm run ci-verify:full` and `npm run security:secrets`, then the Node 22.14.0 job runs semantic-release and conditional post-release smoke tests. Recent GitHub run 20352068452 on main shows all matrix jobs succeeded, semantic-release ran, and the smoke test step completed successfully, demonstrating working continuous deployment.
- semantic-release is configured via `.releaserc.json` (branches: ["main"], plugins for changelog, npm publish, GitHub releases) and is wired into the CI workflow exactly as described in docs/ci-cd-pipeline.md. Versioning and publishing are fully automated on successful pushes to main with no manual tags or approval gates.
- Husky hooks are present and correctly configured: `.husky/pre-commit` runs `npx lint-staged` (Prettier + ESLint with fix on staged files), and `.husky/pre-push` runs `npm run ci-verify:full` and `npm run security:secrets`, enforcing CI parity and secret scanning before pushes.
- Execution, CI/CD, and local workflow are thoroughly documented in `docs/ci-cd-pipeline.md` and related ADRs under `docs/decisions/` (e.g., semantic-release adoption, GitHub release strategy, pre-push parity). These documents match the actual observed workflow and scripts, indicating that documented processes are truly implemented.
- There is a small documentation/config mismatch: docs/ci-cd-pipeline.md says Husky is wired via a `postinstall` script, but package.json actually uses `"prepare": "husky"` (the current recommended Husky 9 pattern). This doesn’t break execution but could confuse readers.
- Overall GitHub Actions history for the `CI/CD Pipeline` on main shows multiple recent successful runs on the same day, confirming that the pipeline is stable under ongoing changes.

**Next Steps:**
- Update docs/ci-cd-pipeline.md to match the actual Husky setup in package.json (document that Husky is wired via the `prepare` script, not `postinstall`), so new contributors have an accurate understanding of how hooks are installed.
- Add a short note to CONTRIBUTING.md or an existing testing guide (e.g., docs/jest-testing-guide.md) advising contributors to prefer `npm run ci-verify` or `npm run ci-verify:fast` for local validation instead of `npm test -- --runInBand`, and clarifying that some environments with tight timeouts may not be suitable for `--runInBand` on the full suite.
- When making future changes to the CI pipeline or npm scripts, explicitly include updates to docs/ci-cd-pipeline.md and relevant ADRs in the same pull request to prevent any configuration/documentation drift and preserve the current high standard of execution clarity.

## DOCUMENTATION ASSESSMENT (84% ± 18% COMPLETE)
- User-facing documentation for eslint-plugin-traceability is rich, accurate, and closely aligned with the actual implementation and release workflow. README, SECURITY, CHANGELOG, and user-docs provide clear installation, configuration, rule behavior, maintenance API/CLI details, migration guidance, and security guarantees. License and versioning documentation are consistent. The main issues are (1) README links pointing into internal docs/ content that is not shipped in the npm package, violating the separation between user docs and project docs and resulting in broken links for npm consumers, and (2) those links breaching the rule that user-facing docs must not link to project documentation. Aside from this, link formatting, attribution, and traceability are handled very well.
- README.md is comprehensive and up to date:
- Describes the plugin’s purpose (creating verification checkpoints via annotations) and key value proposition.
- Documents installation with exact supported versions (Node 18.18.x, 20.x, 22.14.x, 24.x; ESLint v9+), matching package.json engines and peerDependencies.
- Provides correct ESLint 9 flat-config examples (JS-only and with the plugin’s recommended presets) that match the actual API surfaces (`traceability.configs.recommended` / `strict`).
- Explains the unified function-level rule `traceability/require-traceability` and its legacy aliases in a way that matches the implementation in src/rules/require-traceability.ts.
- Includes usage for the `traceability-maint` CLI (commands detect/verify/report/update) consistent with the maintenance implementation and tests.
- Documents local quality checks (`npm test`, `npm run lint -- --max-warnings=0`, `npm run format:check`, `npm run duplication`) that all exist as scripts in package.json.
- Explains security and dependency-health posture at a high level and correctly delegates detailed policy to SECURITY.md.
- Clearly states that semantic-release manages versions, and directs users to GitHub Releases for authoritative version and changelog information, consistent with .releaserc.json and CHANGELOG.md.
- README attribution requirement is fully satisfied:
- README has an explicit "## Attribution" section with the exact required wording and link:
  - `Created autonomously by [voder.ai](https://voder.ai).`
- This matches the mandated attribution format for user-facing documentation.
- User-facing documentation structure is well organized and separated from project docs:
- Root user-facing files: README.md, CHANGELOG.md, LICENSE, SECURITY.md, CONTRIBUTING.md.
- Dedicated user-docs directory with:
  - user-docs/api-reference.md
  - user-docs/examples.md
  - user-docs/migration-guide.md
  - user-docs/traceability-overview.md
  - user-docs/eslint-9-setup-guide.md
- Internal development docs live under docs/ (including docs/stories, docs/decisions, rule docs, CI/CD documentation). These are not included in the npm "files" field and so are not part of the published package, which is correct per the separation rules.
- User-docs content is high quality, current, and aligned with the code:
- api-reference.md:
  - Documents all public rules (require-traceability, branch annotations, valid-story/req-reference, valid-annotation-format, require-test-traceability, no-redundant-annotation, prefer-supports-annotation) with descriptions, options, defaults, and examples.
  - Correctly explains the relationship between the unified rule and legacy aliases, matching the TypeScript implementation and presets.
  - Describes the Maintenance API (`detectStaleAnnotations`, `updateAnnotationReferences`, `batchUpdateAnnotations`, `verifyAnnotations`, `generateMaintenanceReport`) in line with src/maintenance/index.ts and src/maintenance/*.ts.
  - Includes a detailed description of the `traceability-maint` CLI, commands, options, and exit codes consistent with the implementation.
- examples.md:
  - Provides runnable ESLint config samples and CLI invocations that match the plugin’s API.
  - Demonstrates test traceability conventions and branch annotation behavior, including Prettier-aware else-if handling, which is backed by integration tests.
- migration-guide.md:
  - Accurately describes migration from 0.x to 1.x, including `.story.md` suffix enforcement, introduction of `@supports`, the opt-in migration rule `traceability/prefer-supports-annotation`, and redundant-annotation cleanup.
  - Uses story paths like `docs/stories/...` clearly as examples from a consumer’s project, not as files promised by this plugin.
- traceability-overview.md:
  - Clarifies which annotation forms (`@supports`, `@story`, `@req`) to use and when.
  - Points to API Reference, Examples, and Migration Guide as deeper resources.
- eslint-9-setup-guide.md:
  - Provides up-to-date ESLint 9 flat-config guidance (ESM/CommonJS, parser setup, JS/TS/mixed/monorepo patterns) aligned with current ESLint and @typescript-eslint practices.
  - Shows example package.json scripts and plugin integration consistent with package.json and the plugin configuration API.
- Link formatting inside user-docs is correct and consistent with publishing rules:
- All intra-doc references use Markdown links (e.g., `[Migration Guide](migration-guide.md)`, `[API Reference](api-reference.md)`, `[Examples](examples.md)`).
- These targets all exist under user-docs/ and that directory is included in package.json `"files"`, so these links work in the published npm package.
- Code references (files like `eslint.config.js`, `tsconfig.json`, and CLI commands like `npm run lint`) are formatted in backticks instead of Markdown links, complying with the guideline that filenames/commands should be code, not links.
- user-docs do not contain links to docs/, prompts/, or .voder/; occurrences of `docs/stories/...` are treated as literal example strings inside code blocks or inline code, not as Markdown links, which is acceptable and does not expose internal docs.
- Critical issue: README.md links into internal docs/ that are not published with the package:
- README contains at least two Markdown links into `docs/`:
  - `- traceability/require-branch-annotation rule docs: [docs/rules/require-branch-annotation.md](docs/rules/require-branch-annotation.md)`
  - `For detailed verification workflows, examples, and best practices, see the [Verification Workflow Guide](docs/verification-workflow-guide.md).`
- `docs/` is not included in `package.json` `"files"` and is internal project documentation.
- README is a user-facing document and *is* included in `"files"`, so these links will be broken for users reading the README from the published npm package.
- This violates two high-penalty rules:
  - User-facing docs must not link to project docs (`docs/`, `prompts/`, `.voder/`).
  - All documentation links in published artifacts must resolve to files shipped with the artifact.
- Aside from these links, other README references target valid shipped files (user-docs/ files, CHANGELOG.md, SECURITY.md) or external URLs.
- Versioning and changelog documentation match the actual release strategy:
- `.releaserc.json` and devDependencies include semantic-release plugins (`@semantic-release/changelog`, `@semantic-release/npm`, `@semantic-release/github`) indicating automated versioning.
- CHANGELOG.md explicitly states semantic-release is used and points users to GitHub Releases for up-to-date notes.
- Historical changelog entries (0.1.0–1.0.5) align with `package.json.version: "1.0.5"`, clarifying that further releases are managed via GitHub Releases, not this static file.
- README’s "Versioning and Releases" section reiterates that semantic-release is authoritative and that GitHub Releases contains the release history, matching the project config.
- No stale hard-coded "current version" is presented in README; user-docs speak in terms of the "1.x" series and redirect to Releases for exact versions—best practice for semantic-release projects.
- License consistency is complete and correct:
- LICENSE file contains the MIT license with copyright © 2025 voder.ai.
- package.json `"license": "MIT"` uses a standard SPDX identifier that matches the LICENSE content.
- There is only one package.json (no monorepo), and it has a license field. There are no conflicting LICENSE/LICENCE files.
- This satisfies the license declaration and consistency requirements.
- Security and dependency-health documentation for users is clear and aligned with tooling:
- SECURITY.md is explicitly marked as user-facing and describes:
  - How to report vulnerabilities (GitHub Security Advisories preferred).
  - Supported versions (latest published version via semantic-release).
  - Production dependency guarantees: CI runs `npm audit --omit=dev --audit-level=high` and only allows releases with no high-severity runtime vulnerabilities.
  - Use of dry-aged-deps to enforce a minimum age and no-vuln policy for upgrades.
  - Historical dev-only semantic-release/npm vulnerability risk and its resolution, carefully scoped so users understand runtime safety.
- README’s "Security and Dependency Health" section is consistent with SECURITY.md, summarizing the same guarantees and checks.
- package.json scripts referenced (e.g., `audit:ci`, `safety:deps`, `audit:dev-high`, `security:secrets`) exist and align with the described process.
- Code documentation and traceability annotations are strong and align with documentation:
- Named functions in sampled files (e.g., src/index.ts, src/maintenance/detect.ts) have JSDoc blocks with `@story` and `@req`, and where appropriate `@supports`, mapping code to specific stories in docs/stories and requirement IDs.
- Significant branches and error-handling logic in src/maintenance/detect.ts include inline `@story` and `@supports` annotations that match the conventions described in the user documentation (especially the Test Traceability and Branch Annotation sections).
- Tests (e.g., tests/maintenance/detect.test.ts) include header-level `@story`, `@req`, and `@supports` annotations, and individual test names carry requirement IDs in `[REQ-...]` prefixes, matching the documented expectations of `traceability/require-test-traceability`.
- This confirms that the documented traceability model is not merely aspirational; it is actively used in the implementation and tests, enabling genuine requirement-to-code-to-test traceability.
- Contributing and CI/CD documentation are accurate for users and contributors:
- CONTRIBUTING.md explains:
  - Trunk-based development with main as the single integration branch.
  - Usage of semantic-release and Conventional Commits to drive automated releases.
  - That a single unified CI/CD pipeline on pushes to main is responsible for quality checks and publishing.
  - Exact commands for quick checks (`npm run ci-verify:fast`) and full gate (`npm run ci-verify:full`), consistent with the scripts defined in package.json.
- This gives contributors clear expectations that match the actual project configuration.
- No issues with missing documentation for implemented functionality were found:
- All major user-visible features have coverage:
  - ESLint rules and presets → documented in README + api-reference.md.
  - Maintenance API and CLI → documented in README + api-reference.md.
  - ESLint 9 setup and TypeScript integration → documented in user-docs/eslint-9-setup-guide.md.
  - Migration from 0.x → 1.x → documented in migration-guide.md.
  - Traceability philosophy and FAQ → documented in traceability-overview.md.
- Where functionality is explicitly "planned but not yet implemented," the docs state that clearly for maintenance tooling (e.g., CLI focus on stale `@story` annotations only, requirement-level maintenance “planned but not yet implemented”). This avoids misleading users about non-existent features.

**Next Steps:**
- Fix README links that point into internal docs/ and would be broken in the published npm package:
- Replace:
  - `[docs/rules/require-branch-annotation.md](docs/rules/require-branch-annotation.md)`
  - `[Verification Workflow Guide](docs/verification-workflow-guide.md)`
- With one of the following strategies:
  1) Promote the relevant content into user-facing docs under `user-docs/` (e.g., `user-docs/rule-require-branch-annotation.md` and `user-docs/verification-workflow-guide.md`), include them in the `user-docs` directory (already shipped via `files`), and update README links to point to those.
  2) Or, change those in-README links to external GitHub URLs (e.g., `https://github.com/.../blob/main/docs/verification-workflow-guide.md`) clearly labelled as maintainer-focused, while directing end users primarily to `user-docs/api-reference.md` and `user-docs/examples.md`.
- Ensure there are no remaining `](docs/` links in README or any other user-facing doc after the change.
- Run a quick integrity sweep over user-facing docs to confirm link and scope correctness:
- Search README.md, CHANGELOG.md, SECURITY.md, and all files in `user-docs/` for:
  - `](docs/`, `](prompts/`, `](.voder/` to ensure no user-facing doc points at internal project docs.
  - Plain-text documentation paths like `user-docs/...` that should be clickable; convert any such occurrences (if present) to Markdown links.
- Confirm that every Markdown link to a local file in user-facing docs resolves to a path included in package.json `"files"`. Adjust either the link or the `files` list if any discrepancies are found.
- Optionally add or adjust user-facing rule and workflow docs to reduce dependency on internal docs:
- If there is substantial, helpful content in `docs/rules/require-branch-annotation.md` or `docs/verification-workflow-guide.md` that users should see, create user-focused summaries in `user-docs/` (e.g., sections in `api-reference.md` or new dedicated pages) and point README at those, reserving `docs/` for maintainer-only deep dives.
- Make sure any content promoted into `user-docs` is written from an end-user perspective and does not depend on internal project layout or maintainer workflows.
- Preserve the current semantic-release-aware versioning guidance going forward:
- Continue to avoid hard-coding specific current versions in README and user-docs (beyond generic "1.x" series), and keep directing users to GitHub Releases for authoritative version lists and changelog entries.
- When adding new guides or examples, prefer wording like “for 1.x” and link to Releases rather than pinning a specific patch version that will quickly go stale.
- When adding new user-visible features or CLI options, update the relevant user-facing docs in lockstep:
- For ESLint rules or configuration changes, update:
  - README sections on usage and rule overview.
  - user-docs/api-reference.md (rule options, defaults, and examples).
  - user-docs/examples.md for any new patterns.
- For Maintenance CLI/API extensions, update the Maintenance API/CLI section in api-reference.md and, if necessary, add new examples.
- This will help maintain the current high level of alignment between docs, implementation, and tests.

## DEPENDENCIES ASSESSMENT (97% ± 19% COMPLETE)
- Dependencies are in excellent shape. All installed packages are clean (no vulnerabilities, no deprecations reported), the lockfile is properly tracked, and `dry-aged-deps` confirms there are currently *no safe mature updates* available. Dependency checks and safety measures are well-integrated into the project’s scripts and CI flow.
- `package.json` defines only devDependencies for tooling (ESLint, TypeScript, Jest, semantic-release, dry-aged-deps, etc.) and one peerDependency `eslint: ^9.0.0`, which is appropriate for an ESLint plugin and matches the dev `eslint` version (`^9.39.1`).
- `package-lock.json` is present and **tracked in git** (`git ls-files package-lock.json` → `package-lock.json`), satisfying lockfile best practices.
- `npm install --ignore-scripts` completed successfully with `up to date, audited 981 packages in 950ms` and reported **0 vulnerabilities** and no `npm WARN deprecated` lines, indicating a healthy, non-deprecated dependency set and a consistent install.
- `npm audit --audit-level=high --omit=dev` reported `found 0 vulnerabilities`, confirming no high-severity issues in runtime dependencies. A full `npm audit` also returned `0 vulnerabilities`, so the overall tree is clean from known issues.
- `npx dry-aged-deps --format=xml` (also via `npm run deps:maturity -- --format=xml`) produced an XML report with `<total-outdated>7</total-outdated>` but **`<safe-updates>0</safe-updates>`**, and every listed package has `<filtered>true</filtered>` with `<filter-reason>age</filter-reason>` and ages of 2–6 days. With the configured `<min-age>7</min-age>` thresholds, there are currently **no safe update candidates**, which is the optimal state under the maturity policy.
- Because all potential newer versions are filtered by age (`<filtered>true</filtered>`), the policy strictly forbids upgrading them now; current versions are therefore considered **fully up-to-date** relative to the allowed safe set.
- The `overrides` section pins known-problematic transitives (`glob`, `http-cache-semantics`, `ip`, `semver`, `socks`, `tar`) to patched ranges, demonstrating proactive hardening without conflicts reported by npm.
- Dependency health is integrated into project workflows: scripts like `deps:maturity`, `safety:deps`, `audit:ci`, and composite `ci-verify` / `ci-verify:full` ensure dependency maturity and security checks run automatically as part of CI.
- No evidence was found of peer conflicts, circular dependencies, or install-time warnings; the dependency tree appears consistent and compatible with the declared Node engines (`^18.18.0 || ^20.0.0 || ^22.0.0 || >=24.0.0`).

**Next Steps:**
- No immediate dependency changes are required; you are already at the optimal state given the 7‑day maturity policy (`<safe-updates>0</safe-updates>` from `dry-aged-deps`).
- Continue to rely on `npm run deps:maturity -- --format=xml` (and the existing CI scripts that wrap it) as the source of truth for safe upgrades. When it eventually reports any packages with `<filtered>false</filtered>` and `<current> < <latest>`, upgrade those packages specifically to the `<latest>` versions it returns.
- After any future upgrades triggered by `dry-aged-deps`, re-run `npm install`, `npm run deps:maturity -- --format=xml`, and `npm audit --omit=dev --audit-level=high` to confirm that installs remain clean, there are still no safe pending updates, and no new vulnerabilities have been introduced.

## SECURITY ASSESSMENT (94% ± 19% COMPLETE)
- The project’s security posture is strong, actively monitored, and well-documented. Dependency risk is managed with npm audit and dry-aged-deps, current audits show 0 high‑severity issues (prod and dev), historical incidents are fully resolved, secrets are handled correctly, and CI/CD enforces robust security gates. There are no unaddressed moderate-or-higher vulnerabilities, so the project is not blocked by security.
- Dependency audits:
- `npm install` completed with `found 0 vulnerabilities`.
- `npm audit --omit=dev --audit-level=high` → 0 vulnerabilities (production tree clean).
- `npm audit --include=dev --audit-level=high` → 0 vulnerabilities (dev deps clean at high severity).
- `npm run audit:ci` (via `scripts/ci-audit.js`) runs `npm audit --json` and writes `ci/npm-audit.json` for CI artifacts.
- `npm run audit:dev-high` (via `scripts/generate-dev-deps-audit.js`) runs `npm audit --include=dev --audit-level=high --json`, writes to `ci/npm-audit.json`, always exits 0 (advisory, non-blocking).

Dependency maturity / update safety:
- `npm run deps:maturity` (dry-aged-deps) output: “No outdated packages with mature versions found (prod >= 7 days, dev >= 7 days).”
  This matches the documented policy: only adopt dependency versions that are ≥7 days old and vulnerability-free, so the current dependency set is at or ahead of all safe, mature baselines.
- `npm run safety:deps` (via `scripts/ci-safety-deps.js`) wraps `deps:maturity -- --format=json`, writes `ci/dry-aged-deps.json`, and exits 0 so CI always gets a machine-readable report without spurious failures.

Historical security incidents:
- `docs/security-incidents/` contains detailed records:
  - `SECURITY-INCIDENT-2025-11-18-semantic-release-bundled-npm.known-error.md` (bundled npm/glob/brace-expansion via older `@semantic-release/npm`).
  - `2025-11-17-glob-cli-incident.md` (GHSA-5j98-mcp5-4vw2, glob CLI).
  - `2025-11-18-brace-expansion-redos.md` (GHSA-v6h2-p8h4-qcjw, brace-expansion ReDoS).
  - `2025-11-18-bundled-dev-deps-accepted-risk.md` (historical accepted-risk summary).
  - `2025-11-18-tar-race-condition.md` (GHSA-29xp-372q-xqph, tar race condition; now resolved).
- These incidents:
  - Carefully distinguish dev-only tooling (semantic-release/npm in CI) from runtime dependencies shipped to users.
  - Document compensating controls (CI isolation, no use of dangerous `glob -c/--cmd`, no untrusted input into bundled tools, tight permissions, overrides for non-bundled transitive deps).
  - Are now marked resolved/historical: the known-error record explains the upgrade to `semantic-release@25.x` with `@semantic-release/npm@13.1.2`, and explicitly states that fresh `npm audit` runs (prod and dev) and `dry-aged-deps` show no remaining vulnerabilities.
- No `*.disputed.md` files exist, so there are no disputed vulnerabilities to filter and the absence of `.nsprc`, `audit-ci.json`, or `audit-resolve.json` is correct.

Overrides and hardening:
- `package.json` uses `overrides` to pin safer versions for high-risk transitive dependencies:
  - `glob: "12.0.0"`, `http-cache-semantics: ">=4.1.1"`, `ip: ">=2.0.2"`, `semver: ">=7.5.2"`, `socks: ">=2.7.2"`, `tar: ">=6.1.12"`.
- These constraints reduce exposure even if upstream packages add vulnerable versions, and align with the incident records.

Security policy and guarantees:
- `SECURITY.md` (user-facing) defines:
  - Semantic-release as the release mechanism; only the latest published version is supported.
  - The plugin has **no runtime dependencies**, and releases are blocked unless `npm audit --omit=dev --audit-level=high` passes.
  - Dev-only tooling risk is explicitly treated separately from what is shipped to users.
  - `dry-aged-deps` is used as advisory input requiring:
    - Minimum 7-day age for adopted versions.
    - Exclusion of any version with known vulnerabilities.
  - `npm run security:secrets` (secretlint) is a release-blocking secret scan.
- Internal docs (security incidents and security-overview) match the behavior encoded in CI and scripts.

Secrets management:
- `.gitignore` appropriately excludes environment files: `.env`, `.env.local`, `.env.*.local`, with `!.env.example`.
- `.env` is not tracked: `git ls-files .env` → empty, and has no history: `git log --all --full-history -- .env` → empty.
- `.env.example` exists and contains only a commented `DEBUG` example, no secrets.
- `npm run security:secrets` (secretlint) passes and is run in CI as a dedicated “Run secret scanning” step.
- Publishing tokens (`NPM_TOKEN`, `GITHUB_TOKEN`) are provided via GitHub Actions secrets; no credentials are hardcoded.

Code security (source analysis):
- No SQL or DB layer:
  - No database libraries in `package.json`.
  - No `SELECT` or SQL-like strings in `src/` or `scripts/` (grep shows 0 hits), so SQL injection is out of scope for current functionality.
- No web server or HTML rendering:
  - No Express/Fastify/HTTP frameworks or templating engines; this is an ESLint plugin and maintenance CLI, so XSS vectors are not present in implemented code.
- Child process usage is careful and non-shell-based:
  - `scripts/check-no-tracked-ci-artifacts.js`: `execFileSync("git", ["ls-files"], { encoding: "utf8" })` with fixed command/args.
  - `scripts/ci-audit.js`: `spawnSync("npm", ["audit", "--json"])`.
  - `scripts/ci-safety-deps.js`: `spawnSync("npm", ["run", "deps:maturity", "--", "--format=json"])`.
  - `scripts/generate-dev-deps-audit.js`: `spawnSync("npm", ["audit", "--include=dev", "--audit-level=high", "--json"])`.
  - `scripts/cli-debug.js`: runs the ESLint CLI via `spawnSync(process.execPath, [eslintCliPath, ...args])` with static args.
  - `scripts/lint-plugin-guard.js`: `spawnSync(process.execPath, [scriptPath, ...process.argv.slice(2)], { stdio: "inherit" })`.
  - No use of `exec()` or `eval()`: `grep -R -n "exec("` and `grep -R -n "eval("` produce no hits in `src`/`scripts`.
  - All child-process calls use fixed commands/structured arg arrays with no untrusted input, mitigating command injection risk.
- Plugin and maintenance code (`src/index.ts`, `src/maintenance/*.ts`) consists of rule registration, config, CLI argument normalization, and defensive error handling, with no direct network, file, or shell interaction beyond what ESLint and Node typically provide.

CI/CD pipeline security:
- `.github/workflows/ci-cd.yml` defines a single **CI/CD Pipeline** workflow that includes quality gates, security checks, automatic release, and post-release smoke testing:
  - Triggers:
    - `on: push: branches: [main]` (core CI/CD).
    - `on: pull_request: branches: [main]` (PR validation, no publishing).
    - `on: schedule: '0 0 * * *'` (nightly dependency-health job).
  - Permissions:
    - Global: `contents: read`.
    - `quality-and-deploy` job: `contents: write`, `issues: write`, `pull-requests: write`, `id-token: write` — minimal required for semantic-release per ADR.
  - `quality-and-deploy` steps (per Node matrix):
    - `npm ci` to install deps.
    - `npm run ci-verify:full` which performs:
      - Build, type-check, ESLint (with `--max-warnings=0`), duplication checks, traceability checks.
      - Jest tests with coverage.
      - `npm run audit:ci` and `npm run safety:deps` to produce audit/maturity artifacts.
      - Direct `npm audit --omit=dev --audit-level=high` (release-blocking production vulnerability gate).
      - `npm run audit:dev-high` for dev-only issues (non-blocking but recorded).
      - `npm run check:ci-artifacts` to prevent committing `ci/` reports.
    - `npm run security:secrets` (secretlint) as a separate, release-blocking secret scan.
    - Artifact uploads for dry-aged-deps, npm audit, traceability, Jest artifacts.
    - `semantic-release` is run only when:
      - Event is `push`, ref is `refs/heads/main`, matrix Node version is `22.14.0`, and all prior steps succeeded.
      - Handles missing/invalid `NPM_TOKEN` or OTP requirements gracefully: publishing is skipped without failing CI, preventing accidental release failures from breaking the pipeline.
    - If a new release is published, `scripts/smoke-test.sh` installs the just-published version into a temp project and validates that the plugin loads correctly.
- `dependency-health` nightly job:
  - Re-runs `npm run audit:dev-high` on Node 22.14.0 to keep dev-dependency vulnerabilities under continuous review.
- This pipeline implements **continuous deployment**: every commit to `main` that passes the full quality and security checks is automatically published (when tokens are available), with a post-publish smoke test, all within a single workflow and without manual approvals.

Conflicting dependency automation:
- No Dependabot configuration: no `.github/dependabot.yml` or `.github/dependabot.yaml` found, and no references to Dependabot in `.github/`.
- No Renovate configuration: no `renovate.json` in the repo.
- Dependency health is managed via `dry-aged-deps` and manual updates, avoiding conflicts between automation tools.

Hardcoded secrets and sensitive files:
- No API keys, tokens, or credentials are present in source files examined (`src/`, `scripts/`, root configs).
- Secretlint (`npm run security:secrets`) passes across the whole repo, which strongly indicates the absence of obvious secrets in tracked files.
- `.gitignore` excludes typical secret-bearing or machine-generated artifacts (`.env`, `ci/`, coverage, logs, .voder reports, etc.), reducing risk of committing sensitive information or noisy artifacts.

False-positive handling / audit filtering:
- There are no `.disputed.md` incident files, so no vulnerabilities are marked as false positives.
- Accordingly, there is no audit filter config (`.nsprc`, `audit-ci.json`, or `audit-resolve.json`), and `audit:ci` simply records raw `npm audit` output. This matches policy, which only mandates filtering when disputed incidents exist.

Overall conclusion:
- All active dependencies (prod and dev) are currently free of known high-severity vulnerabilities according to npm audit and dry-aged-deps.
- Historical dev-only semantic-release/npm issues have been fully resolved and are well-documented; the project now runs on a vulnerability-free release toolchain.
- Secrets are handled correctly (.env ignored, .env.example safe, secretlint in CI), and there are no hardcoded credentials.
- CI/CD enforces strong, explicit security gates and continuous deployment without manual release steps.
- No moderate-or-higher vulnerabilities remain that fall outside the documented policy or acceptance criteria, so the project is not blocked by security.

**Next Steps:**
- Add a short developer-facing note (e.g., in an internal security or CI doc) clarifying which checks are **release-blocking** vs. **advisory**: explicitly call out that `npm audit --omit=dev --audit-level=high` and `npm run security:secrets` are blocking gates, while `audit:ci`, `audit:dev-high`, and `safety:deps` are for reporting/analysis. This is already how the system behaves; documenting it helps future maintainers avoid tightening the wrong checks.
- Introduce an empty but wired-in audit filtering config (e.g., `.nsprc` or `audit-ci.json`) referenced by an additional `audit:ci:filtered` script, so that if a vulnerability is ever formally marked as disputed (`*.disputed.md`), maintainers can immediately add its advisory ID there without adding new tooling under time pressure. Keep it empty for now to preserve behavior.
- Adopt a lightweight internal checklist for future changes that touch child-process usage or external tooling (especially in `scripts/`): require validation/sanitization for any user- or environment-derived arguments and prohibit `exec`/shell-based APIs. The current code already follows these practices; making them explicit will help ensure new contributions don’t accidentally introduce command injection risks.

## VERSION_CONTROL ASSESSMENT (90% ± 19% COMPLETE)
- Version control and CI/CD for this project are in excellent shape. The repository uses trunk-based development on `main`, has a single unified CI/CD workflow with comprehensive quality gates and automated semantic-release publishing, modern GitHub Actions versions, correctly configured Husky pre-commit and pre-push hooks with full parity to CI, and no built artifacts or CI reports tracked in git. No high-penalty version-control violations were found, so the score remains at the 90% baseline.
- PENALTY CALCULATION:
- Baseline: 90%
- Total penalties: 0% → Final score: 90%
- CI/CD: Single unified workflow `.github/workflows/ci-cd.yml` runs on every push to `main`, on PRs to `main`, and on a daily schedule for dependency health, providing continuous integration and automated checks.
- CI/CD Actions versions: Uses `actions/checkout@v4`, `actions/setup-node@v4`, and `actions/upload-artifact@v4` with no deprecated v2/v3 actions or syntax warnings observed in recent logs.
- Quality gates: `quality-and-deploy` job runs `npm ci` then `npm run ci-verify:full`, which covers build, type-checking, linting (including plugin checks), duplication detection (jscpd), comprehensive Jest tests with coverage, format:check, dependency audits (production and dev), traceability checks, and a CI-artifact sanity check.
- Security scanning: Pipeline runs multiple dependency-audit scripts (`audit:ci`, `audit:dev-high`, `npm audit --omit=dev --audit-level=high`), a safety-deps script, and an explicit secret scan (`npm run security:secrets`), meeting the requirement for security scanning in CI.
- Automated publishing: CI runs `npx semantic-release` automatically on push to `main` (Node 22.14.0 matrix entry) after all quality checks pass, using `GITHUB_TOKEN` and `NPM_TOKEN` for automated npm publishing and GitHub release management (no manual tags or approvals).
- Post-deployment verification: After a successful publish, the workflow runs `scripts/smoke-test.sh` against the newly published version to validate the package as a smoke test, fulfilling post-deployment verification expectations.
- No manual approval gates: The release workflow is triggered solely by `on: push` to `main`; there is no `workflow_dispatch`, no `refs/tags` conditions, and no manual approval, fully aligning with continuous deployment requirements.
- Repository cleanliness: `git status -sb` shows only modified files in `.voder/history.md` and `.voder/last-action.md`, which are explicitly excluded from consideration; otherwise the working tree is clean and aligned with `origin/main`.
- Branching strategy: Current branch is `main`, with recent commits all on `main`, showing frequent, small, Conventional Commit-style changes consistent with trunk-based development and direct commits to the trunk.
- Remotes and push status: `origin` is set to `https://github.com/voder-ai/eslint-plugin-traceability.git`, and `git status -sb` shows `## main...origin/main` with no ahead/behind indicators, confirming all commits are pushed.
- GitHub Actions run history: Last 10 runs of “CI/CD Pipeline (main)” are all successful, including run `20352068452` against commit `c8c381d` on `main`, confirming pipeline stability over time.
- .gitignore configuration: `.gitignore` correctly ignores `node_modules/`, coverage, caches, logs, temp files, and build directories (`lib/`, `build/`, `dist/`), as well as CI artefacts and temporary reports, while keeping necessary project and documentation files tracked.
- .voder rules: `.gitignore` ignores `.voder/traceability/` and specific transient Voder-generated JSON/report directories, but not `.voder/` itself; key files like `.voder/history.md`, `.voder/implementation-progress.md`, and `.voder/last-action.md` are tracked, exactly matching the required pattern.
- No built artifacts tracked: `git ls-files` output shows no `lib/`, `dist/`, `build/`, or `out/` directories and no compiled `.js`/`.d.ts` trees alongside `src/**/*.ts`; `lib/` is ignored and build outputs are not under version control.
- No generated reports or CI artefacts tracked: Tracked files do not include `*-report.(md|html|json|xml)`, `*-output.(md|txt|log)`, or `*-results.(json|xml|txt)`; CI artefact files like `scripts/traceability-report.md` and `scripts/tsc-output.md` are explicitly ignored, preventing pollution of version control.
- No generated test projects: There are no committed generated project directories (e.g., `cli-test-project/`, `test-project-*`); all test fixtures live under `tests/fixtures/**` and are normal test assets, not generator outputs.
- Pre-commit hook: `.husky/pre-commit` runs `npx lint-staged`, which applies `prettier --write` and `eslint --fix` to staged files (as configured in `package.json`), satisfying the requirement for fast pre-commit checks that auto-format and lint without running heavy build/test steps.
- Pre-push hook: `.husky/pre-push` runs `npm run ci-verify:full` plus `npm run security:secrets`, mirroring the CI `quality-and-deploy` job’s quality gates and secret scanning, thereby enforcing comprehensive local checks before pushes.
- Hook/tooling setup: Husky is configured via a `prepare` script (`"prepare": "husky"`) with hook scripts under `.husky/`, indicating modern Husky v9-style usage and no deprecated configuration files or install commands.
- Hook/CI parity: The commands executed in pre-push (`ci-verify:full` and `security:secrets`) match the CI pipeline’s quality checks and secret scanning, ensuring that the same tools and configurations run locally and in CI, minimizing surprises.
- Commit quality: Recent commits follow strict Conventional Commits (`fix:`, `docs:`, `test:`, `refactor:`), are small and focused, and show no signs of embedded sensitive data in messages.
- Versioning strategy: Presence of `.releaserc.json` and `semantic-release` devDependency confirms automated semantic versioning; CI-only semantic-release usage matches the documented ADRs and ensures `package.json` version may lag intentionally without affecting release correctness.
- Repository structure: Source lives cleanly under `src/`, tests under `tests/`, documentation under `docs/` and `user-docs/`; no structural anti-patterns or misplaced build artefacts were observed.

**Next Steps:**
- Keep CI/pre-push parity in sync: whenever new quality checks (e.g., extra lint rules, new security tools) are added to the CI workflow, update `.husky/pre-push` to call the same scripts so local pushes continue to mirror CI behavior exactly.
- Continue updating GitHub Actions and security tooling: periodically bump `actions/*` and security-related devDependencies (audit tools, secretlint, jscpd) to their latest stable major versions and address any new deprecation or security warnings promptly.
- Maintain the “no artefacts in git” policy: if new reports or build outputs are introduced (e.g., additional coverage formats or analysis reports), add them to `.gitignore` and, if needed, extend `scripts/check-no-tracked-ci-artifacts.js` to enforce that they never get committed.

## FUNCTIONALITY ASSESSMENT (95% ± 95% COMPLETE)
- 1 of 22 stories incomplete. Earliest failed: docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
- Total stories assessed: 22 (0 non-spec files excluded)
- Stories passed: 21
- Stories failed: 1
- Earliest incomplete story: docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
- Failure reason: The story is a valid, concrete specification and is partially implemented but not fully satisfied.

What is implemented and verified:
- Branch-level support for a configurable annotationPlacement option ("before" | "inside") on traceability/require-branch-annotation, defaulting to "before" for backward compatibility (REQ-PLACEMENT-CONFIG, REQ-DEFAULT-BACKWARD-COMPAT).
- In inside mode, the rule and helpers treat annotations as the first comment-only lines inside the block bodies of if/else/else-if, loops, try/catch/finally, and switch cases, ignoring before-brace annotations for placement validation (REQ-INSIDE-BRACE-PLACEMENT, REQ-BEFORE-BRACE-ERROR). This behaviour is covered by both unit tests (branch-annotation-helpers) and rule tests (require-branch-annotation.test.ts), and by Prettier integration tests that show stable behaviour after formatting (REQ-PRETTIER-STABLE).
- Auto-fix migration for branch annotations in inside mode: existing before-branch traceability comments are removed and a placeholder @story is inserted at the correct inside-brace location with appropriate indentation (branch-annotation-story-fix-helpers.ts and the invalid tests’ output expectations). This satisfies the migration requirement for branch constructs (REQ-AUTO-FIX-MIGRATION, REQ-INDENTATION-CORRECT for branches).
- no-redundant-annotation is updated so that inside-brace branch annotations are not treated as scope-level coverage used to mark inner annotations as redundant, aligning with REQ-NON-REDUNDANT-INSIDE.
- Documentation is updated: the rule doc, README “Annotation Placement” section, and the user-facing migration guide all explain the branch-level inside placement option and how to gradually migrate from before to inside. Tests confirm no regression with the default configuration.

However, several acceptance criteria and requirements are still not met:
1) **Functions are not included in the new inside-brace standard**.
   - The story explicitly states REQ-ALL-BLOCK-TYPES ('Apply consistently to if/else/try/catch/switch/function/loop blocks') and an acceptance criterion for consistent application including function blocks.
   - Implementation limits annotationPlacement to the branch rule; function rules (require-story-annotation, require-req-annotation) do not accept or honour annotationPlacement, and the README explicitly says that inside-brace placement for function bodies is a future enhancement, not current behaviour. Thus, the standardized inside-brace placement does not yet apply uniformly across all block types as defined in the story.

2) **Error messages do not explain the placement rule**.
   - The only message, `missingAnnotation`, remains generic and does not distinguish between a truly missing annotation and an annotation present in the wrong position when annotationPlacement: "inside" is configured.
   - The story’s acceptance criterion 'Clear Error Messages' requires errors to explain the placement rule and show the correct position. Currently, diagnostics for before-only annotations in inside mode tell the user that the branch is missing a required annotation, without mentioning that their before-brace annotation is being ignored and must be moved inside the block.

3) **GitHub Issue #7 remains open**.
   - `gh issue view 7 --json state,title --jq .state+":"+.title` returns `OPEN:Inconsistent Annotation Placement Creates Visual Ambiguity`.
   - The story’s acceptance criteria and Definition of Done require 'GitHub issue #7 closed with comment referencing release version.' This external requirement is not satisfied.

4) **Story’s broader scope (all block types, including functions, and deprecation path) is only partially realized**.
   - Branch constructs (if/else/try/catch/switch/loops) satisfy the inside-brace placement standard under annotationPlacement: "inside" and are well covered by tests and documentation.
   - Function blocks still use the legacy before-function placement and are explicitly documented as such; the inside-brace placement standard has not been extended to them, contrary to the story’s REQ-ALL-BLOCK-TYPES and consistency goals.
   - The deprecation path for "before" is only described as a future plan; the option remains the default, with no explicit deprecation mechanism or warnings.

Because at least one functional requirement (uniform application to function blocks), the placement-specific error messaging, and the external GitHub issue closure are missing, the story is **not** fully implemented. Therefore the assessment status is **FAILED**.

**Next Steps:**
- Complete story: docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md
- The story is a valid, concrete specification and is partially implemented but not fully satisfied.

What is implemented and verified:
- Branch-level support for a configurable annotationPlacement option ("before" | "inside") on traceability/require-branch-annotation, defaulting to "before" for backward compatibility (REQ-PLACEMENT-CONFIG, REQ-DEFAULT-BACKWARD-COMPAT).
- In inside mode, the rule and helpers treat annotations as the first comment-only lines inside the block bodies of if/else/else-if, loops, try/catch/finally, and switch cases, ignoring before-brace annotations for placement validation (REQ-INSIDE-BRACE-PLACEMENT, REQ-BEFORE-BRACE-ERROR). This behaviour is covered by both unit tests (branch-annotation-helpers) and rule tests (require-branch-annotation.test.ts), and by Prettier integration tests that show stable behaviour after formatting (REQ-PRETTIER-STABLE).
- Auto-fix migration for branch annotations in inside mode: existing before-branch traceability comments are removed and a placeholder @story is inserted at the correct inside-brace location with appropriate indentation (branch-annotation-story-fix-helpers.ts and the invalid tests’ output expectations). This satisfies the migration requirement for branch constructs (REQ-AUTO-FIX-MIGRATION, REQ-INDENTATION-CORRECT for branches).
- no-redundant-annotation is updated so that inside-brace branch annotations are not treated as scope-level coverage used to mark inner annotations as redundant, aligning with REQ-NON-REDUNDANT-INSIDE.
- Documentation is updated: the rule doc, README “Annotation Placement” section, and the user-facing migration guide all explain the branch-level inside placement option and how to gradually migrate from before to inside. Tests confirm no regression with the default configuration.

However, several acceptance criteria and requirements are still not met:
1) **Functions are not included in the new inside-brace standard**.
   - The story explicitly states REQ-ALL-BLOCK-TYPES ('Apply consistently to if/else/try/catch/switch/function/loop blocks') and an acceptance criterion for consistent application including function blocks.
   - Implementation limits annotationPlacement to the branch rule; function rules (require-story-annotation, require-req-annotation) do not accept or honour annotationPlacement, and the README explicitly says that inside-brace placement for function bodies is a future enhancement, not current behaviour. Thus, the standardized inside-brace placement does not yet apply uniformly across all block types as defined in the story.

2) **Error messages do not explain the placement rule**.
   - The only message, `missingAnnotation`, remains generic and does not distinguish between a truly missing annotation and an annotation present in the wrong position when annotationPlacement: "inside" is configured.
   - The story’s acceptance criterion 'Clear Error Messages' requires errors to explain the placement rule and show the correct position. Currently, diagnostics for before-only annotations in inside mode tell the user that the branch is missing a required annotation, without mentioning that their before-brace annotation is being ignored and must be moved inside the block.

3) **GitHub Issue #7 remains open**.
   - `gh issue view 7 --json state,title --jq .state+":"+.title` returns `OPEN:Inconsistent Annotation Placement Creates Visual Ambiguity`.
   - The story’s acceptance criteria and Definition of Done require 'GitHub issue #7 closed with comment referencing release version.' This external requirement is not satisfied.

4) **Story’s broader scope (all block types, including functions, and deprecation path) is only partially realized**.
   - Branch constructs (if/else/try/catch/switch/loops) satisfy the inside-brace placement standard under annotationPlacement: "inside" and are well covered by tests and documentation.
   - Function blocks still use the legacy before-function placement and are explicitly documented as such; the inside-brace placement standard has not been extended to them, contrary to the story’s REQ-ALL-BLOCK-TYPES and consistency goals.
   - The deprecation path for "before" is only described as a future plan; the option remains the default, with no explicit deprecation mechanism or warnings.

Because at least one functional requirement (uniform application to function blocks), the placement-specific error messaging, and the external GitHub issue closure are missing, the story is **not** fully implemented. Therefore the assessment status is **FAILED**.
- Evidence: {
  "story_file": "docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md",
  "tests_referencing_story": [
    "tests/rules/require-branch-annotation.test.ts",
    "tests/utils/branch-annotation-helpers.test.ts",
    "tests/integration/annotation-placement-inside-prettier.integration.test.ts"
  ],
  "key_implementation_files": {
    "require_branch_annotation_rule": "src/rules/require-branch-annotation.ts",
    "branch_helpers": "src/utils/branch-annotation-helpers.ts",
    "branch_story_fix_helpers": "src/utils/branch-annotation-story-fix-helpers.ts",
    "no_redundant_annotation_rule": "src/rules/no-redundant-annotation.ts"
  },
  "core_behaviour_implemented": {
    "configuration_option_and_default": {
      "file": "src/rules/require-branch-annotation.ts",
      "snippet": "annotationPlacement: {\n  enum: [\"before\", \"inside\"],\n},\n...\nconst rawOptions: any = context.options[0] || {};\nconst _annotationPlacement: AnnotationPlacement =\n  rawOptions.annotationPlacement === \"inside\" ||\n  rawOptions.annotationPlacement === \"before\"\n    ? rawOptions.annotationPlacement\n    : \"before\";",
      "meets": [
        "REQ-PLACEMENT-CONFIG",
        "REQ-DEFAULT-BACKWARD-COMPAT",
        "Acceptance: Configuration Option",
        "Acceptance: No Regression (default = \"before\")"
      ]
    },
    "placement_rule_inside_mode": {
      "file": "src/utils/branch-annotation-helpers.ts",
      "snippets": [
        "export type AnnotationPlacement = \"before\" | \"inside\";",
        "function gatherSimpleIfCommentText(..., annotationPlacement, beforeText) { ... }",
        "function gatherCatchClauseCommentText(..., annotationPlacement, beforeText) { ... }",
        "function handleTryCatchBranch(..., { annotationPlacement, beforeText }) { ... }",
        "function handleLoopBranch(..., { annotationPlacement, beforeText }) { ... }",
        "export function gatherBranchCommentText(..., annotationPlacement: AnnotationPlacement = \"before\") { ... }"
      ],
      "tests": [
        "tests/utils/branch-annotation-helpers.test.ts – inside placement tests for loops, catch, switch, simple if",
        "tests/rules/require-branch-annotation.test.ts – valid cases with annotationPlacement: 'inside' on if, loops, switch, try"
      ],
      "meets": [
        "REQ-INSIDE-BRACE-PLACEMENT (for branch types)",
        "REQ-PLACEMENT-CONFIG",
        "Acceptance: Placement Rule (for branches)"
      ]
    },
    "position_validation_before_is_error_in_inside_mode": {
      "file": "tests/rules/require-branch-annotation.test.ts",
      "examples": [
        "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-brace annotations ignored when annotationPlacement: 'inside'",
        "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-loop annotations ignored when annotationPlacement: 'inside' for loops",
        "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-catch annotations ignored when annotationPlacement: 'inside' for CatchClause",
        "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-try annotations ignored when annotationPlacement: 'inside' for TryStatement",
        "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-else-if annotations ignored when annotationPlacement: 'inside' for else-if branch",
        "[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-case annotations ignored when annotationPlacement: 'inside' for SwitchCase"
      ],
      "behaviour": "In these cases, with options: [{ annotationPlacement: 'inside' }], the rule treats branches that only have before-brace annotations as missing and reports missingAnnotation errors.",
      "meets": [
        "REQ-BEFORE-BRACE-ERROR",
        "Acceptance: Position Validation"
      ]
    },
    "auto_fix_migration_for_branches": {
      "file": "src/utils/branch-annotation-story-fix-helpers.ts",
      "snippet": "function buildInsidePlacementStoryFixes(ctx: StoryFixContext, fixer: any): any[] {\n  const { sourceCode, node, insertPos, indent } = ctx;\n  const fixes: any[] = [];\n\n  const beforeComments = (sourceCode as any).getCommentsBefore(node) || [];\n  const removableComments = beforeComments.filter(\n    (c: any) =>\n      /@story\\b/.test(c.value) ||\n      /@req\\b/.test(c.value) ||\n      /@supports\\b/.test(c.value),\n  );\n\n  removableComments.forEach((comment: any) => {\n    fixes.push(fixer.remove(comment));\n  });\n\n  fixes.push(\n    fixer.insertTextBeforeRange(\n      [insertPos, insertPos],\n      `${indent}// @story <story-file>.story.md\\n`,\n    ),\n  );\n\n  return fixes;\n}\n\nexport function createStoryFixer(ctx: StoryFixContext) {\n  const { annotationPlacement, insertPos, indent } = ctx;\n\n  function insertStoryFixer(fixer: any) {\n    if (annotationPlacement === \"inside\") {\n      return buildInsidePlacementStoryFixes(ctx, fixer);\n    }\n\n    return fixer.insertTextBeforeRange(\n      [insertPos, insertPos],\n      `${indent}// @story <story-file>.story.md\\n`,\n    );\n  }\n\n  return insertStoryFixer;\n}",
      "test_examples": [
        "In tests/rules/require-branch-annotation.test.ts, the invalid case\n          \"[REQ-INSIDE-BRACE-PLACEMENT][REQ-BEFORE-BRACE-ERROR] before-brace annotations ignored ...\" has input with before-branch annotations and expected output *without* those comments, plus a new inside-brace placeholder.",
        "Similar migration behaviour appears for loops, try, catch, else-if, and switch-case invalid tests under annotationPlacement: 'inside'."
      ],
      "meets": [
        "REQ-AUTO-FIX-MIGRATION (for branch rules)",
        "REQ-INDENTATION-CORRECT (indent is passed into fixer and used for inserted comment)"
      ]
    },
    "no_redundant_annotation_inside_behavior": {
      "file": "src/rules/no-redundant-annotation.ts",
      "snippet": "if (DEFAULT_BRANCH_TYPES.includes(scopeNode.type)) {\n  /**\n   * Inside-brace annotations used as branch-level indicators (inside placement\n   * mode) should not be folded into scopePairs for redundancy purposes; only\n   * before-brace annotations define the covering scope here.\n   *\n   * @supports docs/stories/028.0-DEV-ANNOTATION-PLACEMENT-STANDARDIZATION.story.md REQ-NON-REDUNDANT-INSIDE REQ-PLACEMENT-CONFIG\n   */\n  const text = gatherBranchCommentText(\n    sourceCode as any,\n    scopeNode,\n    parent,\n    \"before\",\n  );\n  return extractStoryReqPairsFromText(text);\n}",
      "meets": [
        "REQ-NON-REDUNDANT-INSIDE (branch-level inside annotations are not treated as scope-level coverage)",
        "REQ-PLACEMENT-CONFIG (interacts correctly with placement modes)"
      ]
    },
    "prettier_compatibility": {
      "file": "tests/integration/annotation-placement-inside-prettier.integration.test.ts",
      "description": "Runs ESLint with traceability/require-branch-annotation:[\"error\", {\"annotationPlacement\":\"inside\"}] on Prettier-formatted code covering if/else/loops, try/catch/finally, and switch cases.",
      "assertions": "expect(result.stdout).not.toContain(\"traceability/require-branch-annotation\"); expect([0, 1]).toContain(result.status);",
      "meets": [
        "REQ-PRETTIER-STABLE",
        "Acceptance: Prettier Compatibility"
      ]
    },
    "documentation_updates": {
      "require_branch_rule_doc": {
        "file": "docs/rules/require-branch-annotation.md",
        "evidence": [
          "Section explicitly documents annotationPlacement with default \"before\" and allowed values \"before\" | \"inside\".",
          "Describes inside mode as \"first comment-only lines inside the branch block\" for if/else, loops, try/catch, switch."
        ]
      },
      "readme": {
        "file": "README.md (Annotation Placement section)",
        "snippet": "  `require-branch-annotation` supports an `annotationPlacement` option:\n  - `\"before\"` – Annotation appears **immediately before** the branch statement (default).\n  - `\"inside\"` – Annotation appears as the **first comment-only lines inside** the branch block.\n\n  In `\"inside\"` mode, the rule expects the annotation to be the first meaningful content inside blocks for `if` / `else` / loops / `try` / `catch` / `finally` / `switch` cases.\n\n...\n- **Function-level (`traceability/require-story-annotation`, `traceability/require-req-annotation`)**\n\n  Function-level rules continue to accept annotations:\n  - As JSDoc blocks immediately preceding the function, or\n  - As line comments placed directly before the function declaration or expression.\n\n  ... Future versions may introduce an **inside-brace** placement mode for function bodies...",
        "notes": "README clearly documents branch-level annotationPlacement and explicitly states that function-level rules do NOT yet support inside-brace mode."
      },
      "migration_guide": {
        "file": "user-docs/migration-guide.md",
        "section": "3.4 Inside-brace branch annotation placement (optional)",
        "content_summary": "Explains Story 028.0, shows configuration snippet with annotationPlacement: \"inside\", describes expected positions for if/else/loops/try/catch/switch, and outlines a gradual migration path from before to inside.",
        "meets": [
          "Acceptance: Documentation (for branch placement)",
          "Acceptance: Migration Guide (for branch placement)"
        ]
      }
    },
    "tests_and_regression": {
      "command": "npm test -- --ci --bail --verbose",
      "result": "Test Suites: 56 passed, 56 total; Tests: 504 passed, 504 total",
      "note": "Confirms no regression with default configuration (annotationPlacement defaults to \"before\").",
      "meets": "Acceptance: No Regression"
    }
  },
  "requirements_not_fully_met": {
    "functions_not_included_in_inside_placement_standard": {
      "require_story_annotation": {
        "file": "src/rules/require-story-annotation.ts",
        "search": "annotationPlacement",
        "result": "No matches found",
        "readme_statement": "Function-level rules continue to accept JSDoc/before-function annotations; future versions may introduce an inside-brace mode.",
        "conflict_with_story": "Story REQ-ALL-BLOCK-TYPES and acceptance criterion \"Consistent Application\" explicitly require the standard to apply uniformly to if/else/try/catch/switch/function blocks. Current implementation restricts the inside placement option to branch-level constructs only; functions are explicitly deferred to a future change."
      },
      "require_req_annotation": {
        "file": "src/rules/require-req-annotation.ts",
        "search": "annotationPlacement",
        "result": "No matches found"
      },
      "story_requirements": [
        "REQ-ALL-BLOCK-TYPES: \"Apply consistently to if/else/try/catch/switch/function/loop blocks\"",
        "Acceptance: \"Consistent Application: Rule applies uniformly to if/else/try/catch/switch/function blocks\""
      ]
    },
    "error_message_clarity_for_placement_violations": {
      "file": "src/rules/require-branch-annotation.ts",
      "message_definition": "missingAnnotation: \"Branch is missing required traceability annotation: {{missing}}. Prefer using a single @supports line...\"",
      "observation": "The message does not differentiate between 'no annotation at all' and 'annotation present but in the wrong (before-brace) position when annotationPlacement: \"inside\"'. It does not mention the inside-brace placement requirement or indicate that before-brace annotations are being ignored in inside mode.",
      "story_acceptance": "Acceptance: Clear Error Messages – \"Errors explain placement rule and show correct position\"",
      "conclusion": "Messaging remains generic and does not explicitly explain the inside-brace placement rule or guide the user about moving annotations from before-brace to inside-brace."
    },
    "github_issue_7_not_closed": {
      "command": "gh issue view 7 --json state,title --jq .state+\":\"+.title",
      "output": "OPEN:Inconsistent Annotation Placement Creates Visual Ambiguity",
      "story_acceptance": "Acceptance: Issue #7 Resolution – \"GitHub issue #7 closed with comment referencing release version\"",
      "conclusion": "External requirement is not satisfied; issue #7 remains OPEN."
    },
    "all_block_types_scope_clarity_and_examples": {
      "scope_clarity": {
        "note": "For branch types, annotation scope is implicitly 'block body from opening brace to closing brace' and is used by the branch rules. However, the story's REQ-SCOPE-CLARITY and the Definition of Done item 'All block types (if/else/try/catch/switch/function/loop) work consistently' are only fully met for branch constructs, not function blocks."
      },
      "examples_for_all_block_types": {
        "note": "Docs show examples for if and switch with inside placement; migration guide lists expected positions for all branch types. There are no examples demonstrating a standardized inside placement for function bodies, which is aligned with the current implementation (functions not yet supporting inside placement) but does not meet the story’s broader intent."
      }
    },
    "deprecation_path_for_before_mode": {
      "observation": "The implementation adds an optional 'inside' mode while keeping 'before' as the default and documented as fully supported. The story’s REQ-DEPRECATION-PATH ('Eventually deprecate \"before\" option once adoption is widespread') is a future plan and not presently implemented or signaled beyond documentation.",
      "note": "Given the story’s own migration strategy (phased roll-out), this is arguably acceptable for now, but strictly speaking the deprecation path is not yet enacted."
    }
  }
}
